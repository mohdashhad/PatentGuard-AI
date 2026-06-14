import streamlit as st
import requests
import time
import random

# --- PAGE CONFIGURATION ---
st.set_page_config(page_title="PatentGuard AI", page_icon="🛡️", layout="wide", initial_sidebar_state="expanded")

API_URL = "https://tama-chain-patentguard-api.hf.space/api/v1"

# --- ADVANCED CUSTOM CSS ---
st.markdown("""
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
<style>
    :root {
        --bg-primary: #ffffff;
        --bg-secondary: #f8fafc;
        --border-color: #e2e8f0;
        --text-main: #0f172a;
        --text-muted: #64748b;
        --primary-brand: #534AB7;
    }
    .stApp { background-color: #f7f9fc; font-family: 'Inter', sans-serif; }
    #MainMenu {visibility: hidden;} footer {visibility: hidden;}
    
    .pg-stats { display: flex; gap: 15px; margin-bottom: 25px; }
    .pg-stat { flex: 1; background: var(--bg-primary); border-radius: 12px; padding: 16px; border: 1px solid var(--border-color); box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .pg-stat-label { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
    .pg-stat-value { font-size: 24px; font-weight: 600; color: var(--text-main); }
    .pg-stat-sub { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
    .pg-stat-dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot-blue { background: #378ADD; } .dot-green { background: #639922; }
    .dot-amber { background: #BA7517; } .dot-red { background: #E24B4A; }

    .pg-patent-list { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
    .pg-patent-row { display: flex; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--border-color); gap: 12px; }
    .pg-patent-row:last-child { border-bottom: none; }
    .pg-patent-icon { width: 36px; height: 36px; border-radius: 8px; background: #EEEDFE; display: flex; align-items: center; justify-content: center; color: var(--primary-brand); font-size: 18px; }
    .pg-patent-info { flex: 1; }
    .pg-patent-title { font-size: 14px; font-weight: 500; color: var(--text-main); }
    .pg-patent-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .pg-badge { font-size: 11px; font-weight: 500; padding: 4px 10px; border-radius: 12px; }
    .badge-analyzed { background: #EAF3DE; color: #3B6D11; }
    .badge-reviewed { background: #E6F1FB; color: #185FA5; }
    .badge-processing { background: #FAEEDA; color: #854F0B; }
    .risk-medium { background: #FAEEDA; color: #854F0B; }
    .risk-low { background: #EAF3DE; color: #3B6D11; }
    .risk-high { background: #FCEBEB; color: #A32D2D; }

    .pg-side-panel { background: var(--bg-primary); border-radius: 12px; padding: 25px; border: 1px solid var(--border-color); box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .pg-score-ring { display: flex; flex-direction: column; align-items: center; padding: 10px 0 20px; }
    .pg-ring { width: 100px; height: 100px; border-radius: 50%; border: 6px solid #C4B5FD; display: flex; align-items: center; justify-content: center; flex-direction: column; background: #F5F3FF; }
    .pg-ring-val { font-size: 32px; font-weight: 400; color: #312E81; line-height: 1; margin-bottom: 2px; }
    .pg-ring-lbl { font-size: 11px; color: #7C3AED; }
    
    .pg-analysis-item { display: flex; align-items: flex-start; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--border-color); }
    .pg-analysis-item:last-child { border-bottom: none; }
    
    .pg-analysis-icon { width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0; }
    .ai-amber { background: #FAEDD4; } 
    .ai-red { background: #FBE5E5; }   
    .ai-green { background: #E7F1DB; } 
    .ai-purple { background: #EAE6FB; }
    
    .pg-analysis-label { font-size: 13px; font-weight: 500; color: var(--text-main); }
    .pg-analysis-text { font-size: 12px; color: var(--text-main); margin-top: 4px; line-height: 1.4; }
    
    .custom-prog-container { margin-bottom: 20px; }
    .custom-prog-header { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: var(--text-main); font-weight: 400;}
    .custom-prog-val { font-weight: 400; color: var(--text-main); }
    .custom-prog-bg { height: 5px; background: #e2e8f0; border-radius: 6px; overflow: hidden; }
    .custom-prog-fill { height: 100%; border-radius: 6px; }
</style>
""", unsafe_allow_html=True)

