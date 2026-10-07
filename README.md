# 🛡️ CyberSathi AI

### Agentic AI Cybersecurity Copilot

CyberSathi AI is an intelligent cybersecurity analysis platform designed to help users identify, understand, and respond to potential cyber threats from text, URLs, and images.

The system combines deterministic security rules, URL analysis, Retrieval-Augmented Generation (RAG), vector search, AI reasoning, and agentic orchestration to provide explainable cybersecurity assessments.

---

## 🚀 Project Overview

Cyber threats can appear in many forms:

- Suspicious messages
- Phishing links
- Malicious URLs
- Fake login pages
- Scam messages
- Suspicious screenshots
- Social engineering attempts
- Potentially dangerous content

CyberSathi AI analyzes these inputs and produces a structured security assessment including:

- Threat classification
- Risk score
- Threat indicators
- Explanation
- Recommended actions
- AI-generated security analysis

The goal is to provide users with an easy-to-understand cybersecurity assistant instead of requiring them to manually analyze technical security information.

---

## ✨ Key Features

### 🔍 Multimodal Threat Analysis

CyberSathi supports different types of security inputs:

- Text analysis
- URL analysis
- Image/screenshot analysis

---

### 🌐 URL Security Analysis

The platform analyzes URLs for suspicious characteristics such as:

- Suspicious domains
- URL structure
- IP-based URLs
- Dangerous schemes
- Phishing indicators
- Suspicious redirects
- Domain-related security signals

---

### 🧠 AI-Powered Security Analysis

CyberSathi uses an AI reasoning layer to analyze detected security signals and produce human-readable explanations.

The system can identify:

- Possible phishing attempts
- Scam messages
- Suspicious behavior
- Security risks
- Potential social engineering
- Malicious indicators

---

### 📚 RAG-Based Knowledge Retrieval

CyberSathi uses Retrieval-Augmented Generation to retrieve relevant cybersecurity knowledge before generating an analysis.

The architecture includes:

- Document ingestion
- Text chunking
- Embeddings
- Vector storage
- Similarity search
- Retrieved security context
- AI reasoning

---

### 🤖 Agentic Architecture

CyberSathi uses an agent-oriented architecture to route security analysis to appropriate components.

The system includes components for:

- Threat detection
- URL analysis
- AI reasoning
- Risk evaluation
- Knowledge retrieval

---

### 📊 Explainable Risk Scoring

The platform generates a risk assessment based on multiple security signals.

The result is designed to explain:

- What was detected
- Why it is suspicious
- How serious the threat may be
- What the user should do next

---

### 🔐 Authentication & Security

CyberSathi includes:

- JWT authentication
- Access tokens
- Refresh tokens
- Argon2 password hashing
- Protected API routes
- User-specific data isolation
- Google OAuth
- Input validation
- File validation
- Prompt-injection protection
- API security controls
- Audit-oriented architecture

---

### 👤 User Isolation

Each user's analyses and history are isolated.

Users can access only their own:

- Analysis history
- Reports
- Uploaded content
- Dashboard statistics

---

### 📈 Dashboard

The dashboard provides an overview of security analysis activity.

It includes:

- Total analyses
- Recent activity
- Security results
- Analysis history
- User-specific statistics

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      React UI        │
                         │   TypeScript/Vite    │
                         └──────────┬───────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌──────────────────────┐
                         │      FastAPI         │
                         │       Backend        │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                │
                    ▼               ▼                ▼
             ┌────────────┐ ┌─────────────┐ ┌──────────────┐
             │    Auth    │ │   Analysis  │ │  Dashboard   │
             │    API     │ │     API     │ │     API      │
             └────────────┘ └──────┬──────┘ └──────────────┘
                                   │
                                   ▼
                         ┌──────────────────────┐
                         │   Agentic Pipeline   │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                │
                    ▼               ▼                ▼
             ┌────────────┐ ┌─────────────┐ ┌──────────────┐
             │   Threat   │ │ URL Analyzer│ │     RAG      │
             │  Detector  │ │             │ │  Retrieval   │
             └────────────┘ └─────────────┘ └──────┬───────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ Vector Database │
                                          │    pgvector     │
                                          └─────────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │   AI / LLM      │
                                          │   OpenRouter    │
                                          └─────────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │   Risk Engine   │
                                          └─────────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ Security Result │
                                          └─────────────────┘
