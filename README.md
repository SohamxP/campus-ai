# CampusAI

CampusAI is a full-stack AI-powered academic productivity platform that helps students turn course materials into an interactive study system.

Students can upload course PDFs, ask questions grounded in their own material, generate flashcards and quizzes, and track topic mastery through a retrieval-augmented generation (RAG) pipeline.

## Live Demo

**Try CampusAI:**
https://campus-ai-peach.vercel.app

---

## Features

### Course Management

* Create and manage individual courses
* Upload PDF lecture notes, slides, textbooks, and other course material
* Organize uploaded documents by course
* Reuse indexed material across multiple AI study workflows

### Document-Grounded Q&A

CampusAI allows students to ask questions directly against their uploaded course material.

The system:

1. Retrieves relevant sections from uploaded documents
2. Reranks the retrieved content
3. Sends the most relevant context to the language model
4. Generates an answer grounded in that context
5. Returns source information associated with the response

The goal is to reduce unsupported AI responses by grounding answers in the student's actual academic material.

### Flashcard Generation

CampusAI can automatically generate flashcards from indexed course documents, allowing students to quickly convert class material into reusable study resources.

### Quiz Generation

Students can generate multiple-choice quizzes from their course material and submit answers directly through the platform.

### Mastery Tracking

Quiz performance can be used to track topic-level mastery and help students identify areas that may need additional review.

---

## How CampusAI Works

```text
Upload Course PDF
        │
        ▼
Extract PDF Text
        │
        ▼
Page-Aware Chunking
        │
        ▼
Generate Embeddings
        │
        ▼
Store Chunks + Metadata
        │
        ▼
Student Asks Question
        │
        ▼
Vector / Hybrid Retrieval
        │
        ▼
Rerank Relevant Chunks
        │
        ▼
Grounded LLM Generation
        │
        ▼
Answer + Source Context
```

---

## Architecture

```text
                         ┌─────────────────────┐
                         │    Next.js Web App  │
                         │ React + TypeScript  │
                         └──────────┬──────────┘
                                    │
                 ┌──────────────────┴──────────────────┐
                 │                                     │
                 ▼                                     ▼
        ┌─────────────────┐                   ┌─────────────────┐
        │ Node.js Backend │                   │ FastAPI AI      │
        │ Express + TS    │                   │ Service         │
        └────────┬────────┘                   │ Python          │
                 │                            └────────┬────────┘
          ┌──────┴──────┐                              │
          │             │                    ┌─────────┼─────────┐
          ▼             ▼                    ▼         ▼         ▼
     Supabase        OpenAI API          PDF       Embeddings  Retrieval
    PostgreSQL                           Parsing               + Reranking
          │                                        │
          └─────────────────┬──────────────────────┘
                            │
                            ▼
                       PostgreSQL
                        pgvector
                            │
                            ▼
                          Ollama
                    Grounded Generation
```

CampusAI separates general application functionality from AI-specific processing.

The **Node.js/Express backend** handles application APIs, authentication, database communication, and hosted AI integrations.

The **Python/FastAPI service** handles document ingestion, embeddings, retrieval, reranking, study-material generation, and document-grounded question answering.

---

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Application Backend

* Node.js
* Express
* TypeScript
* JWT
* Supabase
* PostgreSQL
* OpenAI API

### AI / RAG Service

* Python
* FastAPI
* PyPDF
* Sentence Transformers
* `all-MiniLM-L6-v2`
* Cross-Encoder reranking
* PostgreSQL
* pgvector
* Ollama

### Testing

* Pytest
* Retrieval tests
* Embedding tests
* PDF-processing tests
* Database tests
* Generation-service tests

---

## Retrieval-Augmented Generation Pipeline

### 1. Document Ingestion

Students upload PDFs to a specific course.

CampusAI extracts the document text while retaining information about the original document and page location.

### 2. Chunking

Extracted text is divided into smaller page-aware chunks suitable for semantic retrieval.

### 3. Embedding Generation

CampusAI uses the Sentence Transformers model:

```text
sentence-transformers/all-MiniLM-L6-v2
```

to convert document chunks into semantic vector representations.

### 4. Vector Retrieval

When a student submits a question, the query is embedded and compared against stored document vectors to identify semantically relevant material.

### 5. Hybrid Retrieval

CampusAI also supports hybrid retrieval to improve the quality of the initial search results.

### 6. Reranking

Retrieved chunks can be passed through a Cross-Encoder reranker to produce a more relevant ordering before generation.

```text
Question
   │
   ▼
Initial Retrieval
   │
   ▼
Hybrid Retrieval
   │
   ▼
Cross-Encoder Reranking
   │
   ▼
Top Context Chunks
```

### 7. Grounded Generation

The highest-ranked document chunks are passed to the generation model as context.

The resulting answer is generated using retrieved course material rather than relying solely on the model's general knowledge.

