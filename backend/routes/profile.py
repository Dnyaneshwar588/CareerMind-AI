import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Optional

from backend.database.connection import get_db
from backend.models.schema import User, StudentProfile
from backend.utils.security import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Student Profile"])

class ProjectSchema(BaseModel):
    title: str
    description: str

class ProfileUpdate(BaseModel):
    name: str
    college: Optional[str] = ""
    branch: Optional[str] = ""
    grad_year: Optional[int] = None
    cgpa: Optional[float] = 0.0
    skills: List[str] = []
    programming_languages: List[str] = []
    projects: List[ProjectSchema] = []
    certifications: List[str] = []
    target_role: Optional[str] = ""
    target_companies: List[str] = []
    study_hours: Optional[int] = 0
    preferred_lang: Optional[str] = "Python"

class ProfileResponse(BaseModel):
    name: str
    college: str
    branch: str
    grad_year: Optional[int]
    cgpa: float
    skills: List[str]
    programming_languages: List[str]
    projects: List[ProjectSchema]
    certifications: List[str]
    target_role: str
    target_companies: List[str]
    study_hours: int
    preferred_lang: str

    class Config:
        from_attributes = True

@router.get("", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=444, detail="Profile not found")
        
    return ProfileResponse(
        name=profile.name,
        college=profile.college or "",
        branch=profile.branch or "",
        grad_year=profile.grad_year,
        cgpa=profile.cgpa,
        skills=[s.strip() for s in profile.skills.split(",") if s.strip()] if profile.skills else [],
        programming_languages=[s.strip() for s in profile.programming_languages.split(",") if s.strip()] if profile.programming_languages else [],
        projects=json.loads(profile.projects) if profile.projects else [],
        certifications=json.loads(profile.certifications) if profile.certifications else [],
        target_role=profile.target_role or "",
        target_companies=[s.strip() for s in profile.target_companies.split(",") if s.strip()] if profile.target_companies else [],
        study_hours=profile.study_hours or 0,
        preferred_lang=profile.preferred_lang or "Python"
    )

@router.post("", response_model=ProfileResponse)
def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    
    # Format list fields to comma-separated strings/serialized JSONs
    skills_str = ",".join(profile_in.skills)
    languages_str = ",".join(profile_in.programming_languages)
    companies_str = ",".join(profile_in.target_companies)
    projects_json = json.dumps([p.dict() for p in profile_in.projects])
    certs_json = json.dumps(profile_in.certifications)
    
    if not profile:
        profile = StudentProfile(
            user_id=current_user.id,
            name=profile_in.name,
            college=profile_in.college,
            branch=profile_in.branch,
            grad_year=profile_in.grad_year,
            cgpa=profile_in.cgpa,
            skills=skills_str,
            programming_languages=languages_str,
            projects=projects_json,
            certifications=certs_json,
            target_role=profile_in.target_role,
            target_companies=companies_str,
            study_hours=profile_in.study_hours,
            preferred_lang=profile_in.preferred_lang
        )
        db.add(profile)
    else:
        profile.name = profile_in.name
        profile.college = profile_in.college
        profile.branch = profile_in.branch
        profile.grad_year = profile_in.grad_year
        profile.cgpa = profile_in.cgpa
        profile.skills = skills_str
        profile.programming_languages = languages_str
        profile.projects = projects_json
        profile.certifications = certs_json
        profile.target_role = profile_in.target_role
        profile.target_companies = companies_str
        profile.study_hours = profile_in.study_hours
        profile.preferred_lang = profile_in.preferred_lang
        
    db.commit()
    db.refresh(profile)
    
    return ProfileResponse(
        name=profile.name,
        college=profile.college or "",
        branch=profile.branch or "",
        grad_year=profile.grad_year,
        cgpa=profile.cgpa,
        skills=profile_in.skills,
        programming_languages=profile_in.programming_languages,
        projects=profile_in.projects,
        certifications=profile_in.certifications,
        target_role=profile.target_role or "",
        target_companies=profile_in.target_companies,
        study_hours=profile.study_hours or 0,
        preferred_lang=profile.preferred_lang or "Python"
    )
