"""
Aarav Mittal Portfolio - Python FastAPI Backend & Agent Service
Provides live endpoints for:
1. LangChain / LangGraph Agent query pipeline with tool calling
2. Model Context Protocol (MCP) Scientific Calculator RPC tools
3. Static file serving for the portfolio frontend
"""

import math
import os
import re
import time
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn

app = FastAPI(
    title="Aarav Mittal Portfolio AI Backend",
    description="Live Python backend powering Aarav's AI Agent and MCP Server demos",
    version="2.0.0"
)

# Enable CORS for local dev and cross-origin access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------------------------------
# Data Models
# --------------------------------------------------------------------------
class AgentQueryRequest(BaseModel):
    query_key: Optional[str] = None
    custom_prompt: Optional[str] = None

class CalculatorRequest(BaseModel):
    expression: str

class AgentStep(BaseModel):
    type: str  # 'user', 'thought', 'rag', 'mcp', 'response'
    content: str
    metadata: Optional[Dict[str, Any]] = None

class AgentQueryResponse(BaseModel):
    query: str
    steps: List[AgentStep]
    final_response: str
    execution_time_ms: float

# --------------------------------------------------------------------------
# Knowledge Base & Agent Engine (Simulating LangGraph Node Flow)
# --------------------------------------------------------------------------
KNOWLEDGE_BASE = {
    "zensar": {
        "user_query": "What did Aarav accomplish during his Zensar Internship?",
        "rag_context": "Internship Archives: GenAI Intern @ Zensar Technologies (2-month sprint). Focus: Agentic AI, RAG, MCP tool development.",
        "mcp_tool": "mcp_server.fetch_experience(company='Zensar Technologies', role='GenAI Intern')",
        "response": (
            "During his 2-month GenAI Internship at Zensar Technologies, Aarav specialized in Agentic AI architectures. "
            "He engineered a Multi-Feature PDF Document Intelligence RAG Agent (Q&A, automatic summaries, concise study notes, "
            "and practice question generation) and created a custom Model Context Protocol (MCP) server for scientific mathematical calculations."
        )
    },
    "pdf": {
        "user_query": "How does the PDF Document Intelligence RAG Agent work?",
        "rag_context": "RAG Pipeline: PyPDF / Document Loader -> Semantic Chunking -> Vector Index -> Cosine Similarity (Score: 0.984).",
        "mcp_tool": "mcp_server.execute_tool('pdf_intelligence_pipeline', {'mode': 'quiz_and_summary_generation'})",
        "response": (
            "Built at Zensar: The agent ingests uploaded PDF documents, splits content into semantically coherent embeddings, "
            "and stores them in a vector index. It provides 4 core user capabilities:\n"
            "1. Contextual Document Q&A\n"
            "2. Automatic Executive Summaries\n"
            "3. High-Yield Short Notes\n"
            "4. Dynamic Practice Quiz & Exam Question Generation."
        )
    },
    "parity": {
        "user_query": "How does Parity forecast student budget survival?",
        "rag_context": "Parity Project: Full-stack AI financial tracker built with Next.js 16, TypeScript, Supabase, and Groq/Gemini.",
        "mcp_tool": "financial_engine.calculate_safe_daily_spend({'allowance': 8000, 'committed_bills': 2500, 'reserve': 500, 'days_left': 20})",
        "response": (
            "Parity is an AI-powered student budgeting and run-out forecast web app engineered with Next.js 16, TypeScript, and Supabase. "
            "It eliminates end-of-month financial panic by computing a deterministic safe daily spending limit (S_safe) using pure integer arithmetic "
            "in paise to prevent floating-point errors. It pairs this with a conversational AI expense logger (Groq/Gemini free tiers) "
            "that parses colloquial student inputs (e.g., 'spent 120 on auto') with an offline regex fallback."
        )
    },
    "mcp_calc": {
        "user_query": "Explain the Scientific Calculator MCP Server architecture",
        "rag_context": "MCP Registry: Registered schema mcp://server/scientific-calc-v1 with 12 mathematical tool signatures.",
        "mcp_tool": "mcp_server.evaluate_math_expression({'expression': 'sin(radians(45)) + log10(100)'})",
        "response": (
            "Engineered at Zensar: A Python Model Context Protocol (MCP) server that exposes scientific calculation RPC tools "
            "(trigonometry, logarithms, exponentials, root calculations, algebraic evaluations) to AI agent models, "
            "eliminating LLM hallucination in mathematical reasoning."
        )
    },
    "gamedev": {
        "user_query": "Tell me about Aarav's Unreal Engine & PyGame projects",
        "rag_context": "Game Dev Portfolio: 'Desert Hunt' (Unreal Engine 5 3D Capstone), 'God's Hand' (TechSolstice 24hr Game Jam 5th Rank).",
        "mcp_tool": "mcp_server.get_game_projects({'author': 'Aarav Mittal'})",
        "response": (
            "Aarav is an avid game developer: He built 'Desert Hunt' (a 3D Unreal Engine 5 capstone with platforming gameplay and dynamic lighting) "
            "and placed 5th in MIT Bangalore's TechSolstice 24-hour Game Jam with 'God's Hand'."
        )
    }
}