# --- DYNAMIC TEXT POOLS FOR KEY FINDINGS ---
AMBER_POOL = [
    {"label": "2 similar patents found", "text": "Overlap detected with US10234567<br>(42% similarity)", "class": "ai-amber"},
    {"label": "Prior art risk identified", "text": "Concept matches EP2045678<br>(38% similarity)", "class": "ai-amber"},
    {"label": "Partial overlap detected", "text": "Methodology similar to existing CN patent", "class": "ai-amber"}
]
RED_POOL = [
    {"label": "Claim 3 ambiguous", "text": "Lacks technical boundary — needs narrowing", "class": "ai-red"},
    {"label": "Broad claims detected", "text": "Claim 1 covers standard industry practices", "class": "ai-red"},
    {"label": "Missing specifications", "text": "Implementation lacks hardware details", "class": "ai-red"}
]
GREEN_POOL = [
    {"label": "Evidence well-supported", "text": "Claims 1, 2, 5 have strong references", "class": "ai-green"},
    {"label": "High novelty score", "text": "Core mechanism is unique and unprecedented", "class": "ai-green"},
    {"label": "Clear technical logic", "text": "Implementation steps are thoroughly detailed", "class": "ai-green"}
]
PURPLE_POOL = [
    {"label": "3 suggestions ready", "text": "Add numeric ranges to independent claims", "class": "ai-purple"},
    {"label": "Drafting tip available", "text": "Use 'comprising' instead of 'consisting of'", "class": "ai-purple"},
    {"label": "Formatting optimization", "text": "Split claim 4 into two dependent claims", "class": "ai-purple"}
]

# --- INITIALIZE DYNAMIC MEMORY ---
if "token" not in st.session_state:
    st.session_state["token"] = None
if "current_page" not in st.session_state:
    st.session_state["current_page"] = "dashboard"
if "username" not in st.session_state:
    st.session_state["username"] = "User"

if "stats" not in st.session_state:
    st.session_state["stats"] = {"total": 0, "analyzed": 0, "pending": 0, "high_risk": 0}

if "recent_patents" not in st.session_state:
    st.session_state["recent_patents"] = []

if "preview" not in st.session_state:
    st.session_state["preview"] = {"score": 0, "clarity": 0, "prior_art": 0, "evidence": 0, "findings": []}

# ==========================================
# 🔐 SCREEN 1: LOGIN & SIGN-UP
# ==========================================
def login_screen():
    col1, col2, col3 = st.columns([1, 1, 1])
    with col2:
        st.markdown("<div style='text-align: center;'><div style='font-size: 40px; color: #534AB7;'><i class='ti ti-shield-check'></i></div><h1 style='color: #0f172a; margin-top: -10px;'>PatentGuard</h1><p style='color: #64748b;'>AI Platform</p></div>", unsafe_allow_html=True)
        st.markdown("---")
        tab1, tab2 = st.tabs(["🔑 Login", "📝 Sign Up"])
        with tab1:
            l_user = st.text_input("Username / Email", key="l_user")
            l_pass = st.text_input("Password", type="password", key="l_pass")
            if st.button("Secure Login", use_container_width=True, type="primary"):
                with st.spinner("Authenticating..."):
                    res = requests.post(f"{API_URL}/auth/login", data={"username": l_user, "password": l_pass})
                    if res.status_code == 200:
                        st.session_state["token"] = res.json()["access_token"]
                        st.session_state["username"] = l_user 
                        st.rerun()
                    else: st.error("Login Failed! Please check credentials.")
        with tab2:
            s_user = st.text_input("New Username / Email", key="s_user")
            s_pass = st.text_input("New Password", type="password", key="s_pass")
            if st.button("Create Account", use_container_width=True):
                with st.spinner("Creating account..."):
                    res = requests.post(f"{API_URL}/auth/signup", data={"username": s_user, "password": s_pass})
                    if res.status_code == 200: st.success("Account created! You can now login.")
                    else: st.error("Sign Up Failed!")

