import json
from sqlalchemy.orm import Session
from backend.models.schema import Company

COMPANIES_SEED_DATA = [
    {
        "name": "Google",
        "min_cgpa": 8.5,
        "required_skills": "Data Structures, Algorithms, C++, Java, Python, System Design, Operating Systems, Networks",
        "eligibility": "B.E. / B.Tech / M.Tech in CS/IT or related fields. No active backlogs. Minimum 8.5 CGPA.",
        "pattern": "Online Coding Assessment followed by 3-4 Rounds of Virtual Technical Interviews (SDE-1) focusing heavily on DSA, and 1 Googleyness & Leadership (behavioral) round.",
        "rounds": json.dumps([
            "Resume Screening",
            "Online Coding Assessment (2 Hard DSA Questions, 90 mins)",
            "Technical Interview 1 (Algorithms & Data Structures)",
            "Technical Interview 2 (Advanced DS, System Design basics)",
            "Technical Interview 3 (Coding & Problem Solving)",
            "Googleyness & Leadership Round (Behavioral & Culture Fit)"
        ]),
        "package": "30 - 45 LPA",
        "preparation_tips": "Practice hard-level problems on LeetCode focusing on Dynamic Programming, Graphs, Trees, and Trie. Be very vocal about your thought process during interviews. Review basic System Design concepts and ensure strong fundamentals in Operating Systems and Networking.",
        "faqs": json.dumps([
            {"question": "How important is the CGPA for Google?", "answer": "A minimum of 8.5 is highly recommended for resume shortlisting. However, exceptional competitive programming profiles or project portfolios can sometimes offset a slightly lower CGPA."},
            {"question": "What language is preferred for the interview?", "answer": "You can code in C++, Java, or Python. Google values logical reasoning and correct syntax over specific language details, though strong typing (C++/Java) can be easier to read for algorithm tracking."}
        ])
    },
    {
        "name": "Microsoft",
        "min_cgpa": 8.0,
        "required_skills": "Data Structures, Algorithms, Object Oriented Programming, System Design, Java, C#, C++",
        "eligibility": "B.Tech/M.Tech/MCA with CS/IT specialization. Minimum 8.0 CGPA.",
        "pattern": "Online Assessment (3 coding tasks) + 3 Technical Rounds + 1 AA (As Appropriate) Director Round.",
        "rounds": json.dumps([
            "Online Coding Test (Codility - 3 questions)",
            "Technical Round 1 (Data Structures, OOP Design)",
            "Technical Round 2 (Algorithms, System Architecture)",
            "As Appropriate (AA) Round (Behavioral, Tech questions and culture fit)"
        ]),
        "package": "28 - 36 LPA",
        "preparation_tips": "Strong hold on Object-Oriented Design (LID principles, design patterns) and standard DSA questions. Practice mock interviews to present your design patterns clearly.",
        "faqs": json.dumps([
            {"question": "What is the AA Round?", "answer": "The 'As Appropriate' round is Microsoft's unique interview where a senior manager evaluates your general suitability, culture fit, SDE aptitude, and leadership skills."},
            {"question": "Does Microsoft ask system design questions to freshers?", "answer": "Yes, basic system design or low-level class design (OOP) questions are frequently asked."}
        ])
    },
    {
        "name": "NVIDIA",
        "min_cgpa": 8.0,
        "required_skills": "C, C++, Computer Architecture, Operating Systems, Linux, CUDA, Parallel Programming, Machine Learning",
        "eligibility": "B.E./B.Tech/M.Tech in CS/EE/EC. Strong foundation in hardware-software interfaces. Minimum 8.0 CGPA.",
        "pattern": "Aptitude and Technical Test (heavy on C/C++ and Computer Architecture), followed by 3 Technical Rounds and an HR Interview.",
        "rounds": json.dumps([
            "Online Technical Assessment (C programming, Hardware architecture, OS, 60 mins)",
            "Technical Interview 1 (Advanced C/C++, Memory management)",
            "Technical Interview 2 (Computer Architecture, Multithreading, Caches)",
            "Technical Interview 3 (Role-Specific: Graphics/CUDA/AI/Embedded Systems)",
            "HR & Culture Fit Round"
        ]),
        "package": "25 - 32 LPA",
        "preparation_tips": "Deeply study Computer Organization & Architecture (Pipeline hazards, Cache design). Write bug-free C code with pointers and memory management. Understand concurrency, locks, and basic graphics or machine learning hardware acceleration.",
        "faqs": json.dumps([
            {"question": "Do I need hardware knowledge for software SDE roles at NVIDIA?", "answer": "Yes. Most software roles at NVIDIA interface directly with hardware, so questions on memory hierarchy, operating system kernel architecture, and processor pipelining are standard."},
            {"question": "Are Python developers hired at NVIDIA?", "answer": "Yes, especially in AI/ML teams. However, core programming proficiency in C/C++ is usually tested in the general round."}
        ])
    },
    {
        "name": "Amazon",
        "min_cgpa": 7.5,
        "required_skills": "Data Structures, Algorithms, Object-Oriented Programming, System Design, DBMS, Amazon Leadership Principles",
        "eligibility": "B.E. / B.Tech / MCA / M.Tech. CGPA 7.5+. No active backlogs.",
        "pattern": "Online Assessment (2 coding questions + SDE Simulation + Work Style Assessment) followed by 3 Technical F2F Interviews based heavily on coding and Leadership Principles.",
        "rounds": json.dumps([
            "Online Assessment (90 mins Coding + 15 mins Code Walkthrough + SDE Work Simulation)",
            "Technical Round 1 (Medium-Hard Coding, Leadership Principles)",
            "Technical Round 2 (System Design/OOD, Leadership Principles)",
            "Technical Round 3 / Bar Raiser (Critical problem solving, Leadership Principles)"
        ]),
        "package": "25 - 35 LPA",
        "preparation_tips": "Study Amazon's 16 Leadership Principles inside out; prepare 2 STAR-method stories for each. Master DSA (Trees, Graphs, DP, Heap) and low-level design (OOP classes).",
        "faqs": json.dumps([
            {"question": "What is the Bar Raiser round?", "answer": "The Bar Raiser is a candidate evaluator who is not the hiring manager. They focus on behavioral/leadership principles and ensure you raise the quality bar of the company."},
            {"question": "How important are the Leadership Principles?", "answer": "Extremely. Roughly 50% of the interview feedback is based on how well you demonstrate these principles during technical discussions."}
        ])
    },
    {
        "name": "Oracle",
        "min_cgpa": 7.0,
        "required_skills": "Java, SQL, Database Management Systems, Data Structures, Algorithms, Operating Systems",
        "eligibility": "B.Tech/M.Tech/MCA. Minimum 7.0 CGPA.",
        "pattern": "Online Test (Aptitude, Coding, SQL, CS Core) followed by 2-3 Technical Interview Rounds and 1 HR Round.",
        "rounds": json.dumps([
            "Online Assessment (Aptitude, SQL, Core CS, Coding)",
            "Technical Round 1 (Database Concepts, SQL queries, DSA)",
            "Technical Round 2 (System design, Project deep dive, Java programming)",
            "HR & Managerial Round"
        ]),
        "package": "15 - 20 LPA",
        "preparation_tips": "Excel in SQL queries (Joins, Subqueries, Indexing). Prepare database normalization, transaction ACID properties, and concurrency control. Have standard DSA ready.",
        "faqs": json.dumps([
            {"question": "Is database knowledge mandatory for Oracle SDE?", "answer": "Yes. Oracle expects solid understanding of DBMS architecture and SQL scripting, regardless of the target software engineering group."},
            {"question": "Can I prepare in python?", "answer": "Yes, but knowing Java/C++ is highly beneficial as Oracle products are heavily built on Java and C/C++."}
        ])
    },
    {
        "name": "Persistent",
        "min_cgpa": 6.0,
        "required_skills": "Data Structures, SQL, Java, Python, C++, Operating Systems, Computer Networks",
        "eligibility": "B.E./B.Tech/MCA/M.Sc. CGPA 6.0+.",
        "pattern": "Online Test (MCQs on Aptitude, Pseudo-code, Automata Fix) + Technical Round + HR Round.",
        "rounds": json.dumps([
            "Online Test (Aptitude, Automata Fix coding, English)",
            "Technical Round (DSA, OOP, Database queries, Project discussion)",
            "HR Interview"
        ]),
        "package": "5 - 9 LPA",
        "preparation_tips": "Be comfortable with debugging code (Automata fix style). Brush up on basic SQL questions, OOP definitions with real-world examples, and project explanations.",
        "faqs": json.dumps([
            {"question": "Does Persistent hire for developer roles through NQT?", "answer": "Persistent uses national level tests and direct campus assessments. Strong coding performance qualifies you for advanced SDE roles (9 LPA) instead of generic associate software engineer roles (4.7 LPA)."}
        ])
    },
    {
        "name": "Zensar",
        "min_cgpa": 6.0,
        "required_skills": "Java, SQL, JavaScript, HTML/CSS, Quantitative Aptitude, Logical Reasoning",
        "eligibility": "B.E./B.Tech in CS/IT or related, MCA. CGPA 6.0+.",
        "pattern": "Online Test (Quantitative, Logical, Verbal, Pseudo-code, 1 Coding) + Tech Round + HR Round.",
        "rounds": json.dumps([
            "Online Assessment (Aptitude, Technical MCQs, Coding)",
            "Technical Interview (Programming basics, web tech, DB)",
            "HR Interview"
        ]),
        "package": "4.0 - 5.5 LPA",
        "preparation_tips": "Prepare basic programming structures (loops, string manipulation, sorting), OOP pillars, and basic SQL commands (SELECT, INSERT, UPDATE, GROUP BY).",
        "faqs": json.dumps([
            {"question": "Does Zensar ask DSA?", "answer": "Yes, but mostly basic questions like Array manipulation, String reversal, or finding duplicates, rather than complex trees or graphs."}
        ])
    },
    {
        "name": "Deloitte",
        "min_cgpa": 6.5,
        "required_skills": "SQL, Python, Excel, Business Analytics, Software Engineering, Communication, Agile",
        "eligibility": "B.E. / B.Tech (All branches), MCA, MBA. CGPA 6.5+.",
        "pattern": "Deloitte CoCubes/Amcat Test (Aptitude, Verbal, Coding) followed by Group Discussion or Case Study Round, 1 Technical Round, and 1 HR Round.",
        "rounds": json.dumps([
            "Online Cognitive & Technical Test",
            "Business Case Study / Group Activity Round",
            "Technical / Consultant Interview",
            "HR Interview"
        ]),
        "package": "6.0 - 8.2 LPA",
        "preparation_tips": "Deloitte values communication and problem-solving structures. Practice mock Case Studies (how to solve a business problem using technology). Be sound in basic SDLC, Agile concepts, and SQL.",
        "faqs": json.dumps([
            {"question": "Is coding mandatory for Deloitte Analyst roles?", "answer": "Basic scripting knowledge in SQL/Python is expected, but the technical test contains basic programming logic rather than hardcore DSA assessments."},
            {"question": "What is the Case Study round?", "answer": "Candidates are given a business scenario (e.g., migrating a company to the cloud) and must present their technical implementation strategy and timeline."}
        ])
    },
    {
        "name": "Accenture",
        "min_cgpa": 6.5,
        "required_skills": "Communication, Database Management Systems, Cloud Computing Basics, Python, Java, JavaScript",
        "eligibility": "B.E./B.Tech (All branches), MCA. CGPA 6.5+.",
        "pattern": "Cognitive and Technical Assessment + Coding Assessment (Mandatory elimination) + Communication Assessment + Technical/HR Interview.",
        "rounds": json.dumps([
            "Cognitive & Technical Assessment (90 mins, Cognitive + IT basics)",
            "Coding Assessment (45 mins, 2 coding questions - Elimination round)",
            "Communication Test (Interactive speak/listen tool)",
            "One-on-One Interview (Behavioral, CV Review, Tech basics)"
        ]),
        "package": "4.5 - 6.5 LPA",
        "preparation_tips": "Accenture places high weight on the Communication test (clear pronunciation, active listening). For coding, focus on standard array, string, and math-based algorithms. Have basic knowledge of Cloud, Networking, and MS Office.",
        "faqs": json.dumps([
            {"question": "Is the Accenture Coding round mandatory?", "answer": "Yes. You must pass the cognitive test to proceed to coding, and clearing at least one coding question is usually required to be selected for the interview."}
        ])
    },
    {
        "name": "Capgemini",
        "min_cgpa": 6.0,
        "required_skills": "Java, Python, DBMS, Pseudo-code Debugging, Quantitative Aptitude, Logical Reasoning",
        "eligibility": "B.E./B.Tech/MCA/M.Sc. CGPA 6.0+.",
        "pattern": "Online Test (Pseudo-code, English, Game-based Aptitude, Behavioral) followed by 1 Technical Interview and 1 HR Interview.",
        "rounds": json.dumps([
            "Pseudo-code Round (Debugging & Logic)",
            "English Communication & Verbal Test",
            "Game-based Cognitive Test (Grid challenge, motion challenge)",
            "Behavioral/Competency Test",
            "Technical & HR Interview"
        ]),
        "package": "4.0 - 7.5 LPA",
        "preparation_tips": "Capgemini uses a unique game-based aptitude test. Play logic puzzles to practice. Master pseudo-code output determination (understanding variables, loops, dry-running code).",
        "faqs": json.dumps([
            {"question": "What is the game-based test?", "answer": "It is a cognitive test evaluating memory, spatial reasoning, and concentration through brief interactive mini-games like pattern matching and block calculation."}
        ])
    },
    {
        "name": "Cognizant",
        "min_cgpa": 6.0,
        "required_skills": "Java, SQL, HTML/CSS, Python, Aptitude, Software Engineering Basics",
        "eligibility": "B.E./B.Tech/MCA/M.Sc. CGPA 6.0+.",
        "pattern": "Cognizant GenC / GenC Elevate Test (Aptitude, Programming MCQs, Coding) + Technical Interview + HR Round.",
        "rounds": json.dumps([
            "Online Aptitude & Programming Test",
            "Coding Assessment (GenC Elevate track - 2 coding questions)",
            "Technical Interview (OOP, SQL Queries, Web Tech)",
            "HR Round"
        ]),
        "package": "4.0 - 10.0 LPA",
        "preparation_tips": "GenC Elevate offers higher packages. Practice core Java, database tables, primary/foreign keys, joins, and basic HTML/CSS design. Keep basic projects well documented.",
        "faqs": json.dumps([
            {"question": "What is the difference between GenC and GenC Elevate?", "answer": "GenC is the standard systems engineer track (4 LPA) emphasizing general technical MCQs. GenC Elevate (6.75 - 10 LPA) requires passing a coding assessment and advanced developer rounds."}
        ])
    },
    {
        "name": "TCS",
        "min_cgpa": 6.0,
        "required_skills": "C, Java, Python, SQL, Quantitative Aptitude, Verbal Aptitude, Reasoning",
        "eligibility": "B.E. / B.Tech / M.E. / M.Tech / MCA / M.Sc. CGPA 6.0+.",
        "pattern": "TCS NQT (National Qualifier Test) divided into Foundation Section and Advanced Section (for Digital/Prime profiles), followed by a combined Technical, Managerial, and HR Interview.",
        "rounds": json.dumps([
            "TCS NQT Part A (Foundation: Aptitude, Reasoning, Verbal)",
            "TCS NQT Part B (Advanced: Advanced Cognitive + Coding)",
            "Combined F2F Technical, Managerial & HR Interview"
        ]),
        "package": "3.36 - 9.0 LPA",
        "preparation_tips": "Practice standard aptitude questions (Time-Speed-Distance, Percentages, Permutations). Clear the advanced coding questions to qualify for TCS Digital (7.0 LPA) or TCS Prime (9.0 LPA) instead of TCS Ninja (3.36 LPA). Prepare DBMS, OOP, and basic coding syntax.",
        "faqs": json.dumps([
            {"question": "How are the TCS packages differentiated?", "answer": "TCS has three tiers based on NQT results: Ninja (3.36 LPA), Digital (7.0 LPA), and Prime (9.0 LPA). Doing well in the coding section is crucial for Digital/Prime interview calls."}
        ])
    },
    {
        "name": "Infosys",
        "min_cgpa": 6.0,
        "required_skills": "Java, Python, C++, Data Structures, DBMS, Software Engineering, Quantitative Aptitude",
        "eligibility": "B.E./B.Tech/M.E./M.Tech/MCA/M.Sc. CGPA 6.0+.",
        "pattern": "Infosys SP (Specialist Programmer) / DSE (Digital Specialist Engineer) exams like HackWithInfy, or general Infosys hiring, followed by Tech and HR Interviews.",
        "rounds": json.dumps([
            "Infosys Online Test (Aptitude, Pseudo-code, Programming)",
            "Technical Interview (Core SDE, Coding, Projects)",
            "HR Round"
        ]),
        "package": "3.6 - 9.5 LPA",
        "preparation_tips": "Infosys online coding test is known for competitive-programming styled questions for Specialist Programmer (9.5 LPA) track. Solidify understanding of Greedy, Dynamic Programming, and Math algorithms. Prepare basic SQL and OS.",
        "faqs": json.dumps([
            {"question": "Can non-CS students apply for Specialist Programmer roles?", "answer": "Yes. Infosys allows all engineering branches to participate, as long as you clear their programming assessments."}
        ])
    }
]

def seed_companies(db: Session):
    existing_count = db.query(Company).count()
    if existing_count > 0:
        print(f"Database already contains {existing_count} companies. Skipping seeding.")
        return
        
    print("Seeding company records...")
    for comp_data in COMPANIES_SEED_DATA:
        company = Company(**comp_data)
        db.add(company)
    
    db.commit()
    print("Company seeding complete!")