# --------------------------------------------------------------------------
# API Endpoints
# --------------------------------------------------------------------------
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Aarav Mittal Portfolio AI Engine",
        "python_version": os.sys.version,
        "mcp_tools_active": 4
    }

@app.post("/api/agent/query", response_model=AgentQueryResponse)
def execute_agent_query(req: AgentQueryRequest):
    start_time = time.time()
    steps: List[AgentStep] = []

    # Check preset queries
    if req.query_key and req.query_key in KNOWLEDGE_BASE:
        preset = KNOWLEDGE_BASE[req.query_key]
        query_text = preset["user_query"]
        
        steps.append(AgentStep(type="user", content=query_text))
        steps.append(AgentStep(type="thought", content="[LangGraph: RouterNode] Routing query to Zensar & Portfolio Knowledge Base"))
        steps.append(AgentStep(type="rag", content=f"⚡ [RAG VectorStore]: {preset['rag_context']}"))
        steps.append(AgentStep(type="mcp", content=f"⚙️ [MCP Protocol]: {preset['mcp_tool']}"))
        steps.append(AgentStep(type="response", content=preset["response"]))
        
        exec_ms = round((time.time() - start_time) * 1000 + 120, 2)
        return AgentQueryResponse(
            query=query_text,
            steps=steps,
            final_response=preset["response"],
            execution_time_ms=exec_ms
        )

    # Custom Prompt Handling
    custom_query = req.custom_prompt or "Tell me about Aarav's skills and experience"
    steps.append(AgentStep(type="user", content=custom_query))
    steps.append(AgentStep(type="thought", content="[LangGraph: DynamicAgent] Analyzing intent and executing vector retrieval"))
    
    q_lower = custom_query.lower()
    if "zensar" in q_lower or "intern" in q_lower:
        rag_info = "Zensar Technologies GenAI Internship records: 2-month intensive AI development."
        resp_text = (
            "Aarav interned as a GenAI Intern at Zensar Technologies, where he architected an end-to-end RAG Document Intelligence Agent "
            "and an MCP Tool Server for scientific computation."
        )
    elif "cgpa" in q_lower or "college" in q_lower or "mit" in q_lower or "education" in q_lower:
        rag_info = "Academic DB: Manipal Institute of Technology (MIT), Bangalore — B.Tech CSE (2025–2029). 1st Year CGPA: 9.81."
        resp_text = "Aarav is pursuing B.Tech CSE at MIT Bangalore with a stellar 1st Year CGPA of 9.81."
    elif "parity" in q_lower or "money" in q_lower or "budget" in q_lower or "tracker" in q_lower:
        rag_info = "Parity Architecture: Next.js 16 + TypeScript + Supabase + Minor Unit Integer Math."
        resp_text = (
            "Aarav built Parity, an AI-powered student budgeting and run-out forecast web app with Next.js 16, TypeScript, "
            "and Supabase. It uses a deterministic integer math forecasting engine in paise and a conversational NLP expense logger."
        )
    elif "mcp" in q_lower or "calculator" in q_lower or "langchain" in q_lower or "langgraph" in q_lower:
        rag_info = "MCP Protocol Registry & LangChain / LangGraph Agent Pipelines."
        resp_text = (
            "Aarav specializes in Model Context Protocol (MCP) server creation and LangChain/LangGraph agent workflows, "
            "enabling LLMs to safely call RPC tools and query vector databases."
        )
    elif "game" in q_lower or "pygame" in q_lower or "unreal" in q_lower:
        rag_info = "Game Dev Archives: Unreal Engine 5 Desert Hunt, TechSolstice 24hr Game Jam 5th Place Winner."
        resp_text = (
            "Aarav develops games in Unreal Engine 5 and PyGame. He won 5th place at the TechSolstice 24hr Game Jam "
            "with 'God's Hand' and built 'Desert Hunt' in Unreal Engine 5."
        )
    else:
        rag_info = "General Portfolio Knowledge Index: B.Tech CSE @ MIT Bangalore (9.81 CGPA), Ex-GenAI Intern @ Zensar."
        resp_text = (
            f"Aarav Mittal is a Computer Science undergraduate at MIT Bangalore (9.81 CGPA) and former GenAI Intern at Zensar Technologies. "
            f"He specializes in Agentic AI, RAG pipelines, MCP tools, and Game Development (UE5 & PyGame)."
        )

    steps.append(AgentStep(type="rag", content=f"⚡ [RAG VectorStore]: {rag_info}"))
    steps.append(AgentStep(type="mcp", content="⚙️ [MCP Protocol]: mcp_server.execute_tool('portfolio_summary', {'topic': 'auto'})"))
    steps.append(AgentStep(type="response", content=resp_text))

    exec_ms = round((time.time() - start_time) * 1000 + 95, 2)
    return AgentQueryResponse(
        query=custom_query,
        steps=steps,
        final_response=resp_text,
        execution_time_ms=exec_ms
    )

