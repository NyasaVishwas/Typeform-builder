# Typeform Builder — Conversational Form SaaS Platform

A production-grade, Typeform-inspired SaaS application built for fullstack engineering evaluations. Typeform Builder enables creators to design multi-question forms via a drag-and-drop builder, publish them via shareable links, collect responses via a full-screen conversational 1-question-at-a-time respondent runner, and analyze live statistics.

---

## 🌟 Key Features

### P0 (Core SaaS Requirements)
- **Creator Dashboard**: Manage forms, view status badges (`Published` vs `Draft`), total submission counts, and relative update dates.
- **Form Builder**: Drag-and-drop question reordering (`@dnd-kit`), inline question prompt & description editing, type-aware settings forms, debounced autosave, live preview, and publish modal.
- **8 Question Types**: `short_text`, `long_text`, `multiple_choice`, `dropdown`, `email`, `number`, `yes_no`, `rating`.
- **Public Conversational Respondent Runner (`/f/[slug]`)**: Full-screen, 1-question-at-a-time flow with keyboard shortcuts (`Enter`, `↑`/`↓`, `A`-`D`), choice auto-advance, client-side validation, completion time tracking, and a thank-you screen.
- **Transactional Response Submission**: Server-side validation engine enforcing required fields, email formatting, numeric bounds, rating scale bounds, and choice matching.
- **Results & Analytics**: Real-time aggregated statistics with horizontal option percentage bar charts, number summaries (avg/min/max), rating score distributions, and individual response answer detail views.

### P1 & P2 Enhancements
- **Search & Status Filtering**: Filter forms by status tabs (*All Forms*, *Published*, *Drafts*) or text search.
- **Deep Form Duplication**: Clones forms, questions, and options while resetting response history.
- **Form Settings**: Custom public link slug editing, accent color palette picker, font selection, and thank-you messaging.
- **Pro Feature Placeholders**: Elegant "Coming Soon" cards for advanced enterprise capabilities (Logic Jumps, Webhooks, Payments, File Uploads, Custom Domains, Team Collaboration).
- **Toast Notifications & Modal Dialogs**: 100% custom dialogs (no browser `alert()` or `confirm()`) with global toast feedback.

---

## 🏗️ Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14+ (App Router), TypeScript, React 19 | Server & Client Components, Routing, UI State |
| **Styling** | Vanilla Tailwind CSS (Custom CSS Variables) | Minimal editorial design tokens & layout |
| **Drag & Drop**| `@dnd-kit/core`, `@dnd-kit/sortable` | Robust, accessible question reordering |
| **Backend** | Python 3.13, FastAPI, Pydantic v2 | High-performance REST API, DTO validation |
| **Database** | SQLite + SQLAlchemy 2.0 ORM | Relational schema with `PRAGMA foreign_keys=ON` |
| **Testing** | Pytest, FastAPI TestClient, httpx | Automated API & validation integration testing |

---

## 📂 Repository Structure

