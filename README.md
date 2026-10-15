# 🚀 Datastraw AI-Powered CX Reply Assistant

A full-stack, multi-tenant Customer Experience (CX) application built for the Datastraw Engineering. It allows CX agents to handle customer conversations, securely access strictly isolated brand knowledge bases, and generate context-aware AI replies guarded by deterministic policy guardrails.


---

<img width="2734" height="1384" alt="datastraw-cx vercel app_" src="https://github.com/user-attachments/assets/e7709949-f7f7-43a2-9f74-35052b98ba31" />

---

## 🏗️ Technology Stack
- **Frontend:** React, Vite, Custom CSS (Glassmorphism & Dark Mode UI)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **AI / LLM:** OpenRouter API (`openrouter/free` LLM routing to bypass Google API throttling)
- **Authentication:** JWT (JSON Web Tokens), `bcryptjs`

---

## ⚙️ Setup Instructions

To set up and run the CX Reply Assistant locally:

### **1. Clone the Repository**

```bash
git clone https://github.com/Gautam-Sahil/Datastraw-CX.git
cd datastraw-cx
```

### 2. Configure Environment Variables

Navigate to the backend folder and create a .env file based on the provided .env.example.

```bash
  cd backend
  touch .env
```
See the .env.example file in repo for the exact formatting.

### 3. Setup the Backend & Database

Install the required packages and run the seed file to populate MongoDB with the 2 test Brands, Policies, and Mock Conversations.

```bash
npm install
node seed.js
npm run dev
```
The backend server will start on http://localhost:5000.

### 3. Setup the Backend & Database

Starts the Next.js development server for local testing.

```bash
npm run dev
```

### 4. Setup the Frontend

Open a new terminal window and start the React application.

```bash
cd frontend
npm install
npm run dev
```

Navigate to http://localhost:5173 to view the application.

---

## 🗄️ Database & Schema Information

The database schema is designed to enforce strict Multi-Tenant Isolation. All conversational and policy data is strictly linked to a specific Brand via a `brandId` reference.

- **`User` (Authentication):** `{ name, email, password_hash, createdAt }`
- **`Brand` (Tenant Concept):** `{ name }` (e.g., AuraGlow Skincare).
- **`Policy` (Knowledge Base):** `{ brandId, title, content }`
- **`Conversation` (Session Metadata):** `{ brandId, customerName, orderDetails: { orderId, itemName, status, deliveredDaysAgo } }`
- **`Message` (Chat History):** `{ conversationId, sender: ['customer' | 'agent' | 'ai'], text, createdAt }`
- **`AuditLog` (AI Evaluation System):** `{ conversationId, brandId, customerMessage, retrievedContext, aiGeneratedResponse, agentEditedResponse, finalResponse, responseType }`

**Why?** Storing both the raw AI string and the final agent-edited string allows the system to calculate "Edit Distance" to identify confusing Knowledge Base policies over time.

---
## 📁 Folder Structure

The repository cleanly separates the client-side React UI from the backend Express logic.
```bash
datastraw-cx/
│
├── backend/                  # Node.js / Express API
│   ├── models/               # Mongoose Database Schemas
│   │   ├── AuditLog.js       # Tracks AI vs Agent edits
│   │   ├── Brand.js          # Multi-tenant brand isolation
│   │   ├── Conversation.js   # Chat session metadata & order status
│   │   ├── Message.js        # Chat history
│   │   ├── Policy.js         # Knowledge Base documents
│   │   └── User.js           # Agent Authentication (JWT + bcrypt)
│   │
│   ├── routes/
│   │   ├── api.js            # Core CX, Policy CRUD, and AI logic
│   │   └── auth.js           # JWT Login & Registration logic
│   │
│   ├── index.js              # Server entry point
│   ├── seed.js               # Database population script
│   ├── .env.example          # Environment variables template
│   └── package.json
│
└── frontend/                 # React / Vite SPA
    ├── src/
    │   ├── App.jsx           # Main CX Workspace, State & Tabs
    │   ├── App.css           # Core Workspace styling
    │   ├── Auth.jsx          # JWT Authentication UI & Flow
    │   ├── auth.css          # Auth animations & glassmorphism
    │   └── main.jsx
    │
    └── package.json

```
---
## 🛡️ Key Engineering & AI Guardrail Decisions

### 1. Hybrid Retrieval vs Context Dumping
Instead of passing the entire Knowledge Base to the LLM (which wastes tokens and confuses the model), the backend uses a custom lexical intent-matching engine to pull only the policies relevant to the customer's latest message context.

### 2. Deterministic Pre-Calculation
LLMs frequently hallucinate date math. The backend calculates `deliveredDaysAgo` deterministically in Node.js before calling the API.

### 3. The 3-State Guardrail System

- **`GROUNDED` (Green):** The AI found the policy, the order is within the allowed window, and the reply is safe.

- **`POLICY_RESTRICTION` (Yellow):** The order exceeds the allowed window (e.g., delivered 20 days ago on a 7-day policy). The system blocks the AI from promising a refund.

- **`MISSING_KB_INFO` (Red):** The customer asked a question not found in the Knowledge Base (e.g., "Do you have a store in Mumbai?"). The system blocks the AI from hallucinating a store location and drafts a holding reply.

- ---
