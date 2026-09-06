from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from . import flight_service
from .llm_service import generate_chat_reply
from .db.connection import init_db
from .db.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables & auto-seed
    init_db()
    seed_database()
    yield


app = FastAPI(
    title="SkyBot - Flight Booking Chatbot API",
    description="GenAI-powered flight reservation backend using Groq LLM, SQLAlchemy database, and tool calling.",
    version="2.1.0",
    lifespan=lifespan
)

# Enable CORS for local React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request / Response Schemas
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    reply: str

class BookRequest(BaseModel):
    flight_id: str
    passenger_name: str
    passenger_email: str


# Endpoints
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "SkyBot Flight Assistant API (Database Active)"}

@app.get("/flights")
def get_flights(origin: Optional[str] = None, destination: Optional[str] = None, date: Optional[str] = None):
    return flight_service.search_flights(origin=origin, destination=destination, date=date)

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest):
    """Multi-turn conversational endpoint called by React frontend."""
    if not payload.messages:
        raise HTTPException(status_code=400, detail="Messages history cannot be empty.")
    
    # Format messages as dict list for LLM service
    history = [{"role": m.role, "content": m.content} for m in payload.messages]
    reply = generate_chat_reply(history)
    return ChatResponse(reply=reply)

@app.post("/book")
def book_endpoint(payload: BookRequest):
    """Direct flight booking endpoint triggered by BookingModal."""
    try:
        booking = flight_service.book_flight(
            flight_id=payload.flight_id,
            passenger_name=payload.passenger_name,
            passenger_email=payload.passenger_email
        )
        return booking
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Booking failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)
