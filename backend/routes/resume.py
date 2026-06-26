import os
import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.schema import User, Resume, StudentProfile
from backend.utils.security import get_current_user
from backend.services.parser_service import parse_resume
from backend.services.ai_service import analyze_resume_with_gemini
from backend.services.rag_service import vector_db
from backend.config import settings

router = APIRouter(prefix="/api/resume", tags=["Resume Upload & Analyzer"])

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    try:
        # Save file to uploads folder
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
    try:
        # Parse resume text and entities
        extracted_data = parse_resume(file_path)
        
        # Analyze resume using Gemini API
        analysis = analyze_resume_with_gemini(extracted_data["text"])
        
        # Save to database
        db_resume = Resume(
            user_id=current_user.id,
            filename=file.filename,
            extracted_text=extracted_data["text"],
            resume_score=analysis.get("resume_score", 0),
            ats_score=analysis.get("ats_score", 0),
            strengths=json.dumps(analysis.get("strengths", [])),
            weaknesses=json.dumps(analysis.get("weaknesses", [])),
            suggestions=json.dumps(analysis.get("suggestions", []))
        )
        db.add(db_resume)
        
        # Populate or update student profile with extracted details
        profile = current_user.profile
        skills_str = ",".join(extracted_data["skills"])
        languages_str = ",".join(extracted_data["programming_languages"])
        projects_json = json.dumps(extracted_data["projects"])
        certs_json = json.dumps(extracted_data["certifications"])
        
        if not profile:
            profile = StudentProfile(
                user_id=current_user.id,
                name=extracted_data["name"] or "Candidate",
                college=extracted_data["college"],
                branch=extracted_data["branch"],
                grad_year=extracted_data["grad_year"],
                cgpa=extracted_data["cgpa"],
                skills=skills_str,
                programming_languages=languages_str,
                projects=projects_json,
                certifications=certs_json,
                target_role="",
                target_companies="",
                study_hours=0,
                preferred_lang="Python"
            )
            db.add(profile)
        else:
            # Update only if fields are empty to preserve manual edits, or if they contain mock placeholder values
            if not profile.name or profile.name in ("Candidate", "Alex Mercer"):
                profile.name = extracted_data["name"] or "Candidate"
            if not profile.college or profile.college == "State Technical University":
                profile.college = extracted_data["college"]
            if not profile.branch or profile.branch == "Computer Science & Engineering":
                profile.branch = extracted_data["branch"]
            if not profile.cgpa or profile.cgpa in (0.0, 8.2):
                profile.cgpa = extracted_data["cgpa"]
            
            # Merge skills and programming languages
            existing_skills = set(s.strip() for s in profile.skills.split(",") if s.strip())
            new_skills = set(extracted_data["skills"])
            profile.skills = ",".join(existing_skills.union(new_skills))
            
            existing_langs = set(s.strip() for s in profile.programming_languages.split(",") if s.strip())
            new_langs = set(extracted_data["programming_languages"])
            profile.programming_languages = ",".join(existing_langs.union(new_langs))
            
            profile.projects = projects_json
            profile.certifications = certs_json
            
        db.commit()
        db.refresh(profile)
        db.refresh(db_resume)
        
        # Index resume content in FAISS vector database for RAG
        resume_text_doc = f"Student Resume: {profile.name}\n" \
                          f"College: {profile.college}\n" \
                          f"Branch: {profile.branch}\n" \
                          f"Skills: {profile.skills}\n" \
                          f"Programming Languages: {profile.programming_languages}\n" \
                          f"Certifications: {extracted_data['certifications']}\n" \
                          f"Projects: {extracted_data['projects']}"
                          
        vector_db.add_documents([{
            "id": f"resume_{current_user.id}",
            "text": resume_text_doc,
            "metadata": {
                "type": "resume",
                "user_id": current_user.id
            }
        }])
        
        return {
            "id": db_resume.id,
            "filename": db_resume.filename,
            "resume_score": db_resume.resume_score,
            "ats_score": db_resume.ats_score,
            "strengths": analysis.get("strengths", []),
            "weaknesses": analysis.get("weaknesses", []),
            "suggestions": analysis.get("suggestions", []),
            "extracted_profile": {
                "name": profile.name,
                "college": profile.college,
                "branch": profile.branch,
                "grad_year": profile.grad_year,
                "cgpa": profile.cgpa,
                "skills": extracted_data["skills"],
                "programming_languages": extracted_data["programming_languages"],
                "projects": extracted_data["projects"],
                "certifications": extracted_data["certifications"]
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(e)}")

@router.get("/analysis")
def get_analysis(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume uploaded yet")
        
    return {
        "id": resume.id,
        "filename": resume.filename,
        "resume_score": resume.resume_score,
        "ats_score": resume.ats_score,
        "strengths": json.loads(resume.strengths) if resume.strengths else [],
        "weaknesses": json.loads(resume.weaknesses) if resume.weaknesses else [],
        "suggestions": json.loads(resume.suggestions) if resume.suggestions else [],
        "uploaded_at": resume.uploaded_at
    }
