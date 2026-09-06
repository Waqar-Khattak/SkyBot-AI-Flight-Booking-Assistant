# SkyBot - GenAI Flight Booking Chatbot

SkyBot is a conversational AI flight booking assistant powered by Groq LLMs and built with FastAPI, SQLAlchemy, and React.
It lets users search and compare flights, get prices, check bookings, and book or cancel tickets through natural language and tool calling.
The project includes multi-turn conversation memory, SQLite persistence with CSV seeding, a responsive frontend, and an offline fallback.

## Key Features

1. **Groq LLM Integration**: Natural language understanding without rigid intents or brittle regex. Powered by fast inference on Groq (`llama-3.3-70b-versatile`).
2. **Autonomous Tool Calling**:
   - `search_flights(origin, destination, date)`
   - `get_ticket_price(flight_id)`
   - `book_ticket(flight_id, passenger_name, passenger_email)`
   - `check_booking(booking_ref)`
   - `cancel_booking(booking_ref)`
3. **Relational Database (SQLAlchemy)**:
   - Zero-configuration **SQLite** by default (`flight_booking.db`).
   - Other SQLAlchemy databases can be configured with `DATABASE_URL` after installing the appropriate database driver.
   - Auto-seeding from `flights.csv` on first startup.
   - ACID-compliant transactions for reservations and cancellations.
4. **Multi-Turn Conversation Memory**: Retains conversation history across turns to remember dates, departure/arrival cities, and passenger preferences.
5. **Slot Filling**: Intelligently identifies missing travel parameters (origin, destination, date) and requests only the necessary missing information.
6. **Interactive UI with Quick Actions**:
   - Sidebar with instant quick-action prompts.
   - Dynamic regex extraction for flight IDs (`FL101`, `FL201`, etc.) rendering one-click **✈️ Book** buttons.
   - Interactive **Booking Modal** for passenger details.
7. **Graceful Offline Fallback**: Includes built-in search and reservation handler even if no API key is set initially.

---

## Project Structure

```plaintext
Flight Booking Chatbot/
│
├── backend/
│   ├── app.py                 # FastAPI application with lifespan DB init
│   ├── llm_service.py         # Groq LLM client, prompt & tool execution loop
│   ├── tools.py               # Function schemas and execution dispatcher
│   ├── flight_service.py      # SQLAlchemy queries for flights and bookings
│   ├── db/
│   │   ├── models.py          # Flight and Booking ORM models
│   │   ├── connection.py      # Engine and session management
│   │   └── seed.py            # Automatic seeder from CSV
│   └── data/
│       └── flight_booking.db  # SQLite database file (created on startup)
│
├── frontend/
│   ├── index.html             # HTML entry point with Inter typography
│   ├── package.json           # React 18, Vite, Lucide icons
│   ├── vite.config.js         # Vite configuration with API proxy to backend
│   └── src/
│       ├── main.jsx           # React root mount
│       ├── App.jsx            # Shell layout with Navbar & ChatPage
│       ├── index.css          # Design system tokens (--blue, --navy, --sky, etc.)
│       ├── pages/
│       │   └── ChatPage.jsx   # Interactive chat interface & flight cards
│       └── components/
│           ├── Navbar.jsx     # Header navigation & LLM status badge
│           └── BookingModal.jsx # Passenger reservation dialog
│
├── flights.csv                # Initial flight schedules seed data
├── .env.example               # Environment variables template
├── requirements.txt           # Root requirements pointing to backend
└── README.md                  # Project documentation
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide React, Vanilla CSS with custom design tokens.
- **Backend**: Python 3.10+, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic.
- **Database**: SQLite (default) / PostgreSQL (configurable via `DATABASE_URL`).
 - **Database**: SQLite by default; other SQLAlchemy database URLs require the matching database driver.
- **AI & LLM**: Groq API (`llama-3.3-70b-versatile`) with Native Tool/Function Calling.

---

## Setup & Installation

### 1. Environment Configuration
Copy `.env.example` to `.env` and add your Groq API key:
```bash
cp .env.example .env
```
Inside `.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Defaults to SQLite in backend/data/flight_booking.db
DATABASE_URL=sqlite:///./backend/data/flight_booking.db
# For PostgreSQL: postgresql://username:password@localhost:5432/flight_booking
```

---

### 2. Backend Setup (FastAPI + Database)
```bash
# Create and activate virtual environment (optional)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server (auto-creates tables and seeds data on first run)
uvicorn backend.app:app --reload --port 8000
```
Backend runs at: `http://localhost:8000` (Swagger docs available at `http://localhost:8000/docs`).

---

### 3. Frontend Setup (React + Vite)
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000` (automatically proxies API requests to `http://localhost:8000`).
#
