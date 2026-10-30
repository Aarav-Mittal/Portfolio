// ==========================================================================
// AARAV MITTAL - PORTFOLIO INTERACTIVITY & PYTHON ENGINE RUNNER
// ==========================================================================

const API_BASE = window.location.origin;

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkBackendHealth();

    const modal = document.getElementById('ue5-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeUE5Modal();
        });
    }
});

/* -------------------------------------------------------------------------- */
/* 1. Theme Management (Light / Dark Mode)                                    */
/* -------------------------------------------------------------------------- */
function initTheme() {
    const toggleBtn = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('aarav_portfolio_theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('aarav_portfolio_theme', next);
            updateThemeIcon(next);
        });
    }
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    if (theme === 'dark') {
        btn.innerHTML = '<i class="fa-regular fa-sun"></i>';
        btn.title = "Switch to light mode";
    } else {
        btn.innerHTML = '<i class="fa-regular fa-moon"></i>';
        btn.title = "Switch to dark mode";
    }
}

/* -------------------------------------------------------------------------- */
/* 2. Backend Health Check                                                    */
/* -------------------------------------------------------------------------- */
async function checkBackendHealth() {
    const badge = document.getElementById('backend-badge');
    if (!badge) return;
    try {
        const res = await fetch(`${API_BASE}/api/health`, { method: 'GET' });
        if (res.ok) {
            badge.innerHTML = '<i class="fa-solid fa-circle" style="font-size: 0.5rem; color: var(--status-green);"></i> FastAPI Python Active';
        } else {
            setFallbackBadge(badge);
        }
    } catch {
        setFallbackBadge(badge);
    }
}

function setFallbackBadge(badge) {
    if (!badge) return;
    badge.innerHTML = '<i class="fa-solid fa-circle" style="font-size: 0.5rem; color: var(--accent);"></i> Client REPL Active';
}

/* -------------------------------------------------------------------------- */
/* 3. Python Agent Query Flow (FastAPI + Fallback)                            */
/* -------------------------------------------------------------------------- */
const LOCAL_KNOWLEDGE = {
    zensar: {
        steps: [
            { type: "user", content: "What did Aarav accomplish during his Zensar Internship?" },
            { type: "thought", content: "[LangGraph: RouterNode] Querying Zensar GenAI archives (2-month sprint)" },
            { type: "rag", content: "⚡ [RAG VectorStore]: GenAI Intern @ Zensar Technologies. Focus: Agentic AI, RAG, MCP tool development." },
            { type: "mcp", content: "⚙️ [MCP Protocol]: mcp_server.fetch_experience(company='Zensar Technologies', role='GenAI Intern')" },
            { type: "response", content: "During his 2-month GenAI Internship at Zensar Technologies, Aarav specialized in Agentic AI architectures. He engineered a Multi-Feature PDF Document Intelligence RAG Agent (Q&A, summaries, notes, practice quiz generator) and created a custom Model Context Protocol (MCP) server for scientific mathematical calculations." }
        ]
    },
    pdf: {
        steps: [
            { type: "user", content: "How does the PDF Document Intelligence RAG Agent work?" },
            { type: "thought", content: "[LangGraph: RouterNode] Inspecting PDF Vector Index Pipeline" },
            { type: "rag", content: "⚡ [RAG VectorStore]: PyPDF -> Semantic Chunking -> Vector Index -> Cosine Similarity (Score: 0.984)." },
            { type: "mcp", content: "⚙️ [MCP Protocol]: mcp_server.execute_tool('pdf_intelligence_pipeline', {'mode': 'quiz_and_summary_generation'})" },
            { type: "response", content: "Built at Zensar: The agent ingests uploaded PDF documents, splits content into semantically coherent embeddings, and provides 4 core capabilities:\n1. Contextual Document Q&A\n2. Automatic Executive Summaries\n3. High-Yield Short Notes\n4. Dynamic Practice Quiz & Exam Question Generation." }
        ]
    },
    parity: {
        steps: [
            { type: "user", content: "How does Parity forecast student budget survival?" },
            { type: "thought", content: "[Parity: FinancialEngine] Computing available balance, obligations & safe daily spend" },
            { type: "rag", content: "⚡ [Ledger & Formula]: S_safe = floor(M_discretionary / D_remaining) with integer paise minor units." },
            { type: "mcp", content: "⚙️ [AI Adapter]: groq.chat_completion(model='qwen/qwen3.8-27b', user_input='spent 120 on auto')" },
            { type: "response", content: "Parity is an AI-powered student budgeting and run-out forecast web app built with Next.js 16, TypeScript, and Supabase. It eliminates end-of-month panic by calculating a deterministic safe daily spend limit (S_safe) using integer paise arithmetic (zero floating-point math bugs) paired with a conversational natural language expense logger." }
        ]
    },
    mcp_calc: {
        steps: [
            { type: "user", content: "Explain the Scientific Calculator MCP Server architecture" },
            { type: "thought", content: "[LangGraph: RouterNode] Inspecting registered MCP schemas: mcp://server/scientific-calc-v1" },
            { type: "rag", content: "⚡ [RAG VectorStore]: MCP Registry schema with 12 mathematical tool RPC signatures." },
            { type: "mcp", content: "⚙️ [MCP Protocol]: mcp_server.evaluate_math_expression({'expression': 'sin(radians(45)) + log10(100)'})" },
            { type: "response", content: "Engineered at Zensar: A Python Model Context Protocol (MCP) server exposing scientific calculation RPC tools (trigonometry, logarithms, exponentials, roots, algebra) to AI agents, eliminating LLM hallucination in mathematical reasoning." }
        ]
    }
};