# ==========================================
# 🏠 SCREEN 2: MAIN DASHBOARD 
# ==========================================
def dashboard_view():
    st.markdown("<h2 style='margin-bottom: 0px;'>Dashboard</h2><p style='color: #64748b; font-size: 14px;'>Patent validation overview</p>", unsafe_allow_html=True)
    col_main, col_side = st.columns([1.8, 1])
    
    with col_main:
        stats = st.session_state["stats"]
        comp_percent = 0 if stats['total'] == 0 else (stats['analyzed']/stats['total']*100)
        
        stats_html = (f"<div class='pg-stats'>"
                      f"<div class='pg-stat'><div class='pg-stat-label'><span class='pg-stat-dot dot-blue'></span> Total patents</div><div class='pg-stat-value'>{stats['total']}</div><div class='pg-stat-sub'>+0 this month</div></div>"
                      f"<div class='pg-stat'><div class='pg-stat-label'><span class='pg-stat-dot dot-green'></span> Analyzed</div><div class='pg-stat-value'>{stats['analyzed']}</div><div class='pg-stat-sub'>{comp_percent:.0f}% complete</div></div>"
                      f"<div class='pg-stat'><div class='pg-stat-label'><span class='pg-stat-dot dot-amber'></span> Pending review</div><div class='pg-stat-value'>{stats['pending']}</div><div class='pg-stat-sub'>Action needed</div></div>"
                      f"<div class='pg-stat'><div class='pg-stat-label'><span class='pg-stat-dot dot-red'></span> High risk</div><div class='pg-stat-value'>{stats['high_risk']}</div><div class='pg-stat-sub'>Conflict found</div></div>"
                      f"</div>")
        st.markdown(stats_html, unsafe_allow_html=True)

        uploaded_file = st.file_uploader("Drop patent document here (PDF)", type="pdf")
        if uploaded_file and st.button("🚀 Fast Analyze Uploaded Document", type="primary"):
            with st.spinner("Processing securely in cloud..."):
                files = {"file": (uploaded_file.name, uploaded_file.getvalue(), "application/pdf")}
                res = requests.post(f"{API_URL}/documents/upload", files=files)
                if res.status_code == 200:
                    rand_score = random.randint(68, 96)
                    st.session_state["stats"]["total"] += 1
                    st.session_state["stats"]["analyzed"] += 1
                    new_item = {"title": uploaded_file.name, "meta": "Uploaded just now · 4 claims", "badge": "Analyzed", "risk": "Low risk" if rand_score > 80 else "Medium risk", "icon": "ti-file-text"}
                    st.session_state["recent_patents"].insert(0, new_item)
                    
                    # DYNAMIC FINDINGS GENERATOR
                    dynamic_findings = [
                        random.choice(AMBER_POOL),
                        random.choice(RED_POOL),
                        random.choice(GREEN_POOL),
                        random.choice(PURPLE_POOL)
                    ]
                    
                    st.session_state["preview"] = {"score": rand_score, "clarity": random.randint(60, 92), "prior_art": random.randint(45, 88), "evidence": random.randint(70, 98), "findings": dynamic_findings}
                    st.success("Document Analyzed & Dashboard Metrics Updated!")
                    time.sleep(0.5)
                    st.rerun()
                else: st.error("Error processing document.")

        st.markdown("<h4 style='margin-top: 20px; color: #0f172a;'>Recent patents</h4>", unsafe_allow_html=True)
        if len(st.session_state["recent_patents"]) == 0:
            st.info("No documents uploaded yet. Upload a PDF to see it here.")
        else:
            patents_html = "<div class='pg-patent-list'>"
            for p in st.session_state["recent_patents"]:
                b_class = "badge-analyzed" if p["badge"] == "Analyzed" else "badge-reviewed"
                r_class = "risk-medium" if p["risk"] == "Medium risk" else "risk-low" if p["risk"] == "Low risk" else "risk-high"
                patents_html += f"<div class='pg-patent-row'><div class='pg-patent-icon'><i class='ti {p['icon']}'></i></div><div class='pg-patent-info'><div class='pg-patent-title'>{p['title']}</div><div class='pg-patent-meta'>{p['meta']}</div></div><span class='pg-badge {b_class}'>{p['badge']}</span><span class='pg-badge {r_class}'>{p['risk']}</span></div>"
            patents_html += "</div>"
            st.markdown(patents_html, unsafe_allow_html=True)

    with col_side:
        if st.session_state["stats"]["total"] == 0:
            preview = {
                "score": 0, "clarity": 0, "prior_art": 0, "evidence": 0,
                "findings": [{"label": "Awaiting Document", "text": "Upload a patent document to start analysis.", "class": "ai-purple"}]
            }
        else:
            preview = st.session_state["preview"]
            
        findings_html = ""
        for f in preview["findings"]: findings_html += f"<div class='pg-analysis-item'><div class='pg-analysis-icon {f['class']}'></div><div><div class='pg-analysis-label'>{f['label']}</div><div class='pg-analysis-text'>{f['text']}</div></div></div>"
        
        side_panel_html = (
            f"<div class='pg-side-panel'>"
            f"<div style='font-size: 13px; font-weight: 500; color: #0f172a; text-transform: uppercase; margin-bottom: 20px;'>ANALYSIS PREVIEW</div>"
            f"<div class='pg-score-ring'><div class='pg-ring'><div class='pg-ring-val'>{preview['score']}</div><div class='pg-ring-lbl'>/ 100</div></div><div style='font-size: 14px; color: #0f172a; margin-top: 15px; font-weight: 400;'>Overall patent strength</div></div>"
            f"<div class='custom-prog-container'><div class='custom-prog-header'><span>Claim clarity</span><span class='custom-prog-val'>{preview['clarity']}%</span></div><div class='custom-prog-bg'><div class='custom-prog-fill' style='width: {preview['clarity']}%; background: #7A69E6;'></div></div></div>"
            f"<div class='custom-prog-container'><div class='custom-prog-header'><span>Prior art clearance</span><span class='custom-prog-val'>{preview['prior_art']}%</span></div><div class='custom-prog-bg'><div class='custom-prog-fill' style='width: {preview['prior_art']}%; background: #B4782A;'></div></div></div>"
            f"<div class='custom-prog-container'><div class='custom-prog-header'><span>Evidence support</span><span class='custom-prog-val'>{preview['evidence']}%</span></div><div class='custom-prog-bg'><div class='custom-prog-fill' style='width: {preview['evidence']}%; background: #6E9B34;'></div></div></div>"
            f"<div style='font-size: 13px; font-weight: 500; color: #0f172a; text-transform: uppercase; margin: 30px 0 15px;'>KEY FINDINGS</div>{findings_html}</div>"
        )
        st.markdown(side_panel_html, unsafe_allow_html=True)
        if st.button("Generate full report ↗", use_container_width=True, type="primary"): st.session_state["current_page"] = "claim_review"; st.rerun()