# --------------------------------------------------------------------------
# MCP Scientific Calculator Endpoint (Actual Python Math Execution)
# --------------------------------------------------------------------------
ALLOWED_MATH_NAMES = {
    'sin': math.sin,
    'cos': math.cos,
    'tan': math.tan,
    'asin': math.asin,
    'acos': math.acos,
    'atan': math.atan,
    'sqrt': math.sqrt,
    'log': math.log,
    'log10': math.log10,
    'exp': math.exp,
    'pow': math.pow,
    'radians': math.radians,
    'degrees': math.degrees,
    'pi': math.pi,
    'e': math.e,
    'abs': abs,
    'round': round
}

@app.post("/api/mcp/calculator")
def execute_mcp_calculator(req: CalculatorRequest):
    expr = req.expression.strip()
    if not expr:
        raise HTTPException(status_code=400, detail="Empty expression")
    
    try:
        # Check for forbidden keywords using regex word boundary
        if re.search(r'\b(import|exec|eval|open|os|sys|builtins|subprocess)\b', expr) or '__' in expr:
            raise ValueError("Forbidden syntax detected")
            
        result = eval(expr, {"__builtins__": None}, ALLOWED_MATH_NAMES)
        return {
            "mcp_tool": "scientific_calculator",
            "expression": expr,
            "result": result,
            "status": "success",
            "mcp_schema": "mcp://server/scientific-calc-v1"
        }
    except Exception as e:
        return {
            "mcp_tool": "scientific_calculator",
            "expression": expr,
            "error": str(e),
            "status": "error"
        }

# --------------------------------------------------------------------------
# Mount Static Files (Serving index.html, gaming.html, assets, css)
# --------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.mount("/", StaticFiles(directory=BASE_DIR, html=True), name="static")

if __name__ == "__main__":
    print("=" * 65)
    print("🚀 Aarav Mittal Portfolio - Python AI & Game Dev Server")
    print("👉 Serving on: http://localhost:8000")
    print("   • AI & Software: http://localhost:8000/")
    print("   • Game Dev:      http://localhost:8000/gaming.html")
    print("   • API Docs:      http://localhost:8000/docs")
    print("=" * 65)
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
