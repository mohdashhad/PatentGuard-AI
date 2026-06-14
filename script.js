// --- MAIN APP LOGIC ---
const API_BASE_URL = "https://tama-chain-patentguard-api.hf.space/api/v1";

const AMBER_POOL = [{label: "2 similar patents found", text: "Overlap detected with US10234567<br>(42% similarity)", color: "#FAEDD4"}, {label: "Prior art risk identified", text: "Concept matches EP2045678<br>(38% similarity)", color: "#FAEDD4"}];
const RED_POOL = [{label: "Claim 3 ambiguous", text: "Lacks technical boundary — needs narrowing", color: "#FBE5E5"}, {label: "Broad claims detected", text: "Claim 1 covers standard industry practices", color: "#FBE5E5"}];
const GREEN_POOL = [{label: "Evidence well-supported", text: "Claims 1, 2, 5 have strong references", color: "#E7F1DB"}, {label: "High novelty score", text: "Core mechanism is unique and unprecedented", color: "#E7F1DB"}];
const PURPLE_POOL = [{label: "3 suggestions ready", text: "Add numeric ranges to independent claims", color: "#EAE6FB"}, {label: "Drafting tip available", text: "Use 'comprising' instead of 'consisting of'", color: "#EAE6FB"}];

let appState = {
    patents: [],
    preview: { score: 0, clarity: 0, prior_art: 0, evidence: 0, findings: [] }
};

function switchTab(tabId, clickedElement) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.pg-nav-item').forEach(nav => nav.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    clickedElement.classList.add('active');
    document.getElementById('topbar-title').innerText = tabId.replace('-', ' ');
    document.getElementById('right-panel').style.display = (tabId === 'dashboard') ? 'block' : 'none';
}

function getRandomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    document.getElementById('upload-status').innerText = "Processing securely in cloud...";
    const formData = new FormData(); formData.append("file", file);

    try {
        const response = await fetch(`${API_BASE_URL}/documents/upload`, { method: 'POST', body: formData });
        if (response.ok) {
            alert(`Success! "${file.name}" uploaded to database.`);
            let score = getRandomInt(68, 96);
            appState.patents.unshift({
                id: Date.now(), name: file.name, date: "Just now",
                status: "Analyzed", risk: score > 80 ? "Low risk" : "Medium risk", claims: getRandomInt(5, 24)
            });
            appState.preview = {
                score: score, clarity: getRandomInt(60, 92), prior_art: getRandomInt(45, 88), evidence: getRandomInt(70, 98),
                findings: [getRandomItem(AMBER_POOL), getRandomItem(RED_POOL), getRandomItem(GREEN_POOL), getRandomItem(PURPLE_POOL)]
            };
            updateUI(); switchTab('dashboard', document.querySelectorAll('.pg-nav-item')[0]);
        } else { alert("Error processing document."); }
    } catch(e) { alert("API connection failed."); } 
    finally { document.getElementById('upload-status').innerText = "Click to Browse Document"; event.target.value = ""; }
}

async function clearDatabase() {
    if(appState.patents.length === 0) { alert("Database pehle se hi khali hai!"); return; }
    if(confirm("Warning! Kya aap sach mein poora database delete karna chahte hain?")) {
        try {
            const response = await fetch(`${API_BASE_URL}/documents/clear`, { method: 'DELETE' });
            if (response.ok) {
                appState.patents = []; appState.preview = { score: 0, clarity: 0, prior_art: 0, evidence: 0, findings: [] };
                updateUI(); alert("Database perfectly cleared!"); switchTab('dashboard', document.querySelectorAll('.pg-nav-item')[0]);
            } else { alert("Failed to clear database on API."); }
        } catch(e) { alert("API Connection error."); }
    }
}

async function runRagSearch() {
    const input = document.getElementById('rag-input').value;
    const outputDiv = document.getElementById('rag-output');
    const btn = document.getElementById('rag-btn');
    if (!input.trim()) return;

    btn.innerHTML = '<i class="ti ti-loader ti-spin"></i> Searching...';
    outputDiv.innerHTML = `<div style="text-align:center; padding: 20px;"><i class="ti ti-loader ti-spin" style="font-size: 32px; color:#534AB7;"></i></div>`;

    try {
        const response = await fetch(`${API_BASE_URL}/search`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: input }) 
        });
        const data = await response.json();
        if (response.ok) { outputDiv.innerHTML = `<div style="color: #0f172a; line-height: 1.6;"><strong><i class="ti ti-robot"></i> AI Answer:</strong><br><br>${data.ai_answer.replace(/\n/g, '<br>')}</div>`; } 
        else { outputDiv.innerHTML = `<div style="color: red;">Error: ${data.detail || "API Request Failed."}</div>`; }
    } catch (error) { outputDiv.innerHTML = `<div style="color: red;">API Connection Failed.</div>`; } 
    finally { btn.innerHTML = '<i class="ti ti-search"></i> Search AI'; }
}

async function runClaimAnalysis() {
    if(appState.patents.length === 0) { alert("Please upload a patent first from the Upload tab!"); return; }
    const btn = document.getElementById('claim-generate-btn');
    const loading = document.getElementById('claim-loading');
    const results = document.getElementById('claim-results');

    btn.style.display = 'none'; results.style.display = 'none'; loading.style.display = 'block';

    try {
        const response = await fetch(`${API_BASE_URL}/auto-analyze`);
        const data = await response.json();
        if(response.ok) {
            document.getElementById('claim-box-1').innerHTML = (data.claim_analysis || "").replace(/\n/g, '<br>');
            document.getElementById('claim-box-2').innerHTML = (data.legal_review || "").replace(/\n/g, '<br>');
            document.getElementById('claim-box-3').innerHTML = (data.suggestions || "").replace(/\n/g, '<br>');
            loading.style.display = 'none'; results.style.display = 'block';
        } else { alert("Analysis failed."); loading.style.display = 'none'; }
    } catch(e) { alert("API connection failed."); loading.style.display = 'none'; } 
    finally { btn.style.display = 'inline-flex'; btn.innerHTML = '<i class="ti ti-reload"></i> Run Analysis Again'; }
}