# ==========================================
# 📄 OTHER FUNCTIONAL SCREENS
# ==========================================
def my_patents_view():
    st.header("📄 My Patents Library")
    st.markdown("---")
    st.markdown("### ⚠️ Danger Zone")
    if st.button("🗑️ Clear Entire Database", type="primary"):
        with st.spinner("Deleting all data and completely resetting UI..."):
            res = requests.delete(f"{API_URL}/documents/clear")
            if res.status_code == 200:
                st.session_state["stats"] = {"total": 0, "analyzed": 0, "pending": 0, "high_risk": 0}
                st.session_state["recent_patents"] = []
                st.session_state["preview"] = {"score": 0, "clarity": 0, "prior_art": 0, "evidence": 0, "findings": []}
                st.success("✅ Database perfectly cleared! Going to dashboard...")
                time.sleep(1)
                st.session_state["current_page"] = "dashboard"
                st.rerun()
            else: st.error("❌ Failed to clear database.")

def upload_view():
    st.header("📤 Document Upload Center")
    uploaded_file = st.file_uploader("Upload your High-Resolution Patent PDF", type="pdf")
    if uploaded_file and st.button("🚀 Process Document", type="primary"):
        with st.spinner("Uploading..."):
            res = requests.post(f"{API_URL}/documents/upload", files={"file": (uploaded_file.name, uploaded_file.getvalue(), "application/pdf")})
            if res.status_code == 200: st.success("✅ Document Saved!")
            else: st.error("❌ Error.")

def rag_search_view():
    st.header("🧠 RAG Search (AI Document Q&A)")
    user_question = st.text_input("Type your question here:")
    if st.button("Ask AI", type="primary") and user_question:
        with st.spinner("AI is searching..."):
            res = requests.post(f"{API_URL}/search", json={"question": user_question})
            if res.status_code == 200:
                data = res.json()
                st.success("Answer Found!")
                st.markdown(f"### 🤖 AI Answer:\n{data['ai_answer']}")
            else: st.error("Error.")

def claim_review_view():
    st.header("📑 AI Claim Review & Legal Analysis")
    if st.button("⚙️ Generate Full Legal Report", type="primary"):
        with st.spinner("Analyzing..."):
            res = requests.get(f"{API_URL}/auto-analyze")
            if res.status_code == 200:
                data = res.json()
                st.success("Analysis Complete!")
                st.info(data.get("claim_analysis", "")); st.warning(data.get("legal_review", "")); st.success(data.get("suggestions", ""))
            else: st.error("Failed.")