```
Typeform builder/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Redirects / to /dashboard
│   │   │   ├── dashboard/             # Creator Dashboard
│   │   │   ├── builder/[id]/          # Alias redirect to /forms/[id]/edit
│   │   │   ├── forms/[id]/edit/       # Drag-and-drop Form Builder
│   │   │   ├── forms/[id]/results/    # Results & Analytics Dashboard
│   │   │   ├── forms/[id]/settings/   # Form Settings & Theme Configuration
│   │   │   ├── analytics/[id]/        # Alias redirect to /forms/[id]/results
│   │   │   └── f/[slug]/              # Public Conversational Respondent Runner
│   │   ├── components/
│   │   │   ├── ui/                    # Base Primitives (Button, Input, Badge, Card, Modal, DropdownMenu)
│   │   │   ├── layout/                # App Shell Header & FormNavHeader
│   │   │   └── questions/             # Shared Polymorphic QuestionRenderer (all 8 types)
│   │   ├── features/
│   │   │   ├── dashboard/             # FormCard, FormSearchFilter, Rename & Delete Modals
│   │   │   ├── builder/               # QuestionList, QuestionEditor, LivePreviewPanel, SortableCard
│   │   │   ├── runner/                # FormRunner, RunnerProgressBar, ThankYouScreen, FormUnavailableState
│   │   │   ├── results/               # SummaryTab, ResponsesTab, ResponseDetailModal
│   │   │   └── settings/              # GeneralSettings, ThemeSettings, ThankYouSettings, ProFeatures
│   │   ├── context/                   # ToastContext notification provider
│   │   ├── lib/                       # Typed API fetcher client (api.ts)
│   │   └── types/                     # Shared TypeScript interfaces & enums
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── backend/
│   ├── app/
│   │   ├── api/v1/                    # FastAPI routers (forms, questions, public, responses)
│   │   ├── core/                      # Pydantic settings & CORS config
│   │   ├── db/                        # Database session engine & idempotent seed script
│   │   ├── models/                    # SQLAlchemy ORM models (Creator, Form, Question, Option, Response, Answer)
│   │   ├── schemas/                   # Pydantic request/response DTOs & QuestionType enum
│   │   ├── repositories/              # Form, Question, and Response data access repositories
│   │   └── services/                  # Form, Question, Response, and Statistics service layers
│   ├── tests/                         # Pytest test suite (20 integration tests)
│   ├── main.py                        # FastAPI entrypoint with lifespan startup seeding
│   ├── verify_phase1.py               # Phase 1 verification script
│   ├── requirements.txt
│   └── .env.example
├── README.md
└── .gitignore
```

---

## 🗄️ Relational Database Schema (SQLite)

The database schema is normalized to 3rd Normal Form with SQLite foreign keys enabled (`PRAGMA foreign_keys=ON`).

```
Creators (1) ───< Forms (N) ──┬───< Questions (N) ───< ChoiceOptions (N)
                              │           │
                              │           └───< Answers (N)
                              │                    │
                              └─────────< Responses (N) ┘
```

### Table Definitions
1. **`creators`**: Simplified default creator entity (`creator_default_1`).
2. **`forms`**: Contains `title`, `description`, unique indexed `slug`, `status` (`draft` | `published`), and JSON `theme_settings`.
3. **`questions`**: Bound to a form with an indexed position `order` column. Constrained to fixed `QuestionType` enum (`short_text`, `long_text`, `multiple_choice`, `dropdown`, `email`, `number`, `yes_no`, `rating`). Type-specific configurations are stored in a JSON `config` column.
4. **`choice_options`**: Options for `multiple_choice` and `dropdown` question types, ordered by position `order`.
5. **`responses`**: Form submissions containing `submitted_at` timestamp index and `completion_time_seconds` metadata.
6. **`answers`**: Normalized table linking `response_id` and `question_id` with polymorphic value columns (`value_text`, `value_number`, `value_json`).

### Cascade Delete Rules
- **Form Deletion**: `ON DELETE CASCADE` on Questions, ChoiceOptions, Responses, and Answers.
- **Question Deletion**: `ON DELETE CASCADE` on ChoiceOptions and Answers.
- **Response Deletion**: `ON DELETE CASCADE` on Answers.

---

## 📡 API Endpoint Reference

### Forms (`/api/v1/forms`)
| Method | Endpoint | Description | Status Code |
|--------|----------|-------------|-------------|
| `GET` | `/api/v1/forms` | List creator's forms with question and response counts | `200 OK` |
| `POST` | `/api/v1/forms` | Create form (auto-generates unique slug if blank) | `201 Created` |
| `GET` | `/api/v1/forms/{id}` | Get full form details with ordered questions & options | `200 OK` |
| `PATCH` | `/api/v1/forms/{id}` | Update title, description, slug, status, or theme | `200 OK` |
| `DELETE` | `/api/v1/forms/{id}` | Delete form (cascades questions, options, responses, answers) | `204 No Content` |
| `POST` | `/api/v1/forms/{id}/duplicate` | Deep copy form + questions + options (status=draft, 0 responses) | `201 Created` |
| `POST` | `/api/v1/forms/{id}/publish` | Assign/confirm stable slug & set status to `published` | `200 OK` |
| `POST` | `/api/v1/forms/{id}/unpublish` | Revert status to `draft` (public URL returns 404) | `200 OK` |

