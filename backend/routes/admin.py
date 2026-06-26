import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from backend.database.connection import get_db
from backend.models.schema import User, Company, StudentProfile, Resume, MockInterviewSession
from backend.utils.security import get_current_admin
from backend.utils.seeder import seed_companies
from backend.services.rag_service import seed_vector_db_with_companies

router = APIRouter(prefix="/api/admin", tags=["Admin Panel"])

class CompanyCreateUpdate(BaseModel):
    name: str
    min_cgpa: float
    required_skills: str
    eligibility: str
    pattern: str
    rounds: List[str]
    package: str
    preparation_tips: str
    faqs: List[Dict[str, str]]

def calculate_readiness_score(profile: StudentProfile, latest_resume: Optional[Resume], interviews: List[MockInterviewSession]) -> int:
    score = 0
    
    # 1. CGPA contribution (max 20)
    if profile.cgpa:
        cgpa_score = min(20, max(0, int((profile.cgpa - 5.0) * 4)))
        score += cgpa_score
        
    # 2. Resume score contribution (max 20)
    if latest_resume:
        score += int(latest_resume.resume_score * 0.20)
    else:
        score += 10 # Default base
        
    # 3. Skills count (max 20)
    skills = [s for s in profile.skills.split(",") if s.strip()] if profile.skills else []
    score += min(20, len(skills) * 2)
    
    # 4. Programming Languages (max 10)
    langs = [l for l in profile.programming_languages.split(",") if l.strip()] if profile.programming_languages else []
    score += min(10, len(langs) * 3)
    
    # 5. Certifications (max 10)
    try:
        certs = json.loads(profile.certifications) if profile.certifications else []
        score += min(10, len(certs) * 5)
    except Exception:
        pass
        
    # 6. Projects (max 10)
    try:
        projs = json.loads(profile.projects) if profile.projects else []
        score += min(10, len(projs) * 5)
    except Exception:
        pass
        
    # 7. Mock Interviews (max 10)
    completed_interviews = [i for i in interviews if i.score > 0]
    if completed_interviews:
        avg_int_score = sum(i.score for i in completed_interviews) / len(completed_interviews)
        score += int(avg_int_score * 0.10)
    else:
        score += 5 # base
        
    return min(100, score)

@router.get("/students")
def list_students(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).filter(User.is_admin == False).all()
    students_list = []
    
    for u in users:
        profile = u.profile
        latest_resume = db.query(Resume).filter(Resume.user_id == u.id).order_by(Resume.uploaded_at.desc()).first()
        interviews = db.query(MockInterviewSession).filter(MockInterviewSession.user_id == u.id).all()
        
        readiness = 0
        if profile:
            readiness = calculate_readiness_score(profile, latest_resume, interviews)
            
        students_list.append({
            "id": u.id,
            "email": u.email,
            "name": profile.name if profile else "No Profile",
            "college": profile.college if profile else "N/A",
            "branch": profile.branch if profile else "N/A",
            "cgpa": profile.cgpa if profile else 0.0,
            "readiness_score": readiness,
            "resume_uploaded": latest_resume is not None,
            "interviews_count": len(interviews),
            "created_at": u.created_at
        })
        
    return students_list

@router.get("/analytics")
def get_analytics(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).filter(User.is_admin == False).count()
    total_interviews = db.query(MockInterviewSession).count()
    total_resumes = db.query(Resume).count()
    total_companies = db.query(Company).count()
    
    # Calculate average scores
    resumes = db.query(Resume).all()
    avg_resume_score = int(sum(r.resume_score for r in resumes) / len(resumes)) if resumes else 0
    avg_ats_score = int(sum(r.ats_score for r in resumes) / len(resumes)) if resumes else 0
    
    interviews = db.query(MockInterviewSession).filter(MockInterviewSession.score > 0).all()
    avg_interview_score = int(sum(i.score for i in interviews) / len(interviews)) if interviews else 0
    
    # Compute system average readiness score
    profiles = db.query(StudentProfile).all()
    total_readiness = 0
    for p in profiles:
        user_res = db.query(Resume).filter(Resume.user_id == p.user_id).order_by(Resume.uploaded_at.desc()).first()
        user_ints = db.query(MockInterviewSession).filter(MockInterviewSession.user_id == p.user_id).all()
        total_readiness += calculate_readiness_score(p, user_res, user_ints)
        
    avg_readiness = int(total_readiness / len(profiles)) if profiles else 0
    
    # Target roles count distribution
    role_dist = {}
    for p in profiles:
        if p.target_role:
            role_dist[p.target_role] = role_dist.get(p.target_role, 0) + 1
            
    # Format role distribution for frontend chart
    role_analytics = [{"role": k, "count": v} for k, v in role_dist.items()]
    
    return {
        "total_students": total_users,
        "total_interviews": total_interviews,
        "total_resumes": total_resumes,
        "total_companies": total_companies,
        "avg_readiness_score": avg_readiness,
        "avg_resume_score": avg_resume_score,
        "avg_ats_score": avg_ats_score,
        "avg_interview_score": avg_interview_score,
        "role_distribution": role_analytics
    }

@router.post("/seed")
def seed_database_and_vectors(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    try:
        # Seed relational DB
        seed_companies(db)
        
        # Load companies from DB to seed FAISS
        companies = db.query(Company).all()
        seed_vector_db_with_companies(companies)
        
        return {"status": "success", "message": "Database and FAISS vector indexes successfully seeded."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Seeding failed: {str(e)}")

@router.post("/companies")
def create_company(
    comp_in: CompanyCreateUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Company).filter(Company.name == comp_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Company name already exists")
        
    comp = Company(
        name=comp_in.name,
        min_cgpa=comp_in.min_cgpa,
        required_skills=comp_in.required_skills,
        eligibility=comp_in.eligibility,
        pattern=comp_in.pattern,
        rounds=json.dumps(comp_in.rounds),
        package=comp_in.package,
        preparation_tips=comp_in.preparation_tips,
        faqs=json.dumps(comp_in.faqs)
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)
    
    # Sync FAISS index
    try:
        seed_vector_db_with_companies([comp])
    except Exception:
        pass
        
    return comp

@router.put("/companies/{company_id}")
def update_company(
    company_id: int,
    comp_in: CompanyCreateUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    comp = db.query(Company).filter(Company.id == company_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Company not found")
        
    comp.name = comp_in.name
    comp.min_cgpa = comp_in.min_cgpa
    comp.required_skills = comp_in.required_skills
    comp.eligibility = comp_in.eligibility
    comp.pattern = comp_in.pattern
    comp.rounds = json.dumps(comp_in.rounds)
    comp.package = comp_in.package
    comp.preparation_tips = comp_in.preparation_tips
    comp.faqs = json.dumps(comp_in.faqs)
    
    db.commit()
    db.refresh(comp)
    
    # Reindex companies to FAISS
    try:
        all_companies = db.query(Company).all()
        seed_vector_db_with_companies(all_companies)
    except Exception:
        pass
        
    return comp

@router.delete("/companies/{company_id}")
def delete_company(
    company_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    comp = db.query(Company).filter(Company.id == company_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Company not found")
        
    db.delete(comp)
    db.commit()
    return {"status": "success", "message": f"Company {company_id} deleted."}