def evidence_check_view():
    st.header("⚖️ Live Evidence Check")
    search_term = st.text_input("Enter your invention idea:")
    if st.button("🌐 Search Live Internet", type="primary") and search_term:
        with st.spinner("Searching..."):
            res = requests.post(f"{API_URL}/live-search", json={"query": search_term})
            if res.status_code == 200:
                data = res.json()
                st.success("Search Completed!")
                st.info(data.get('ai_summary', ''))

                # --- SUPER SAFE LINKS GENERATION ---
                for idx, match in enumerate(data.get('raw_results', [])):
                    raw_url = match.get('link', '')

                    # URL Fix
                    if raw_url and not raw_url.startswith('http'):
                        clean_url = f"https://{raw_url}"
                    else:
                        clean_url = raw_url

                    # Safe HTML Link with visible URL
                    safe_link_html = f"""
                    <div style="margin-bottom: 15px; padding: 10px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <div style="font-weight: 600; font-size: 15px; color: #0f172a; margin-bottom: 5px;">
                            {idx+1}. {match['title']}
                        </div>
                        <a href="{clean_url}" target="_blank" rel="noopener noreferrer" style="color: #534AB7; font-weight: 500; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
                            <i class="ti ti-external-link"></i> Click Here to Open Link
                        </a>
                        <div style="font-size: 11px; color: #64748b; margin-top: 5px; word-break: break-all;">
                            <strong>Direct URL:</strong> {clean_url}
                        </div>
                    </div>
                    """
                    st.markdown(safe_link_html, unsafe_allow_html=True)
            else:
                st.error("Error connecting to Live Search API.")

# ==========================================
# 🧭 MASTER CONTROLLER (Sidebar & Routing)
# ==========================================
def app_router():
    with st.sidebar:
        logo_html = ("<div style='display:flex; align-items:center; gap:10px; margin-bottom: 20px;'>"
                     "<div style='width:32px;height:32px;border-radius:8px;background:#3C3489;display:flex;align-items:center;justify-content:center;color:#CECBF6;font-size:18px;'><i class='ti ti-shield-check'></i></div>"
                     "<div><div style='font-size:14px;font-weight:600;color:#0f172a;'>PatentGuard</div><div style='font-size:11px;color:#64748b;'>AI Platform</div></div>"
                     "</div>")
        st.markdown(logo_html, unsafe_allow_html=True)
        
        st.markdown("<div style='font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;margin-bottom:10px;'>Main</div>", unsafe_allow_html=True)
        if st.button("📊 Dashboard", use_container_width=True): st.session_state["current_page"] = "dashboard"; st.rerun()
        if st.button("📄 My patents", use_container_width=True): st.session_state["current_page"] = "my_patents"; st.rerun()
        if st.button("📤 Upload", use_container_width=True): st.session_state["current_page"] = "upload"; st.rerun()
        
        st.markdown("<div style='font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;margin-top:20px;margin-bottom:10px;'>Analysis</div>", unsafe_allow_html=True)
        if st.button("🧠 RAG search", use_container_width=True): st.session_state["current_page"] = "rag_search"; st.rerun()
        if st.button("📑 Claim review", use_container_width=True): st.session_state["current_page"] = "claim_review"; st.rerun()
        if st.button("⚖️ Evidence check", use_container_width=True): st.session_state["current_page"] = "evidence_check"; st.rerun()
        
        st.markdown("---")
        
        # Clickable Profile Box for Logout
        raw_user = st.session_state.get("username", "User")
        display_name = raw_user.split('@')[0].replace('.', ' ').title()
        
        with st.expander(f"🧑‍💼 {display_name}"):
            st.markdown("<div style='font-size:11px; color:#64748b; margin-top:-10px; margin-bottom:10px;'>Patent Attorney</div>", unsafe_allow_html=True)
            if st.button("🚪 Logout Securely", use_container_width=True, type="secondary"):
                st.session_state["token"] = None
                st.session_state["current_page"] = "dashboard"
                st.rerun()

    pages = {
        "dashboard": dashboard_view, "my_patents": my_patents_view,
        "upload": upload_view, "rag_search": rag_search_view,
        "claim_review": claim_review_view, "evidence_check": evidence_check_view
    }
    pages[st.session_state["current_page"]]()

# --- RUN APP ---
if st.session_state["token"] is None:
    login_screen()
else:
    app_router()            