import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from backend.database.connection import get_db
from backend.models.schema import User, MockInterviewSession
from backend.utils.security import get_current_user
from backend.services.ai_service import evaluate_interview_answer_with_gemini, run_gemini_prompt

router = APIRouter(prefix="/api/interview", tags=["AI Mock Interview"])

class StartInterviewRequest(BaseModel):
    role: str
    type: str  # HR, Technical, Behavioral, AI Engineer, Software Engineer, Data Analyst
    company: Optional[str] = ""

class AnswerSubmitRequest(BaseModel):
    current_question: str
    user_answer: str

# Starter questions mapping for instant starts
STARTER_QUESTIONS = {
    "HR": "Tell me about yourself and why you are interested in this position.",
    "Technical": "Explain the difference between a process and a thread. How do they handle memory space?",
    "Behavioral": "Describe a situation where you had a conflict with a team member. How did you resolve it?",
    "AI Engineer": "Explain the difference between bagging and boosting algorithms. When would you choose one over the other?",
    "Data Analyst": "What is the difference between a JOIN and a UNION in SQL? Explain with a query scenario.",
    "Software Engineer": "What is Object-Oriented Programming? Can you explain the four core pillars with examples?"
}

@router.post("/start")
def start_interview(
    req: StartInterviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Determine the first question
    first_question = STARTER_QUESTIONS.get(req.type, "Tell me about yourself and your career goals.")
    
    # Try generating a more customized first question via Gemini if available
    try:
        from backend.config import settings
        if settings.GEMINI_API_KEY or settings.GROQ_API_KEY:
            prompt = f"Generate the first interview question for a {req.type} interview for the role of '{req.role}' at the company '{req.company or 'a tech firm'}'. Ask a single clear question. Do not provide intro or explanations."
            ai_q = run_gemini_prompt(prompt, "You are a senior hiring manager conducting an interview.")
            if ai_q.strip():
                first_question = ai_q.strip()
    except Exception:
        pass  # Fallback to default
        
    db_session = MockInterviewSession(
        user_id=current_user.id,
        role=req.role,
        type=req.type,
        company=req.company,
        score=0,
        feedback="Interview in progress.",
        transcript_json=json.dumps([])
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    return {
        "session_id": db_session.id,
        "role": db_session.role,
        "type": db_session.type,
        "company": db_session.company,
        "first_question": first_question
    }

@router.post("/{session_id}/answer")
def submit_answer(
    session_id: int,
    req: AnswerSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(MockInterviewSession).filter(
        MockInterviewSession.id == session_id,
        MockInterviewSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
        
    transcript = json.loads(session.transcript_json) if session.transcript_json else []
    
    # Evaluate answer using Gemini
    evaluation = evaluate_interview_answer_with_gemini(
        interview_type=session.type,
        role=session.role,
        company=session.company or "Tech Company",
        transcript=transcript,
        current_question=req.current_question,
        user_answer=req.user_answer
    )
    
    # Record this turn in the transcript
    turn = {
        "q": req.current_question,
        "a": req.user_answer,
        "score": evaluation.get("score", 7),
        "accuracy_score": evaluation.get("accuracy_score", 7),
        "communication_score": evaluation.get("communication_score", 7),
        "confidence_score": evaluation.get("confidence_score", 7),
        "completeness_score": evaluation.get("completeness_score", 7),
        "feedback": evaluation.get("feedback", ""),
        "better_answer": evaluation.get("better_answer", "")
    }
    transcript.append(turn)
    session.transcript_json = json.dumps(transcript)
    
    # If complete or reached max limit (5 questions), close interview and compile final metrics
    is_complete = evaluation.get("is_complete", False) or len(transcript) >= 5
    
    if is_complete:
        # Calculate overall score as average of turns
        total_score = sum(t["score"] for t in transcript)
        avg_score = int((total_score / len(transcript)) * 10)  # Scale to 100
        
        session.score = avg_score
        
        # Compile overall feedback
        try:
            from backend.config import settings
            if settings.GEMINI_API_KEY or settings.GROQ_API_KEY:
                # Ask Gemini/Groq for final summary
                summary_prompt = f"""
                Compile final constructive feedback for a candidate's mock interview.
                Role: {session.role}
                Type: {session.type}
                
                Transcript Details:
                {json.dumps(transcript)}
                
                Provide a short 3-4 sentence summary of their performance, highlighting key strengths and areas of technical/communication improvement.
                """
                session.feedback = run_gemini_prompt(summary_prompt, "You are a professional HR consulting coach.").strip()
            else:
                session.feedback = f"Completed mock interview with an average response score of {avg_score}/100. Strongest points were in technical explanation; focus on structure."
        except Exception:
            session.feedback = f"Completed mock interview with an average response score of {avg_score}/100."
            
    db.commit()
    db.refresh(session)
    
    return {
        "score": turn["score"],
        "accuracy_score": turn["accuracy_score"],
        "communication_score": turn["communication_score"],
        "confidence_score": turn["confidence_score"],
        "completeness_score": turn["completeness_score"],
        "feedback": turn["feedback"],
        "better_answer": turn["better_answer"],
        "next_question": evaluation.get("next_question", "") if not is_complete else "",
        "is_complete": is_complete,
        "overall_score": session.score if is_complete else None,
        "overall_feedback": session.feedback if is_complete else None
    }

@router.get("/past")
def get_past_interviews(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(MockInterviewSession).filter(
        MockInterviewSession.user_id == current_user.id
    ).order_by(MockInterviewSession.created_at.desc()).all()
    
    result = []
    for s in sessions:
        transcript = json.loads(s.transcript_json) if s.transcript_json else []
        result.append({
            "id": s.id,
            "role": s.role,
            "type": s.type,
            "company": s.company,
            "score": s.score,
            "feedback": s.feedback,
            "created_at": s.created_at,
            "questions_count": len(transcript)
        })
    return result

@router.get("/{session_id}")
def get_interview_detail(session_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(MockInterviewSession).filter(
        MockInterviewSession.id == session_id,
        MockInterviewSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
        
    return {
        "id": session.id,
        "role": session.role,
        "type": session.type,
        "company": session.company,
        "score": session.score,
        "feedback": session.feedback,
        "transcript": json.loads(session.transcript_json) if session.transcript_json else [],
        "created_at": session.created_at
    }
