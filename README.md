# 🛡️ PatentGuard AI

**An AI-Powered Legal Intelligence Platform for Patent Validation & Review**

PatentGuard AI is an intelligent pre-screening and validation layer designed to assist inventors, startups, and legal teams. By leveraging Retrieval-Augmented Generation (RAG) architecture, it cross-references patent drafts against existing patents, prior art, and legal databases to identify risks, gaps, and potential conflicts before formal filing.

---

## 🚀 Core Features

* **📊 Intelligent Dashboard:** Real-time analytics of your patent portfolio (Total, Analyzed, Pending Review, High Risk).
* **🧠 RAG Patent Engine:** Ask AI questions about your uploaded patents and get explainable, source-backed answers.
* **📑 AI Claim Review:** Automatically analyzes patent claims for clarity, legal consistency, and boundary issues, providing actionable drafting suggestions.
* **⚖️ Live Evidence Check:** Searches the live internet for your invention ideas to find prior-art references, overlapping patents, and generating top matches.
* **🔒 Secure Access:** JWT-based authentication system ensuring role-based, secure access to intellectual property data.
* **🗂️ Dual Interface:** Offers both a lightweight vanilla HTML/JS web interface and a robust Streamlit application.

---

## 🛠️ Technology Stack

**Frontend:**
* Vanilla HTML5, CSS3, JavaScript (Fast, serverless web UI)
* Tailwind CSS / Custom CSS & Tabler Icons
* Streamlit (Alternative Python-based interactive UI)

**Backend & AI Engine:**
* Python & FastAPI
* Hugging Face APIs & Spaces (Deployment)
* Retrieval-Augmented Generation (RAG) Pipeline
* Vector Embeddings

**Database:**
* MongoDB (Secure storage for user credentials and patent metadata)

---

## 📁 Repository Structure

```text
PatentGuard-AI/
│
├── app/                  # FastAPI backend code, API routes, and ML logic
├── .env                  # Environment variables (Make sure not to push secrets!)
├── Dockerfile            # Container configuration for Hugging Face Spaces
├── frontend.py           # Streamlit Frontend application
├── index.html            # Main entry point for the HTML/JS web app
├── style.css             # Styling for the web interface
├── script.js             # API integration and logic for the web interface
└── requirements.txt      # Python dependencies (FastAPI, Streamlit, etc.)