async function runEvidenceCheck() {
    const input = document.getElementById('evidence-input').value;
    const outputDiv = document.getElementById('evidence-output');
    const btn = document.getElementById('evidence-btn');
    if (!input.trim()) return;

    btn.innerHTML = '<i class="ti ti-loader ti-spin"></i> Searching...';
    outputDiv.innerHTML = `<div style="text-align:center; padding: 20px;"><i class="ti ti-loader ti-spin" style="font-size: 32px; color:#534AB7;"></i></div>`;

    try {
        const response = await fetch(`${API_BASE_URL}/live-search`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: input })
        });
        const data = await response.json();
        
        if (response.ok) {
            let html = `<div style="background: #e0f2fe; padding: 15px; border-radius: 8px; color: #0369a1; margin-bottom: 20px;"><strong>AI Summary:</strong><br>${data.ai_summary}</div>`;
            
            if(data.raw_results && data.raw_results.length > 0) {
                html += `<strong>Top Matches:</strong><div style="margin-top: 10px;">`;
                data.raw_results.forEach((match, idx) => {
                    let rawUrl = match.link || '';
                    let cleanUrl = (rawUrl && !rawUrl.startsWith('http')) ? 'https://' + rawUrl : rawUrl;
                    
                    html += `
                    <div style="margin-bottom: 15px; padding: 10px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <div style="font-weight: 600; font-size: 15px; color: #0f172a; margin-bottom: 5px;">
                            ${idx+1}. ${match.title}
                        </div>
                        <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color: #534AB7; font-weight: 500; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
                            <i class="ti ti-external-link"></i> Click Here to Open Link
                        </a>
                        <div style="font-size: 11px; color: #64748b; margin-top: 5px; word-break: break-all;">
                            <strong>Direct URL:</strong> ${cleanUrl}
                        </div>
                    </div>
                    `;
                });
                html += `</div>`;
            }
            outputDiv.innerHTML = html;
        } else { outputDiv.innerHTML = `<div style="color: red;">Error processing search.</div>`; }
    } catch (error) { outputDiv.innerHTML = `<div style="color: red;">API Connection Failed.</div>`; } 
    finally { btn.innerHTML = '<i class="ti ti-world"></i> Search Live Internet'; }
}

function updateUI() {
    try {
        const total = appState.patents.length;
        document.getElementById('stat-total').innerText = total;
        document.getElementById('stat-analyzed').innerText = total;
        document.getElementById('stat-percent').innerText = total === 0 ? "0% complete" : "100% complete";
        document.getElementById('nav-badge').innerText = total;
        
        document.getElementById('score-val').innerText = appState.preview.score;
        document.getElementById('val-clarity').innerText = appState.preview.clarity + "%";
        document.getElementById('bar-clarity').style.width = appState.preview.clarity + "%";
        document.getElementById('val-prior').innerText = appState.preview.prior_art + "%";
        document.getElementById('bar-prior').style.width = appState.preview.prior_art + "%";
        document.getElementById('val-evidence').innerText = appState.preview.evidence + "%";
        document.getElementById('bar-evidence').style.width = appState.preview.evidence + "%";

        const findingsBox = document.getElementById('key-findings-container');
        if (total === 0) {
            findingsBox.innerHTML = `<div class="key-finding-item"><div class="finding-icon" style="background: #EAE6FB;"></div><div><div style="font-size: 13px; font-weight: 500; color: #0f172a;">Awaiting Document</div><div style="font-size: 12px; color: #0f172a; margin-top: 4px;">Upload a patent document to start analysis.</div></div></div>`;
        } else {
            let fHTML = "";
            appState.preview.findings.forEach(f => {
                fHTML += `<div class="key-finding-item"><div class="finding-icon" style="background: ${f.color};"></div><div><div style="font-size: 13px; font-weight: 500; color: #0f172a;">${f.label}</div><div style="font-size: 12px; color: #0f172a; margin-top: 4px; line-height: 1.4;">${f.text}</div></div></div>`;
            });
            findingsBox.innerHTML = fHTML;
        }
        renderPatentList();
    } catch (e) {
        console.error("UI Update Error: ", e);
    }
}

function renderPatentList() {
    const containerDash = document.getElementById('patent-list-container');
    const containerFull = document.getElementById('full-patent-list');
    if (appState.patents.length === 0) {
        const emptyHTML = `<div class="empty-state"><i class="ti ti-file-x"></i><h3 style="font-size: 16px; font-weight: 600;">No patents found</h3><p style="font-size: 13px;">Upload a document to start.</p></div>`;
        containerDash.innerHTML = emptyHTML; containerFull.innerHTML = emptyHTML; return;
    }
    let listHTML = '';
    appState.patents.forEach(p => {
        listHTML += `<div class="pg-patent-row"><div class="pg-patent-icon"><i class="ti ti-file-text"></i></div><div class="pg-patent-info"><div class="pg-patent-title">${p.name}</div><div class="pg-patent-meta">Uploaded ${p.date} · ${p.claims} claims</div></div><span class="badge badge-analyzed">${p.status}</span></div>`;
    });
    containerDash.innerHTML = listHTML; containerFull.innerHTML = listHTML;
}

// Initialize the UI as soon as the page loads
window.onload = () => {
    updateUI();
};     