import json
import logging
from groq import Groq
import google.generativeai as genai
from backend.config import settings

logger = logging.getLogger(__name__)

# Initialize clients
_groq_client = None
_gemini_model = None

if settings.GROQ_API_KEY:
    _groq_client = Groq(api_key=settings.GROQ_API_KEY)
    logger.info("Groq client initialized successfully.")

if settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        logger.info("Gemini client initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini: {e}")

if not _groq_client and not _gemini_model:
    logger.warning("Neither GROQ_API_KEY nor GEMINI_API_KEY is set. Running in dummy mock response mode.")

# Model to use for Groq
GROQ_MODEL = "llama-3.3-70b-versatile"


def run_gemini_prompt(prompt: str, system_instruction: str = None) -> str:
    """Helper to run a Groq or Gemini generation prompt with optional system instruction."""
    if _groq_client:
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        try:
            response = _groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                temperature=0.0
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error calling Groq API: {e}")
            raise e
    elif _gemini_model:
        try:
            if system_instruction:
                temp_model = genai.GenerativeModel(
                    'gemini-1.5-flash',
                    system_instruction=system_instruction
                )
                response = temp_model.generate_content(prompt)
            else:
                response = _gemini_model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error calling Gemini API: {e}")
            raise e
    else:
        raise ValueError("Neither GROQ_API_KEY nor GEMINI_API_KEY is configured")


def run_gemini_json_prompt(prompt: str, system_instruction: str = None) -> dict:
    """Helper to run a Groq or Gemini prompt and force a JSON output structure."""
    raw = ""
    if _groq_client:
        sys_content = (system_instruction + " Always respond with valid JSON only.") if system_instruction else "Always respond with valid JSON only."
        messages = [
            {"role": "system", "content": sys_content},
            {"role": "user", "content": prompt}
        ]
        try:
            response = _groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                temperature=0.0,
                response_format={"type": "json_object"}
            )
            raw = response.choices[0].message.content
            return json.loads(raw)
        except Exception as e:
            logger.error(f"Error generating JSON with Groq: {e}")
            return _parse_json_cleanup(raw, e)
    elif _gemini_model:
        try:
            sys_content = (system_instruction + " Always respond with valid JSON only.") if system_instruction else "Always respond with valid JSON only."
            temp_model = genai.GenerativeModel(
                'gemini-1.5-flash',
                system_instruction=sys_content,
                generation_config={"response_mime_type": "application/json"}
            )
            response = temp_model.generate_content(prompt)
            raw = response.text
            return json.loads(raw)
        except Exception as e:
            logger.error(f"Error generating JSON with Gemini: {e}")
            return _parse_json_cleanup(raw, e)
    else:
        raise ValueError("Neither GROQ_API_KEY nor GEMINI_API_KEY is configured")


def _parse_json_cleanup(raw: str, e: Exception) -> dict:
    cleaned = raw
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].split("```")[0].strip()
    try:
        return json.loads(cleaned)
    except Exception:
        raise e


def extract_profile_data_with_gemini(resume_text: str) -> dict:
    """Extract profile fields structured in JSON from the parsed resume text."""
    if not _groq_client and not _gemini_model:
        # Mock fallback profile
        return {
            "name": "Alex Mercer",
            "college": "State Technical University",
            "branch": "Computer Science & Engineering",
            "grad_year": 2026,
            "cgpa": 8.2,
            "skills": ["Java", "Python", "SQL", "React", "Data Structures"],
            "programming_languages": ["Python", "Java", "SQL"],
            "projects": [
                {"title": "E-Commerce Backend API", "description": "Developed a secure REST API with FastAPI and PostgreSQL."}
            ],
            "certifications": ["AWS Certified Cloud Practitioner"]
        }

    prompt = f"""
    Analyze the following resume text and extract the candidate's details in a clean structured JSON format.
    
    Fields to extract:
    - name (String)
    - college (String, default empty)
    - branch (String, default empty. e.g. Computer Science, Information Technology, Electronics)
    - grad_year (Integer, default null)
    - cgpa (Float, default 0.0)
    - skills (List of Strings, extract all tech and soft skills)
    - programming_languages (List of Strings, e.g., Python, C++, Java, JS, Go, SQL)
    - projects (List of Objects with 'title' and 'description' keys)
    - certifications (List of Strings)
    
    Resume Text:
    {resume_text}
    
    Ensure the output is valid JSON and maps strictly to the schema specified.
    """

    system_instruction = "You are a professional recruiting assistant parser designed to extract resume information into schema-compliant JSON."
    try:
        return run_gemini_json_prompt(prompt, system_instruction)
    except Exception:
        return {
            "name": "Candidate",
            "skills": [],
            "programming_languages": [],
            "projects": [],
            "certifications": []
        }


