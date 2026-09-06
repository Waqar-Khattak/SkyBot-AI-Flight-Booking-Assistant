import random
import string
from datetime import datetime
from sqlalchemy import func
from .db.connection import get_db_session
from .db.models import Flight, Booking


def generate_booking_ref() -> str:
    """Generate a readable 6-character alphanumeric reference like SKY984123."""
    digits = "".join(random.choices(string.digits, k=6))
    return f"SKY{digits}"


def get_all_flights() -> list[dict]:
    """Retrieve all flights from the database."""
    with get_db_session() as db:
        flights = db.query(Flight).all()
        return [f.to_dict() for f in flights]


def search_flights(origin: str = None, destination: str = None, date: str = None) -> list[dict]:
    """Search for flights in database matching origin, destination, and optional date."""
    with get_db_session() as db:
        query = db.query(Flight)

        if origin and origin.strip():
            query = query.filter(func.lower(Flight.origin).contains(origin.strip().lower()))

        if destination and destination.strip():
            query = query.filter(func.lower(Flight.destination).contains(destination.strip().lower()))

        if date and date.strip():
            query = query.filter(Flight.date == date.strip())

        flights = query.all()
        return [f.to_dict() for f in flights]


def get_flight_by_id(flight_id: str) -> dict | None:
    """Retrieve flight record by primary key."""
    if not flight_id:
        return None
    flight_id = flight_id.strip().upper()
    with get_db_session() as db:
        flight = db.query(Flight).filter(func.upper(Flight.flight_id) == flight_id).first()
        return flight.to_dict() if flight else None


def get_all_bookings() -> list[dict]:
    """Retrieve all bookings from the database."""
    with get_db_session() as db:
        bookings = db.query(Booking).all()
        return [b.to_dict() for b in bookings]


def get_booking_by_ref(booking_ref: str) -> dict | None:
    """Find a booking by reference code (case-insensitive)."""
    if not booking_ref:
        return None
    ref = booking_ref.strip().upper()
    with get_db_session() as db:
        booking = db.query(Booking).filter(func.upper(Booking.booking_ref) == ref).first()
        return booking.to_dict() if booking else None


def book_flight(flight_id: str, passenger_name: str, passenger_email: str) -> dict:
    """Book a seat on a flight and insert record into database."""
    flight_id = flight_id.strip().upper()
    with get_db_session() as db:
        flight = db.query(Flight).filter(func.upper(Flight.flight_id) == flight_id).first()
        if not flight:
            raise ValueError(f"Flight '{flight_id}' not found in database.")

        booking_ref = generate_booking_ref()
        booking = Booking(
            booking_ref=booking_ref,
            flight_id=flight.flight_id,
            passenger_name=passenger_name.strip(),
            passenger_email=passenger_email.strip(),
            origin=flight.origin,
            destination=flight.destination,
            date=flight.date,
            departure_time=flight.departure_time,
            arrival_time=flight.arrival_time,
            airline=flight.airline,
            price=flight.price,
            status="CONFIRMED",
            booked_at=datetime.utcnow().isoformat()
        )
        db.add(booking)
        db.flush()
        return booking.to_dict()


def cancel_booking(booking_ref: str) -> dict:
    """Cancel an active booking in the database."""
    ref = booking_ref.strip().upper()
    with get_db_session() as db:
        booking = db.query(Booking).filter(func.upper(Booking.booking_ref) == ref).first()
        if not booking:
            raise ValueError(f"No booking found with reference '{booking_ref}'.")

        booking.status = "CANCELLED"
        booking.cancelled_at = datetime.utcnow().isoformat()
        db.flush()
        return booking.to_dict()
