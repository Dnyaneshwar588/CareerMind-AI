import json
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from backend.database.connection import get_db
from backend.models.schema import User, StudyPlan, ProgressLog
from backend.utils.security import get_current_user
from backend.services.ai_service import generate_study_plan_with_gemini

router = APIRouter(prefix="/api/planner", tags=["AI Study Planner"])

class PlannerRequest(BaseModel):
    target_role: str
    target_company: str
    available_hours: int
    weak_subjects: List[str]
    strong_subjects: List[str]

class ProgressLogCreate(BaseModel):
    date: str  # YYYY-MM-DD
    study_hours: float
    completed_topics: List[str]
    dsa_progress: int
    sql_progress: int
    ai_progress: int

@router.post("/generate")
def generate_plan(
    req: PlannerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Call Gemini to generate study plan
        plan_data = generate_study_plan_with_gemini(
            target_role=req.target_role,
            target_company=req.target_company,
            available_hours=req.available_hours,
            weak_subjects=req.weak_subjects,
            strong_subjects=req.strong_subjects
        )
        
        # Save study plan to database
        db_plan = StudyPlan(
            user_id=current_user.id,
            target_role=req.target_role,
            target_company=req.target_company,
            plan_json=json.dumps(plan_data)
        )
        db.add(db_plan)
        db.commit()
        db.refresh(db_plan)
        
        return plan_data
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to generate study plan: {str(e)}")

@router.get("/latest")
def get_latest_plan(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.query(StudyPlan).filter(StudyPlan.user_id == current_user.id).order_by(StudyPlan.created_at.desc()).first()
    if not plan:
        raise HTTPException(status_code=404, detail="No study plan generated yet")
        
    return {
        "id": plan.id,
        "target_role": plan.target_role,
        "target_company": plan.target_company,
        "plan_json": json.loads(plan.plan_json),
        "created_at": plan.created_at
    }

@router.post("/progress")
def log_progress(
    log_in: ProgressLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        log_date = datetime.datetime.strptime(log_in.date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
        
    # Check if a log already exists for this date and update it, else create new
    existing_log = db.query(ProgressLog).filter(
        ProgressLog.user_id == current_user.id,
        ProgressLog.date == log_date
    ).first()
    
    topics_str = ",".join(log_in.completed_topics)
    
    if existing_log:
        existing_log.study_hours = log_in.study_hours
        existing_log.completed_topics = topics_str
        existing_log.dsa_progress = log_in.dsa_progress
        existing_log.sql_progress = log_in.sql_progress
        existing_log.ai_progress = log_in.ai_progress
        db_log = existing_log
    else:
        db_log = ProgressLog(
            user_id=current_user.id,
            date=log_date,
            study_hours=log_in.study_hours,
            completed_topics=topics_str,
            dsa_progress=log_in.dsa_progress,
            sql_progress=log_in.sql_progress,
            ai_progress=log_in.ai_progress
        )
        db.add(db_log)
        
    db.commit()
    db.refresh(db_log)
    return {
        "id": db_log.id,
        "date": db_log.date.strftime("%Y-%m-%d"),
        "study_hours": db_log.study_hours,
        "completed_topics": [t.strip() for t in db_log.completed_topics.split(",") if t.strip()] if db_log.completed_topics else [],
        "dsa_progress": db_log.dsa_progress,
        "sql_progress": db_log.sql_progress,
        "ai_progress": db_log.ai_progress
    }

@router.get("/progress")
def get_progress_logs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(ProgressLog).filter(ProgressLog.user_id == current_user.id).order_by(ProgressLog.date.asc()).all()
    result = []
    for log in logs:
        result.append({
            "id": log.id,
            "date": log.date.strftime("%Y-%m-%d"),
            "study_hours": log.study_hours,
            "completed_topics": [t.strip() for t in log.completed_topics.split(",") if t.strip()] if log.completed_topics else [],
            "dsa_progress": log.dsa_progress,
            "sql_progress": log.sql_progress,
            "ai_progress": log.ai_progress
        })
    return result
