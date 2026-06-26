import os
import pickle
import logging
import numpy as np
from backend.config import settings

logger = logging.getLogger(__name__)

# Fallback structures in case libraries are still installing/loading
FAISS_AVAILABLE = False
SentenceTransformer = None
faiss = None

try:
    import faiss
    from sentence_transformers import SentenceTransformer
    FAISS_AVAILABLE = True
    logger.info("FAISS and SentenceTransformers loaded successfully.")
except ImportError:
    logger.warning("FAISS or SentenceTransformers not available yet. Using keyword-based fallback for search.")

class VectorDB:
    def __init__(self):
        self.index_path = os.path.join(settings.VECTOR_DB_DIR, "faiss_index.bin")
        self.metadata_path = os.path.join(settings.VECTOR_DB_DIR, "metadata.pkl")
        self.model = None
        self.index = None
        self.documents = []  # List of dict: {"id": str/int, "text": str, "metadata": dict}
        self.dimension = 384  # Dimension of all-MiniLM-L6-v2
        
        self.load_model()
        self.load_index()

    def load_model(self):
        global FAISS_AVAILABLE
        if FAISS_AVAILABLE and SentenceTransformer is not None:
            try:
                # Load all-MiniLM-L6-v2 model (384 dimensions)
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
            except Exception as e:
                logger.error(f"Error loading SentenceTransformer: {e}")
                self.model = None

    def load_index(self):
        if FAISS_AVAILABLE and faiss is not None:
            if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
                try:
                    self.index = faiss.read_index(self.index_path)
                    with open(self.metadata_path, 'rb') as f:
                        self.documents = pickle.load(f)
                    logger.info(f"Loaded existing FAISS index with {len(self.documents)} documents.")
                    return
                except Exception as e:
                    logger.error(f"Error loading existing index: {e}")
            
            # Create a new index if it doesn't exist or loading failed
            self.index = faiss.IndexFlatL2(self.dimension)
            self.documents = []
            logger.info("Initialized a new empty FAISS index.")
        else:
            # Fallback loading metadata only
            if os.path.exists(self.metadata_path):
                try:
                    with open(self.metadata_path, 'rb') as f:
                        self.documents = pickle.load(f)
                    logger.info(f"Loaded {len(self.documents)} documents for keyword-based search.")
                except Exception as e:
                    logger.error(f"Error loading metadata: {e}")

    def save_index(self):
        try:
            if FAISS_AVAILABLE and faiss is not None and self.index is not None:
                faiss.write_index(self.index, self.index_path)
            with open(self.metadata_path, 'wb') as f:
                pickle.dump(self.documents, f)
            logger.info("FAISS index and metadata saved to disk.")
        except Exception as e:
            logger.error(f"Error saving FAISS index: {e}")

    def add_documents(self, docs: list[dict]):
        """
        docs is a list of dict, each: {"id": str/int, "text": str, "metadata": dict}
        """
        if not docs:
            return
            
        # Avoid duplicate documents
        existing_texts = {d['text'] for d in self.documents}
        new_docs = [d for d in docs if d['text'] not in existing_texts]
        
        if not new_docs:
            return

        # Handle embedding extraction
        if FAISS_AVAILABLE and self.model is not None and self.index is not None:
            texts = [d['text'] for d in new_docs]
            try:
                embeddings = self.model.encode(texts, convert_to_numpy=True)
                # Convert to float32 for faiss
                embeddings = embeddings.astype('float32')
                self.index.add(embeddings)
                self.documents.extend(new_docs)
                self.save_index()
            except Exception as e:
                logger.error(f"Failed to add documents to FAISS index: {e}")
                # Fallback to metadata only
                self.documents.extend(new_docs)
                self.save_index()
        else:
            self.documents.extend(new_docs)
            self.save_index()

    def search(self, query: str, k: int = 3) -> list[dict]:
        """Search similar documents. Falls back to keyword search if FAISS is not available."""
        if not self.documents:
            return []

        # Check if vector DB is active
        if FAISS_AVAILABLE and self.model is not None and self.index is not None and self.index.ntotal > 0:
            try:
                query_vector = self.model.encode([query], convert_to_numpy=True).astype('float32')
                distances, indices = self.index.search(query_vector, min(k, self.index.ntotal))
                
                results = []
                for dist, idx in zip(distances[0], indices[0]):
                    if idx >= 0 and idx < len(self.documents):
                        doc = self.documents[idx].copy()
                        doc['distance'] = float(dist)
                        results.append(doc)
                return results
            except Exception as e:
                logger.error(f"FAISS search failed, falling back: {e}")
                
        # Keyword-based / substring score fallback search
        logger.info("Executing keyword-based search fallback.")
        query_words = query.lower().split()
        scored_docs = []
        for doc in self.documents:
            text = doc['text'].lower()
            score = sum(1 for word in query_words if word in text)
            if score > 0:
                scored_docs.append((score, doc))
        
        # Sort by score descending
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored_docs[:k]]

