import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.database.connection import get_db
from backend.models.schema import User, Company, StudentProfile
from backend.utils.security import get_current_user

router = APIRouter(prefix="/api/companies", tags=["Companies & Recommendation"])

@router.get("", response_model=List[Dict[str, Any]])
def list_companies(db: Session = Depends(get_db)):
    companies = db.query(Company).all()
    result = []
    for c in companies:
        result.append({
            "id": c.id,
            "name": c.name,
            "min_cgpa": c.min_cgpa,
            "required_skills": [s.strip() for s in c.required_skills.split(",") if s.strip()] if c.required_skills else [],
            "eligibility": c.eligibility,
            "pattern": c.pattern,
            "rounds": json.loads(c.rounds) if c.rounds else [],
            "package": c.package,
            "preparation_tips": c.preparation_tips,
            "faqs": json.loads(c.faqs) if c.faqs else []
        })
    return result

@router.get("/recommendations")
def get_recommendations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    if not profile:
        return {
            "eligible": [],
            "nearly_eligible": [],
            "not_eligible": []
        }
        
    student_skills = set(s.strip().lower() for s in profile.skills.split(",") if s.strip()) if profile.skills else set()
    student_cgpa = profile.cgpa or 0.0
    
    companies = db.query(Company).all()
    
    eligible = []
    nearly_eligible = []
    not_eligible = []
    
    for comp in companies:
        comp_skills_list = [s.strip() for s in comp.required_skills.split(",") if s.strip()] if comp.required_skills else []
        comp_skills_set = set(s.lower() for s in comp_skills_list)
        
        # Calculate missing skills
        missing_skills = [s for s in comp_skills_list if s.lower() not in student_skills]
        matching_skills_count = len(comp_skills_list) - len(missing_skills)
        
        # Calculate skill match ratio
        skill_ratio = (matching_skills_count / len(comp_skills_list)) if comp_skills_list else 1.0
        
        # Calculate probability score out of 100
        prob_score = int(skill_ratio * 100)
        
        # CGPA deductions
        cgpa_gap = comp.min_cgpa - student_cgpa
        if cgpa_gap > 0:
            # Reduce probability score if CGPA doesn't meet minimum requirements
            prob_score = max(0, prob_score - int(cgpa_gap * 30))
            
        # Classify eligibility
        is_cgpa_eligible = student_cgpa >= comp.min_cgpa
        is_skills_matching = len(missing_skills) <= 2
        
        prep_suggestion = ""
        if missing_skills:
            prep_suggestion = f"Learn {', '.join(missing_skills[:3])} to match requirements."
        else:
            prep_suggestion = "You match all technical skills. Focus on mock interviews and company pattern preparation."
            
        if cgpa_gap > 0 and cgpa_gap <= 0.5:
            prep_suggestion += f" Note: CGPA is slightly below the target ({comp.min_cgpa}). Try to improve academic standing."
            
        company_data = {
            "id": comp.id,
            "name": comp.name,
            "min_cgpa": comp.min_cgpa,
            "required_skills": comp_skills_list,
            "package": comp.package,
            "probability_score": prob_score,
            "missing_skills": missing_skills,
            "preparation_suggestions": prep_suggestion
        }
        
        if is_cgpa_eligible and is_skills_matching:
            eligible.append(company_data)
        elif (is_cgpa_eligible and len(missing_skills) <= 4) or (cgpa_gap > 0 and cgpa_gap <= 0.5 and len(missing_skills) <= 2):
            nearly_eligible.append(company_data)
        else:
            not_eligible.append(company_data)
            
    # Sort each list by probability score descending
    eligible.sort(key=lambda x: x["probability_score"], reverse=True)
    nearly_eligible.sort(key=lambda x: x["probability_score"], reverse=True)
    not_eligible.sort(key=lambda x: x["probability_score"], reverse=True)
    
    return {
        "eligible": eligible,
        "nearly_eligible": nearly_eligible,
        "not_eligible": not_eligible
    }

