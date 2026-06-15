from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import fitz 
import datetime
from groq import Groq
from serpapi import GoogleSearch      # NAYA IMPORT: Google Patents ke liye
from duckduckgo_search import DDGS    # NAYA IMPORT: Free Fallback ke liye

from app.database import client, chunks_collection
from app.utils import get_text_chunks, get_embedding

app = FastAPI(
    title="PatentGuard AI API",
    description="Backend API for AI-powered legal intelligence platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === API KEYS (YAHAN APNI KEYS DALEIN) ===
groq_client = Groq(api_key="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")
SERPAPI_KEY = "a7f87dc19101c03281ac0f4cef9adfde5339b93508f0be34a06ff321f934cbe0" # Yahan wo nayi lambi si key paste karein

class SearchQuery(BaseModel):
    question: str

class LiveSearchQuery(BaseModel):
    query: str

@app.on_event("startup")
async def startup_db_client():
    try:
        if client:
            await client.admin.command('ping')
            print("✅ Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

@app.get("/")
async def root():
    return {"status": "success", "message": "Welcome to PatentGuard AI Engine."}

@app.post("/api/v1/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        content = await file.read()
        pdf_document = fitz.open(stream=content, filetype="pdf")
        extracted_text = ""
        for page_num in range(pdf_document.page_count):
            page = pdf_document.load_page(page_num)
            extracted_text += page.get_text()
            
        chunks = get_text_chunks(extracted_text)
        
        documents_to_insert = []
        for i, chunk in enumerate(chunks):
            embedding_vector = get_embedding(chunk)
            doc = {
                "filename": file.filename,
                "chunk_index": i,
                "text": chunk,
                "embedding": embedding_vector,
                "uploaded_at": datetime.datetime.utcnow()
            }
            documents_to_insert.append(doc)
            
        if documents_to_insert:
            await chunks_collection.insert_many(documents_to_insert)
            
        return {
            "filename": file.filename,
            "total_chunks_saved": len(chunks),
            "message": "Document chunks & embeddings successfully saved to MongoDB!"
        }
    except Exception as e:
        return {"error": f"Failed to process document: {str(e)}"}

@app.post("/api/v1/search")
async def search_document(query: SearchQuery):
    try:
        question_embedding = get_embedding(query.question)
        pipeline = [
            {"$vectorSearch": {"index": "vector_index", "path": "embedding", "queryVector": question_embedding, "numCandidates": 50, "limit": 3}},
            {"$project": {"_id": 0, "text": 1, "filename": 1, "score": {"$meta": "vectorSearchScore"}}}
        ]
        results = await chunks_collection.aggregate(pipeline).to_list(length=3)
        context_text = "\n\n".join([doc["text"] for doc in results])
        prompt = f"""You are a helpful AI assistant. Answer the user's question based ONLY on the context below. 
        Context:\n{context_text}\n\nQuestion:\n{query.question}"""
        
        chat_completion = groq_client.chat.completions.create(messages=[{"role": "user", "content": prompt}], model="llama-3.1-8b-instant")
        return {"question": query.question, "ai_answer": chat_completion.choices[0].message.content, "top_matches": results}
    except Exception as e:
        return {"error": f"Failed to search: {str(e)}"}

@app.delete("/api/v1/documents/clear")
async def clear_database():
    try:
        result = await chunks_collection.delete_many({})
        return {"status": "success", "message": f"Database cleared successfully! Deleted {result.deleted_count} chunks."}
    except Exception as e:
        return {"error": f"Failed to clear database: {str(e)}"}

@app.get("/api/v1/auto-analyze")
async def auto_analyze_document():
    try:
        pipeline = [{"$sort": {"uploaded_at": -1}}, {"$limit": 15}]
        results = await chunks_collection.aggregate(pipeline).to_list(length=15)
        
        if not results:
            return {"error": "Database is empty. Please upload a document first."}
            
        context_text = "\n\n".join([doc["text"] for doc in results])
        
        prompt = f"""
        You are an expert Patent Attorney and AI Legal Assistant.
        Analyze the following patent document context and provide a structured report.
        You MUST divide your response into exactly three sections using these exact headings:
        ### 1. Claim Analysis
        ### 2. Legal Consistency Review
        ### 3. Improvement Suggestions

        Document Context:
        {context_text}
        """
        
        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
        )
        
        ai_answer = chat_completion.choices[0].message.content
        parts = ai_answer.split("###")
        claim_analysis, legal_review, suggestions = "Data not found.", "Data not found.", "Data not found."
        
        for part in parts:
            if "1. Claim Analysis" in part:
                claim_analysis = part.replace("1. Claim Analysis", "").strip()
            elif "2. Legal Consistency Review" in part:
                legal_review = part.replace("2. Legal Consistency Review", "").strip()
            elif "3. Improvement Suggestions" in part:
                suggestions = part.replace("3. Improvement Suggestions", "").strip()

        return {"claim_analysis": claim_analysis, "legal_review": legal_review, "suggestions": suggestions}
    except Exception as e:
        return {"error": f"Failed to generate analysis: {str(e)}"}

# === NAYA MAGIC CODE: Double Engine Live Internet Search ===
@app.post("/api/v1/live-search")
async def live_patent_search(payload: LiveSearchQuery):
    search_term = payload.query
    live_results = []
    used_engine = "None"

    try:
        # ENGINE 1: SerpApi (Google Patents - Premium Data)
        params = {
            "engine": "google_patents",
            "q": search_term,
            "api_key": SERPAPI_KEY
        }
        search = GoogleSearch(params)
        results = search.get_dict()
        
        if "organic_results" in results:
            for res in results["organic_results"][:3]: # Top 3 nikalenge
                live_results.append({
                    "title": res.get("title", "No Title"),
                    "snippet": res.get("snippet", "No description available."),
                    "link": res.get("link", "#")
                })
            used_engine = "Google Patents API (Premium)"
        else:
            raise Exception("No results from SerpApi, switching to fallback.")
            
    except Exception as e:
        print(f"SerpApi failed: {e}. Switching to DuckDuckGo...")
        # ENGINE 2: DuckDuckGo (Free Fallback)
        try:
            ddgs_results = DDGS().text(f"{search_term} patent", max_results=3)
            for res in ddgs_results:
                live_results.append({
                    "title": res.get("title", "No Title"),
                    "snippet": res.get("body", "No description available."),
                    "link": res.get("href", "#")
                })
            used_engine = "DuckDuckGo (Free Fallback)"
        except Exception as ddg_e:
            return {"error": f"Both search engines failed. Error: {str(ddg_e)}"}

    if not live_results:
        return {"error": "No live prior-art found for this query on the internet."}

    # AI Brain se Summary banwana
    context_text = "\n\n".join([f"Title: {r['title']}\nSnippet: {r['snippet']}" for r in live_results])
    
    prompt = f"""
    You are an expert Patent Analyst. Analyze the following real-time internet search results for prior-art.
    Write a short summary telling the user if these existing patents match or conflict with their idea: '{search_term}'.
    
    Live Internet Data:
    {context_text}
    """
    
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
        )
        ai_summary = chat_completion.choices[0].message.content
    except:
        ai_summary = "AI summary generation failed, but raw links are provided below."

    return {
        "query": search_term,
        "engine_used": used_engine,
        "ai_summary": ai_summary,
        "raw_results": live_results
    }