### Questions (`/api/v1/questions` & `/api/v1/forms/{id}/questions`)
| Method | Endpoint | Description | Status Code |
|--------|----------|-------------|-------------|
| `POST` | `/api/v1/forms/{id}/questions` | Add question with type-specific config & choice options | `201 Created` |
| `PATCH` | `/api/v1/questions/{id}` | Edit question prompt, required flag, config, or choices | `200 OK` |
| `DELETE` | `/api/v1/questions/{id}` | Delete question and choice options | `204 No Content` |
| `PATCH` | `/api/v1/forms/{id}/questions/reorder` | Reorder questions via array of ordered question IDs | `200 OK` |

### Public Respondent API (`/api/v1/public/forms`)
| Method | Endpoint | Description | Status Code |
|--------|----------|-------------|-------------|
| `GET` | `/api/v1/public/forms/{slug}` | Fetch published form structure (404 if draft/missing) | `200 OK` |
| `POST` | `/api/v1/public/forms/{slug}/responses` | Submit complete response with transactional server-side validation | `201 Created` |

### Responses & Analytics (`/api/v1/forms/{id}/responses` & `/api/v1/forms/{id}/statistics`)
| Method | Endpoint | Description | Status Code |
|--------|----------|-------------|-------------|
| `GET` | `/api/v1/forms/{id}/responses` | List submitted responses with completion duration and date | `200 OK` |
| `GET` | `/api/v1/forms/{id}/responses/{response_id}` | Get detailed response with answers joined to question text/type | `200 OK` |
| `GET` | `/api/v1/forms/{id}/statistics` | Aggregates per-question analytics, option distributions, and averages | `200 OK` |

---

## ⚡ Local Setup & Execution Guide

### Prerequisites
- **Python**: 3.10+ (tested on Python 3.13.2)
- **Node.js**: 18+ (tested on Node v26.7.0 / npm 11.19.0)

### 1. Setup & Run Backend (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Create virtual environment and activate
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend dev server (runs automatically on http://localhost:8000)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*Note: On first startup, FastAPI automatically creates all SQLite tables in `backend/typeform_builder.db` and populates 3 realistic forms with questions and responses.*

### 2. Setup & Run Frontend (Next.js)
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Next.js dev server (runs on http://localhost:3001 or 3000)
npm run dev -- -p 3001
```

Open `http://localhost:3001` in your browser to access the Creator Dashboard.

---

## 🧪 Automated Testing (`pytest`)

The backend includes a Pytest integration test suite covering Form CRUD, question reordering, publish/unpublish states, transactional submission validation, and statistics math.

To execute the test suite:
```bash
cd backend
source .venv/bin/activate
pytest -v
```

---

## 🚀 Deployment Guidelines

### Backend Deployment (Render / Railway / Fly.io)
- **Python Environment**: Set root command `uvicorn main:app --host 0.0.0.0 --port $PORT`.
- **Database Persistence**: SQLite database file `typeform_builder.db` is stored locally. For production deployments on ephemeral containers (e.g. Render/Railway), attach a persistent disk volume to `/app/` to prevent data loss across container restarts.

### Frontend Deployment (Vercel / Netlify)
- **Framework**: Next.js App Router.
- **Environment Variable**: Set `NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1`.

---

## 💡 Explicit Architectural Assumptions & Limitations

- **Single Creator Simplification**: User authentication is simplified to a default logged-in creator (`creator_default_1`) to focus technical evaluation effort on core form-building, conversational runner UX, drag-and-drop reordering, and analytics.
- **SQLite Storage**: Uses file-based SQLite database with `PRAGMA foreign_keys=ON` for low overhead and persistent local storage across process restarts.