@router.get("/{company_id}/skill-gap")
def get_skill_gap(company_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found. Please complete profile first.")
        
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    student_skills = set(s.strip().lower() for s in profile.skills.split(",") if s.strip()) if profile.skills else set()
    comp_skills_list = [s.strip() for s in company.required_skills.split(",") if s.strip()] if company.required_skills else []
    
    missing_skills = [s for s in comp_skills_list if s.lower() not in student_skills]
    
    # Generate custom suggestions based on company type and missing skills
    learning_order = []
    courses = []
    projects = []
    
    # Sort missing skills by basic priority
    # Let's say languages/DSA are high priority, frameworks medium, others low
    high_priority = []
    medium_priority = []
    low_priority = []
    
    dsa_terms = ["data structures", "algorithms", "dsa", "c++", "java", "python", "c"]
    web_terms = ["react", "angular", "javascript", "typescript", "html", "css", "node.js", "express", "django", "fastapi"]
    db_terms = ["sql", "mysql", "postgresql", "oracle", "mongodb", "redis", "dbms"]
    
    for skill in missing_skills:
        skill_l = skill.lower()
        if any(term in skill_l for term in dsa_terms):
            high_priority.append(skill)
        elif any(term in skill_l for term in web_terms) or any(term in skill_l for term in db_terms):
            medium_priority.append(skill)
        else:
            low_priority.append(skill)
            
    # Compile learning recommendations
    if high_priority:
        learning_order.append(f"Master Foundations: Study {', '.join(high_priority)}")
        courses.append({
            "name": "Data Structures & Algorithms Bootcamp",
            "platform": "LeetCode / GeeksforGeeks",
            "duration": "4-6 weeks"
        })
        
    if medium_priority:
        learning_order.append(f"Build Core Competency: Focus on {', '.join(medium_priority)}")
        # Check if database or web
        if any(any(db_t in s.lower() for db_t in db_terms) for s in medium_priority):
            courses.append({
                "name": "Complete SQL & Database Management Course",
                "platform": "Coursera / Udemy",
                "duration": "2 weeks"
            })
        if any(any(web_t in s.lower() for web_t in web_terms) for s in medium_priority):
            courses.append({
                "name": "Full Stack Web Development with React & Node",
                "platform": "freeCodeCamp",
                "duration": "4 weeks"
            })
            
    if low_priority:
        learning_order.append(f"Specialize: Gain exposure in {', '.join(low_priority)}")
        courses.append({
            "name": f"Introduction to {low_priority[0]}",
            "platform": "YouTube / Medium Tutorials",
            "duration": "1 week"
        })
        
    # Standard fallback courses if student matches most things
    if not courses:
        courses.append({
            "name": f"{company.name} Interview Preparation Series",
            "platform": "GeeksforGeeks Company Prep",
            "duration": "2 weeks"
        })
        
    # Suggested project recommendations based on company and missing skills
    if "NVIDIA" in company.name:
        projects.append({
            "title": "CUDA Parallel Matrix Multiplication",
            "description": "Accelerate mathematical computations by writing parallel kernels in CUDA C++."
        })
    elif "Google" in company.name or "Microsoft" in company.name or "Amazon" in company.name:
        projects.append({
            "title": "Scalable Distributed Key-Value Store",
            "description": "Create a REST-based distributed store featuring data replication, consistent hashing, and crash recovery."
        })
    elif "Oracle" in company.name:
        projects.append({
            "title": "Database Query Engine and Indexer",
            "description": "Build an indexing engine in Java that structures custom tables and processes basic SELECT/INSERT SQL syntax."
        })
    else:
        projects.append({
            "title": "Full-Stack Internship Portal",
            "description": "Construct a portal with search matching capabilities using React, FastAPI, and Postgres."
        })
        
    estimated_time = f"{len(missing_skills) * 2 + 2} weeks" if missing_skills else "1 week (Revision)"
    
    return {
        "company_name": company.name,
        "missing_skills": missing_skills,
        "skill_priorities": {
            "high": high_priority,
            "medium": medium_priority,
            "low": low_priority
        },
        "learning_order": learning_order,
        "estimated_learning_time": estimated_time,
        "recommended_courses": courses,
        "suggested_projects": projects
    }
