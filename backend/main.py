import json
import logging
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional

from backend.config import settings
from backend.database.connection import Base, engine, get_db
from backend.models.schema import User, Company, StudentProfile, Resume, MockInterviewSession, ProgressLog
from backend.utils.security import get_current_user
from backend.utils.seeder import seed_companies
from backend.services.rag_service import seed_vector_db_with_companies, reinitialize_libraries
from backend.routes.admin import calculate_readiness_score

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Database tables
Base.metadata.create_all(bind=engine)

# Include routers
from backend.routes import auth, profile, resume, companies, planner, interview, chat, admin

app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, we can lock to localhost in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(resume.router)
app.include_router(companies.router)
app.include_router(planner.router)
app.include_router(interview.router)
app.include_router(chat.router)
app.include_router(admin.router)

@app.on_event("startup")
def startup_event():
    # Attempt to reload FAISS & SentenceTransformers in case they were installed post launch
    reinitialize_libraries()
    
    # Auto-seed companies and FAISS vectors on startup if database is empty
    db = next(get_db())
    try:
        if db.query(Company).count() == 0:
            logger.info("Initializing database with default company seeds...")
            seed_companies(db)
            companies = db.query(Company).all()
            seed_vector_db_with_companies(companies)
            logger.info("Database and Vector DB seeding completed successfully.")
        else:
            # Still initialize vector db if faiss index is empty
            from backend.services.rag_service import vector_db
            if not vector_db.documents:
                logger.info("Vector DB is empty, seeding from existing companies...")
                companies = db.query(Company).all()
                seed_vector_db_with_companies(companies)
    except Exception as e:
        logger.error(f"Startup database seeding failed: {e}")
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "AI Campus Placement Strategist API is running."}

@app.get("/api/dashboard/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        return {
            "has_profile": False,
            "readiness_score": 0,
            "resume_score": 0,
            "ats_score": 0,
            "eligible_companies_count": 0,
            "today_plan": "Please complete your profile to generate a study plan.",
            "upcoming_mock_interview": None,
            "skills_gap_summary": "N/A"
        }
        
    latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
    interviews = db.query(MockInterviewSession).filter(MockInterviewSession.user_id == current_user.id).all()
    
    # Calculate readiness score
    readiness = calculate_readiness_score(profile, latest_resume, interviews)
    
    # Calculate eligible companies count
    student_skills = set()
    if profile.skills:
        student_skills.update(s.strip().lower() for s in profile.skills.split(",") if s.strip())
    if profile.programming_languages:
        student_skills.update(s.strip().lower() for s in profile.programming_languages.split(",") if s.strip())
    student_cgpa = profile.cgpa or 0.0
    companies_list = db.query(Company).all()
    
    eligible_count = 0
    for comp in companies_list:
        comp_skills_list = [s.strip().lower() for s in comp.required_skills.split(",") if s.strip()] if comp.required_skills else []
        missing_skills = [s for s in comp_skills_list if s not in student_skills]
        if student_cgpa >= comp.min_cgpa and len(missing_skills) <= 2:
            eligible_count += 1
            
    # Get study plan focus for today
    from backend.models import schema
    latest_plan = db.query(schema.StudyPlan).filter(schema.StudyPlan.user_id == current_user.id).order_by(schema.StudyPlan.created_at.desc()).first()
    today_plan = "No active plan. Go to Study Planner to generate one!"
    if latest_plan:
        try:
            plan_data = json.loads(latest_plan.plan_json)
            today_plan = plan_data.get("daily_plan", today_plan)
        except Exception:
            pass
            
    # Get last interview session score
    last_interview = db.query(MockInterviewSession).filter(
        MockInterviewSession.user_id == current_user.id,
        MockInterviewSession.score > 0
    ).order_by(MockInterviewSession.created_at.desc()).first()
    
    interview_summary = None
    if last_interview:
        interview_summary = {
            "id": last_interview.id,
            "role": last_interview.role,
            "type": last_interview.type,
            "company": last_interview.company,
            "score": last_interview.score,
            "feedback": last_interview.feedback[:100] + "..." if len(last_interview.feedback) > 100 else last_interview.feedback
        }
        
    # Skills gap summary
    skills = [s.strip() for s in profile.skills.split(",") if s.strip()] if profile.skills else []
    skills_gap = "Complete resume analysis or add target skills to verify matches."
    if profile.target_companies:
        target_comps = [c.strip().lower() for c in profile.target_companies.split(",") if c.strip()]
        # Check first target company match
        target_company = db.query(Company).filter(Company.name.ilike(target_comps[0])).first()
        if target_company:
            comp_skills = [s.strip().lower() for s in target_company.required_skills.split(",") if s.strip()]
            missing = [s for s in comp_skills if s not in student_skills]
            if missing:
                skills_gap = f"Missing {len(missing)} skill(s) for {target_company.name}: {', '.join(missing[:3])}"
            else:
                skills_gap = f"You match all core skills for {target_company.name}!"
                
    return {
        "has_profile": True,
        "readiness_score": readiness,
        "resume_score": latest_resume.resume_score if latest_resume else 0,
        "ats_score": latest_resume.ats_score if latest_resume else 0,
        "eligible_companies_count": eligible_count,
        "today_plan": today_plan,
        "upcoming_mock_interview": interview_summary,
        "skills_gap_summary": skills_gap,
        "student_name": profile.name
    }
