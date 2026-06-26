from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any

from backend.database.connection import get_db
from backend.models.schema import User, StudentProfile
from backend.utils.security import get_current_user
from backend.services.rag_service import vector_db
from backend.services.ai_service import generate_rag_answer_with_gemini

router = APIRouter(prefix="/api/chat", tags=["AI Career Assistant (RAG)"])

class ChatRequest(BaseModel):
    question: str

@router.post("/ask")
def ask_assistant(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")
        
    # 1. Compile student profile summary to inject into prompt context
    profile_summary = ""
    profile = current_user.profile
    if profile:
        profile_summary = f"Student Name: {profile.name}\n" \
                          f"CGPA: {profile.cgpa}\n" \
                          f"Skills: {profile.skills}\n" \
                          f"Target Role: {profile.target_role}\n" \
                          f"Target Companies: {profile.target_companies}"
                          
    # 2. Search FAISS Vector Database for similar guidelines/contexts
    try:
        search_results = vector_db.search(question, k=3)
    except Exception as e:
        search_results = []
        
    # 3. Format retrieved documents for prompt injection
    context_blocks = []
    sources = []
    
    for result in search_results:
        context_blocks.append(result["text"])
        meta = result.get("metadata", {})
        
        # Determine source label
        source_type = meta.get("type", "general")
        if source_type == "company":
            sources.append({"name": f"{meta.get('name')} Info Page", "type": "company"})
        elif source_type == "note":
            sources.append({"name": f"Study Guide: {meta.get('title')}", "type": "study_note"})
        elif source_type == "resume":
            sources.append({"name": "Uploaded Student Resume", "type": "resume"})
        else:
            sources.append({"name": "General Guideline", "type": "general"})
            
    # Remove duplicate sources
    unique_sources = []
    seen = set()
    for s in sources:
        if s["name"] not in seen:
            seen.add(s["name"])
            unique_sources.append(s)
            
    retrieved_context = "\n---\n".join(context_blocks) if context_blocks else "No matching knowledge base documents found."
    
    # 4. Generate answer with Gemini via RAG template
    answer = generate_rag_answer_with_gemini(
        query=question,
        retrieved_context=retrieved_context,
        student_profile_summary=profile_summary
    )
    
    return {
        "question": question,
        "answer": answer,
        "sources": unique_sources
    }