def analyze_resume_with_gemini(resume_text: str) -> dict:
    """Run full resume analysis: resume score, ATS compatibility, strengths, weaknesses, suggestions."""
    if not _groq_client and not _gemini_model:
        return {
            "resume_score": 75,
            "ats_score": 70,
            "strengths": ["Clear educational history", "Relevant internship experience", "Mentions core languages"],
            "weaknesses": ["Lack of quantifiable impact metrics", "No Cloud or DevOps skills listed", "Grammar issues in projects"],
            "suggestions": ["Add numbers to your project impact, e.g., 'Optimized database queries, reducing load times by 30%'.", "Include certifications like AWS/GCP to improve ATS compatibility for cloud SDE roles.", "Correct the spelling of 'PostgreSql' to 'PostgreSQL'."]
        }

    prompt = f"""
    Evaluate the following resume text. Provide an overall resume score (0 to 100) based on readability, layout guidelines, and grammar.
    Provide an ATS compatibility score (0 to 100) based on how search engines and automated tracking platforms scan this format.
    Identify 3-5 strengths.
    Identify 3-5 weaknesses.
    Provide 3-5 actionable improvement suggestions (formatting, project bullet modifications, skill suggestions).
    
    Output strictly in the following JSON format:
    {{
        "resume_score": 85,
        "ats_score": 80,
        "strengths": ["strength 1", "strength 2"],
        "weaknesses": ["weakness 1", "weakness 2"],
        "suggestions": ["suggestion 1", "suggestion 2"]
    }}
    
    Resume Text:
    {resume_text}
    """

    system_instruction = "You are an expert HR Specialist and ATS Optimizer. Evaluate resume quality and output advice in structured JSON."
    try:
        return run_gemini_json_prompt(prompt, system_instruction)
    except Exception:
        return {
            "resume_score": 60,
            "ats_score": 55,
            "strengths": ["Basic format is readable"],
            "weaknesses": ["AI evaluation failed to parse complete structure"],
            "suggestions": ["Please verify the text contents or upload again."]
        }


def generate_study_plan_with_gemini(target_role: str, target_company: str, available_hours: int, weak_subjects: list, strong_subjects: list) -> dict:
    """Generate a daily, weekly, and monthly roadmap based on skills and preferences."""
    if not _groq_client and not _gemini_model:
        return {
            "daily_plan": "Spend 2 hours on DSA (Arrays, Strings) and 1 hour on SQL queries (Joins, aggregations).",
            "weekly_plan": [
                {"week": 1, "focus": "Data Structures basics & SQL Joins", "hours": 15},
                {"week": 2, "focus": "Algorithms (Sorting, Binary Search) & Database Normalization", "hours": 15}
            ],
            "monthly_roadmap": [
                {"month": "Month 1", "objective": "Strengthen Core DSA and Databases"},
                {"month": "Month 2", "objective": "System Design, Mock Interviews & Resume Tuning"}
            ]
        }

    prompt = f"""
    Generate a highly customized Study Plan for an engineering student.
    Target Role: {target_role}
    Target Company: {target_company}
    Available Study Hours Per Week: {available_hours} hours
    Weak Subjects: {', '.join(weak_subjects) if weak_subjects else 'None specified'}
    Strong Subjects: {', '.join(strong_subjects) if strong_subjects else 'None specified'}
    
    Create:
    1. A daily study plan description (daily_plan).
    2. A list of weekly focus plans for a 4-week span (weekly_plan).
    3. A monthly roadmap covering 2 months (monthly_roadmap).
    
    Ensure the plans specifically target the skills needed for {target_company} and improve the student's weak subjects. Include DSA, SQL, Aptitude, Core subjects, and mock interview preparations.
    
    Format the response strictly in JSON like:
    {{
        "daily_plan": "string daily summary description...",
        "weekly_plan": [
            {{ "week": 1, "focus": "focus topic...", "hours": 15 }},
            ...
        ],
        "monthly_roadmap": [
            {{ "month": "Month 1", "objective": "objective summary..." }},
            ...
        ]
    }}
    """

    system_instruction = "You are an expert AI Career Coach. Help students build actionable schedules for recruitment readiness."
    try:
        return run_gemini_json_prompt(prompt, system_instruction)
    except Exception:
        return {
            "daily_plan": "Focus on daily coding practices and core CS subjects.",
            "weekly_plan": [{"week": 1, "focus": "Aptitude and DSA basics", "hours": available_hours}],
            "monthly_roadmap": [{"month": "Month 1", "objective": "Prepare DSA, DBMS, and core engineering concepts"}]
        }


