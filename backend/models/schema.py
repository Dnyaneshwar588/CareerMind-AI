import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    profile = relationship("StudentProfile", back_populates="user", uselist=False)
    resumes = relationship("Resume", back_populates="user")
    study_plans = relationship("StudyPlan", back_populates="user")
    interviews = relationship("MockInterviewSession", back_populates="user")
    progress_logs = relationship("ProgressLog", back_populates="user")

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(String, nullable=False)
    college = Column(String, nullable=True)
    branch = Column(String, nullable=True)
    grad_year = Column(Integer, nullable=True)
    cgpa = Column(Float, default=0.0)
    skills = Column(Text, default="")  # comma-separated
    programming_languages = Column(Text, default="")  # comma-separated
    projects = Column(Text, default="[]")  # JSON string representation
    certifications = Column(Text, default="[]")  # JSON string representation
    target_role = Column(String, default="")
    target_companies = Column(Text, default="")  # comma-separated
    study_hours = Column(Integer, default=0)
    preferred_lang = Column(String, default="Python")
    
    user = relationship("User", back_populates="profile")

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String, nullable=False)
    extracted_text = Column(Text, default="")
    resume_score = Column(Integer, default=0)
    ats_score = Column(Integer, default=0)
    strengths = Column(Text, default="[]")  # JSON array
    weaknesses = Column(Text, default="[]")  # JSON array
    suggestions = Column(Text, default="[]")  # JSON array
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="resumes")

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    min_cgpa = Column(Float, default=6.0)
    required_skills = Column(Text, default="")  # comma-separated
    eligibility = Column(Text, default="")
    pattern = Column(Text, default="")
    rounds = Column(Text, default="[]")  # JSON list
    package = Column(String, default="")
    preparation_tips = Column(Text, default="")
    faqs = Column(Text, default="[]")  # JSON list of dicts
    
class StudyPlan(Base):
    __tablename__ = "study_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_role = Column(String, nullable=False)
    target_company = Column(String, nullable=False)
    plan_json = Column(Text, nullable=False)  # JSON structure containing days/weeks
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="study_plans")

class MockInterviewSession(Base):
    __tablename__ = "mock_interviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False)
    type = Column(String, nullable=False)  # HR, Technical, Behavioral, etc.
    company = Column(String, default="")
    score = Column(Integer, default=0)
    feedback = Column(Text, default="")
    transcript_json = Column(Text, default="[]")  # List of dicts: {"q": "...", "a": "...", "feedback": "...", "score": 10}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="interviews")

class ProgressLog(Base):
    __tablename__ = "progress_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    study_hours = Column(Float, default=0.0)
    completed_topics = Column(Text, default="")  # comma-separated
    dsa_progress = Column(Integer, default=0)  # percentage
    sql_progress = Column(Integer, default=0)  # percentage
    ai_progress = Column(Integer, default=0)  # percentage
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="progress_logs")