async function triggerQuery(queryKey) {
    const terminal = document.getElementById('hero-terminal');
    if (!terminal) return;

    terminal.innerHTML = '<div class="term-thought">⏳ [FastAPI Agent]: Executing query through LangGraph routing...</div>';

    try {
        const response = await fetch(`${API_BASE}/api/agent/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query_key: queryKey })
        });

        if (response.ok) {
            const data = await response.json();
            await streamSteps(terminal, data.steps);
            return;
        }
    } catch {
        // Fallback gracefully
    }

    const fallback = LOCAL_KNOWLEDGE[queryKey];
    if (fallback) {
        await streamSteps(terminal, fallback.steps);
    }
}

async function testMCPMath() {
    const input = document.getElementById('mcp-math-input');
    const terminal = document.getElementById('hero-terminal');
    if (!input || !terminal || !input.value.trim()) return;

    const expr = input.value.trim();
    terminal.innerHTML = '<div class="term-mcp">⚙️ [MCP Protocol]: Dispatching RPC call to /api/mcp/calculator...</div>';

    try {
        const response = await fetch(`${API_BASE}/api/mcp/calculator`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expression: expr })
        });

        if (response.ok) {
            const data = await response.json();
            const steps = [
                { type: "user", content: `Evaluate Math RPC: ${expr}` },
                { type: "mcp", content: `⚙️ [MCP Tool Call]: scientific_calculator.evaluate({'expression': '${expr}'})` },
                { type: "response", content: `MCP Tool Result: ${data.result}\nSchema: ${data.mcp_schema || 'mcp://server/scientific-calc-v1'}\nStatus: ${data.status}` }
            ];
            await streamSteps(terminal, steps);
            return;
        }
    } catch {
        // Fallback
    }

    try {
        const cleanExpr = expr.replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos').replace(/sqrt/g, 'Math.sqrt').replace(/radians\((\d+)\)/g, '($1 * Math.PI / 180)');
        const res = eval(cleanExpr);
        const steps = [
            { type: "user", content: `Evaluate Math RPC: ${expr}` },
            { type: "mcp", content: `⚙️ [MCP Tool Call]: scientific_calculator.evaluate({'expression': '${expr}'})` },
            { type: "response", content: `MCP Tool Result: ${res}\nSchema: mcp://server/scientific-calc-v1\nStatus: success (client fallback)` }
        ];
        await streamSteps(terminal, steps);
    } catch (e) {
        terminal.innerHTML = `<div class="term-resp" style="border-left-color: #ef4444;">Error evaluating expression: ${e.message}</div>`;
    }
}