# Singleton instance
vector_db = VectorDB()

def reinitialize_libraries():
    """Attempt to reload FAISS & SentenceTransformers if they were installed after first load."""
    global FAISS_AVAILABLE, SentenceTransformer, faiss
    try:
        import faiss
        from sentence_transformers import SentenceTransformer
        FAISS_AVAILABLE = True
        logger.info("FAISS and SentenceTransformers reloaded successfully.")
        vector_db.load_model()
        vector_db.load_index()
    except ImportError:
        pass

def seed_vector_db_with_companies(companies: list):
    """Seed the vector DB with company requirements and information."""
    docs = []
    for comp in companies:
        text = f"Company: {comp.name}\n" \
               f"Package: {comp.package}\n" \
               f"Minimum CGPA Required: {comp.min_cgpa}\n" \
               f"Required Skills: {comp.required_skills}\n" \
               f"Eligibility Criteria: {comp.eligibility}\n" \
               f"Interview Pattern: {comp.pattern}\n" \
               f"Preparation Tips: {comp.preparation_tips}"
        
        docs.append({
            "id": f"company_{comp.id}",
            "text": text,
            "metadata": {
                "type": "company",
                "name": comp.name,
                "id": comp.id
            }
        })
        
    # Also add general placement resources
    general_notes = [
        {
            "id": "note_dbms_normalization",
            "text": "DBMS Normalization: Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity. 1NF: Eliminate duplicate columns, create separate tables for related data. 2NF: Meet 1NF, remove subset data that applies to multiple rows and place in separate tables, create relationships using foreign keys (no partial dependency). 3NF: Meet 2NF, remove columns that do not depend on the primary key (no transitive dependency). BCNF: Stronger version of 3NF where every determinant must be a candidate key.",
            "metadata": {"type": "note", "title": "DBMS Normalization"}
        },
        {
            "id": "note_dsa_interview_prep",
            "text": "Data Structures & Algorithms (DSA) Interview Prep: Key topics include Array manipulation (two pointers, sliding window), String processing, Linked Lists, Trees (DFS/BFS traversals, BST properties), Graphs (Dijkstra's, MST, cycle detection), Dynamic Programming (Knapsack, LCS, LIS), Sorting and Searching. Practice explaining time complexity (Big O) and space complexity for all solutions.",
            "metadata": {"type": "note", "title": "DSA Preparation"}
        },
        {
            "id": "note_sql_queries",
            "text": "SQL Notes & Interview Queries: Common topics are Joins (INNER, LEFT, RIGHT, FULL), Grouping data (GROUP BY, HAVING), Window functions (ROW_NUMBER, RANK, DENSE_RANK), Subqueries, Common Table Expressions (CTEs), Indexing (Clustered vs Non-Clustered), Transactions (ACID properties - Atomicity, Consistency, Isolation, Durability). Practice writing queries to find second highest salary: SELECT MAX(Salary) FROM Employee WHERE Salary < (SELECT MAX(Salary) FROM Employee).",
            "metadata": {"type": "note", "title": "SQL Interview Prep"}
        },
        {
            "id": "note_resume_writing",
            "text": "Resume Writing and ATS Compatibility Tips: A standard resume should fit on one page. Structure sections clearly: Contact Info, Summary, Education, Skills, Projects, Experience, Certifications. Use active verbs (e.g., Developed, Optimized, Integrated) and quantify achievements (e.g., 'Reduced processing latency by 20%'). ATS scanners search for direct keyword matches, so align your skills list with the target job description. Avoid graphics, charts, or tables that confuse parser tools.",
            "metadata": {"type": "note", "title": "Resume & ATS Optimization"}
        }
    ]
    docs.extend(general_notes)
    
    vector_db.add_documents(docs)