---

## AI Study Tools

The same indexed course material can be reused for multiple workflows.

### Flashcards

```http
POST /courses/{course_id}/flashcards/generate
```

Generate flashcards from course content.

### Quizzes

```http
POST /courses/{course_id}/quiz/generate
```

Generate multiple-choice questions based on indexed material.

### Quiz Evaluation

```http
POST /quiz/{question_id}/answer
```

Submit and evaluate an answer.

### Mastery

```http
GET /courses/{course_id}/mastery
```

Retrieve course mastery information based on quiz performance.

---

## AI Service API

### Courses

```http
POST /courses
GET  /courses
GET  /courses/{course_id}
GET  /courses/{course_id}/documents
DELETE /courses/{course_id}
```

### Documents

```http
POST   /documents/preview
POST   /courses/{course_id}/documents
DELETE /documents/{document_id}
```

### Retrieval

```http
POST /retrieve
POST /retrieve-hybrid
POST /retrieve-reranked
```

### Question Answering

```http
POST /answer
```

### Study Tools

```http
POST /courses/{course_id}/flashcards/generate
GET  /courses/{course_id}/flashcards

POST /courses/{course_id}/quiz/generate
GET  /courses/{course_id}/quiz

POST /quiz/{question_id}/answer
GET  /courses/{course_id}/mastery
```

---

## Project Structure

```text
campus-ai/
│
├── apps/
│   │
│   ├── web/                    # Next.js web application
│   │   ├── app/
│   │   ├── components/
│   │   └── ...
│   │
│   └── mobile/                 # Experimental Expo / React Native client
│
├── backend/                    # Node.js / Express application backend
│   ├── src/
│   ├── supabase/
│   └── ...
│
├── ai-service/                 # Python AI and RAG service
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── evaluation/
│   └── tests/
│
├── packages/
│   └── shared/
│
└── README.md
```

> The primary implemented user experience is the Next.js web application. The repository also contains an experimental React Native/Expo mobile client that is not currently part of the deployed CampusAI experience.

---

# Running Locally

## Prerequisites

Install the following before running CampusAI:

* Node.js
* npm
* Python
* PostgreSQL / Supabase
* Ollama

---

## 1. Clone the Repository

```bash
git clone https://github.com/SohamxP/campus-ai.git
cd campus-ai
```

---

## 2. Run the Node.js Backend

From the project root:

```bash
cd backend
npm install
```

Create your environment configuration:

```bash
cp .env.example .env
```

Configure the following variables:

```env
PORT=5001

JWT_SECRET=replace_with_a_long_random_secret

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

Start the development server:

```bash
npm run dev
```

By default, the backend runs at:

```text
http://localhost:5001
```

---

## 3. Run the AI Service

Open another terminal from the CampusAI project root:

```bash
cd ai-service
```

Create a Python virtual environment:

### macOS / Linux

```bash
python -m venv .venv
source .venv/bin/activate
```

### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
pip install sentence-transformers
```

Create your environment file:

```bash
cp .env.example .env
```

Configure:

```env
DATABASE_URL=your_postgresql_connection_string

OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:3b
```

Install the configured Ollama model:

```bash
ollama pull llama3.2:3b
```

Start the AI service:

```bash
uvicorn app.main:app --reload
```

By default, FastAPI runs at:

```text
http://localhost:8000
```

Interactive API documentation is available at:

```text
http://localhost:8000/docs
```

---

## 4. Run the Web Application

Open another terminal from the CampusAI project root:

```bash
cd apps/web
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## Testing

The AI service contains automated tests for several core components.

From the project root:

```bash
cd ai-service
pytest
```

Tests cover functionality including:

* PDF processing
* Embedding generation
* Database operations
* Hybrid retrieval
* Generation services
* API health checks

---

## Current Status

### Implemented

* Next.js web application
* Course creation and management
* PDF document ingestion
* Text extraction and chunking
* Semantic embeddings
* Vector retrieval
* Hybrid retrieval
* Cross-Encoder reranking
* Document-grounded Q&A
* Flashcard generation
* Quiz generation
* Quiz evaluation
* Topic mastery tracking
* Node.js/Express application backend
* Python/FastAPI AI service
* PostgreSQL / Supabase integration
* Automated AI-service tests

### Experimental / In Progress

* React Native / Expo mobile client
* Additional cross-platform CampusAI functionality

---

## Future Improvements

Potential future improvements include:

* Streaming AI responses
* Additional document formats
* OCR for scanned academic documents
* Spaced-repetition scheduling
* Adaptive quiz difficulty
* Expanded retrieval evaluation
* Course analytics
* Collaborative study features
* Full mobile integration

---

## Disclaimer

CampusAI is an academic productivity project. AI-generated responses may contain errors and should be verified against official course materials and instructor guidance.