async function streamSteps(terminal, steps) {
    terminal.innerHTML = '';
    for (const step of steps) {
        const line = document.createElement('div');
        if (step.type === 'user') {
            line.className = 'term-user';
            line.innerText = `> USER: "${step.content}"`;
        } else if (step.type === 'thought') {
            line.className = 'term-thought';
            line.innerText = step.content;
        } else if (step.type === 'rag') {
            line.className = 'term-rag';
            line.innerText = step.content;
        } else if (step.type === 'mcp') {
            line.className = 'term-mcp';
            line.innerText = step.content;
        } else if (step.type === 'response') {
            line.className = 'term-resp';
            line.innerText = `🤖 AGENT RESPONSE:\n${step.content}`;
        }
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
        await new Promise(r => setTimeout(r, 160));
    }
}

/* -------------------------------------------------------------------------- */
/* 4. Utility Handlers & Game Showcase Modal                                  */
/* -------------------------------------------------------------------------- */
const GAME_SHOWCASES = {
    desert_hunt: {
        title: '"Desert Hunt" — 3D Unreal Engine 5 Gameplay Showcase',
        imgSrc: 'assets/desert_hunt_showcase.gif',
        imgAlt: 'Desert Hunt 3D Gameplay Showcase',
        desc: '3D exploration and shooter mechanics in Unreal Engine 5 with Blueprint player controllers, physics collisions, score tracking, dynamic lighting, and level geometry.',
        repoUrl: 'https://github.com/Aarav-Mittal/Desert-Hunt',
        hasRepo: true,
        note: 'Contact Aarav for a compiled Windows playable build (.zip)'
    },
    gods_hand: {
        title: '"God\'s Hand" — TechSolstice 24hr Game Jam Gameplay Showcase',
        imgSrc: 'assets/gods_hand_showcase.gif',
        imgAlt: 'God\'s Hand 24hr Game Jam Gameplay Demo',
        desc: 'Engineered during a high-intensity 24-hour sprint at MIT Bangalore for the "One Screen" theme. Players balance weather miracles (Rain, Sun, Lightning) to sustain village population and faith without escalating fear.',
        repoUrl: null,
        hasRepo: false,
        note: '🏆 5th Place Winner in University 24-hr Game Jam'
    }
};

function openGameShowcase(gameKey) {
    const data = GAME_SHOWCASES[gameKey];
    if (!data) return;

    const modal = document.getElementById('ue5-modal');
    if (!modal) return;

    const titleEl = document.getElementById('modal-title');
    const mediaEl = document.getElementById('modal-media');
    const descEl = document.getElementById('modal-desc');
    const noteEl = document.getElementById('modal-note');
    const repoBtn = document.getElementById('modal-repo-btn');
    const demoBtn = document.getElementById('modal-demo-btn');

    if (titleEl) titleEl.innerText = data.title;
    if (mediaEl) {
        mediaEl.src = data.imgSrc;
        mediaEl.alt = data.imgAlt;
    }
    if (descEl) descEl.innerText = data.desc;
    if (noteEl) noteEl.innerHTML = data.note;

    if (demoBtn) {
        demoBtn.href = data.imgSrc;
    }

    if (repoBtn) {
        if (data.hasRepo && data.repoUrl) {
            repoBtn.href = data.repoUrl;
            repoBtn.style.display = 'inline-flex';
        } else {
            repoBtn.style.display = 'none';
        }
    }

    modal.classList.add('active');
}

function openUE5Modal(title) {
    openGameShowcase('desert_hunt');
}

function closeUE5Modal() {
    const modal = document.getElementById('ue5-modal');
    if (modal) modal.classList.remove('active');
}

function copyEmail() {
    const email = 'zoom2aarav@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
        showToast(`Email copied: ${email}`);
    }).catch(() => {
        alert(`Email: ${email}`);
    });
}

function showToast(msg) {
    let toast = document.getElementById('portfolio-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'portfolio-toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '2rem';
        toast.style.right = '2rem';
        toast.style.background = '#151619';
        toast.style.color = '#ffffff';
        toast.style.padding = '0.75rem 1.25rem';
        toast.style.borderRadius = '6px';
        toast.style.fontSize = '0.88rem';
        toast.style.fontFamily = 'var(--font-sans)';
        toast.style.zIndex = '9999';
        toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
        toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
    }, 2500);
}
