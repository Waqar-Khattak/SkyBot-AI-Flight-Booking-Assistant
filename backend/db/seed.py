import csv
from pathlib import Path
from datetime import datetime
from .connection import get_db_session
from .models import Flight, Booking

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent
FLIGHTS_CSV_PATH = ROOT_DIR / "flights.csv"


def seed_database():
    """Seeds the database with initial flight schedules and a test booking if empty."""
    with get_db_session() as db:
        # Sync all flights from CSV into database (insert if not present)
        if FLIGHTS_CSV_PATH.exists():
            existing_ids = {f.flight_id for f in db.query(Flight.flight_id).all()}
            with open(FLIGHTS_CSV_PATH, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    fid = row["flight_id"].strip()
                    if fid not in existing_ids:
                        flight = Flight(
                            flight_id=fid,
                            origin=row["from"].strip(),
                            destination=row["to"].strip(),
                            date=row["date"].strip(),
                            departure_time=row["departure_time"].strip(),
                            arrival_time=row["arrival_time"].strip(),
                            airline=row["airline"].strip(),
                            price=int(row["price"])
                        )
                        db.add(flight)
                        existing_ids.add(fid)

        # Check if sample booking exists
        booking_count = db.query(Booking).count()
        if booking_count == 0:
            sample_booking = Booking(
                booking_ref="SKY123456",
                flight_id="FL101",
                passenger_name="Jane Doe",
                passenger_email="jane.doe@example.com",
                origin="London",
                destination="Paris",
                date="2024-12-10",
                departure_time="08:30",
                arrival_time="10:45",
                airline="British Airways",
                price=100,
                status="CONFIRMED",
                booked_at=datetime.utcnow().isoformat()
            )
            db.add(sample_booking)