def evaluate_interview_answer_with_gemini(interview_type: str, role: str, company: str, transcript: list, current_question: str, user_answer: str) -> dict:
    """Evaluates the user's typed response to a mock interview question and decides next question or if interview is complete."""
    if not _groq_client and not _gemini_model:
        return {
            "score": 8,
            "accuracy_score": 8,
            "communication_score": 9,
            "confidence_score": 7,
            "completeness_score": 8,
            "feedback": "Great answer, you clearly explained the concepts.",
            "better_answer": "A more structured response would detail the code implementation.",
            "next_question": "Explain the difference between SQL and NoSQL databases.",
            "is_complete": len(transcript) >= 4
        }

    # Format historical chat context
    history_str = ""
    for idx, turn in enumerate(transcript):
        history_str += f"Q{idx+1}: {turn.get('q')}\nA{idx+1}: {turn.get('a')}\nFeedback: {turn.get('feedback')}\n\n"

    prompt = f"""
    You are conducting a {interview_type} mock interview for the role of '{role}' at '{company}'.
    
    History of the interview:
    {history_str}
    
    Current Question:
    {current_question}
    
    Student's Answer:
    {user_answer}
    
    Evaluate the student's answer and calculate:
    1. An overall score (0 to 10) for this answer.
    2. Component scores (0 to 10) for: Technical Accuracy, Communication, Confidence (based on phrasing), and Completeness.
    3. Qualitative feedback explaining what they did well and what is missing.
    4. A model 'better_answer' that showcases how a top candidate would answer.
    5. Formulate the 'next_question' that keeps the interview progressing (adapt to their answer, e.g., follow up on concepts they mentioned). If the interview is complete (usually after 5 questions total), you can set next_question to empty.
    6. 'is_complete' (boolean) - set to True if this answer marks the end of a 5-question interview session.
    
    Output strictly in the following JSON format:
    {{
        "score": 8,
        "accuracy_score": 8,
        "communication_score": 7,
        "confidence_score": 8,
        "completeness_score": 9,
        "feedback": "feedback string...",
        "better_answer": "model answer string...",
        "next_question": "next interview question string...",
        "is_complete": false
    }}
    """

    system_instruction = f"You are a Senior Technical and HR Interviewer at {company}. Be professional, rigorous, and constructive."
    try:
        return run_gemini_json_prompt(prompt, system_instruction)
    except Exception:
        return {
            "score": 7,
            "accuracy_score": 7,
            "communication_score": 7,
            "confidence_score": 7,
            "completeness_score": 7,
            "feedback": "Answer registered. The AI evaluation encountered an error, but you can continue.",
            "better_answer": "N/A",
            "next_question": "Can you describe a challenging project you have worked on?",
            "is_complete": len(transcript) >= 4
        }


def generate_rag_answer_with_gemini(query: str, retrieved_context: str, student_profile_summary: str = "") -> str:
    """Generates an answer to student career/placement questions using retrieved vector context."""
    if not _groq_client and not _gemini_model:
        return f"This is a placeholder RAG answer. Mock context size: {len(retrieved_context)} characters. Please configure your GROQ_API_KEY or GEMINI_API_KEY."

    prompt = f"""
    You are an AI Campus Placement Assistant. Answer the student's question accurately using ONLY the provided verified context.
    If the context does not contain enough information to answer the question, state that you don't know rather than making up details.
    
    Student Profile (if available):
    {student_profile_summary}
    
    Verified Context from Knowledge Base:
    {retrieved_context}
    
    Student Question:
    {query}
    
    Answer clearly, professionally, and in clean markdown formatting. Highlight tips and steps using bullet points.
    """

    try:
        return run_gemini_prompt(prompt, "You are a helpful and knowledgeable Campus Placement Strategist assistant.")
    except Exception as e:
        return f"Error executing AI generation: {str(e)}"
