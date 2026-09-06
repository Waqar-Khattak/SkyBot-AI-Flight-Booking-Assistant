from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Flight(Base):
    __tablename__ = "flights"

    flight_id = Column(String(20), primary_key=True, index=True)
    origin = Column("from", String(100), nullable=False, index=True)
    destination = Column("to", String(100), nullable=False, index=True)
    date = Column(String(20), nullable=False, index=True)
    departure_time = Column(String(10), nullable=False)
    arrival_time = Column(String(10), nullable=False)
    airline = Column(String(100), nullable=False)
    price = Column(Integer, nullable=False)

    bookings = relationship("Booking", back_populates="flight")

    def to_dict(self) -> dict:
        return {
            "flight_id": self.flight_id,
            "from": self.origin,
            "to": self.destination,
            "date": self.date,
            "departure_time": self.departure_time,
            "arrival_time": self.arrival_time,
            "airline": self.airline,
            "price": self.price
        }


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    booking_ref = Column(String(20), unique=True, nullable=False, index=True)
    flight_id = Column(String(20), ForeignKey("flights.flight_id"), nullable=False)
    passenger_name = Column(String(120), nullable=False)
    passenger_email = Column(String(120), nullable=False)
    origin = Column("from", String(100), nullable=False)
    destination = Column("to", String(100), nullable=False)
    date = Column(String(20), nullable=False)
    departure_time = Column(String(10), nullable=False)
    arrival_time = Column(String(10), nullable=False)
    airline = Column(String(100), nullable=False)
    price = Column(Integer, nullable=False)
    status = Column(String(20), default="CONFIRMED", nullable=False)
    booked_at = Column(String(50), nullable=False)
    cancelled_at = Column(String(50), nullable=True)

    flight = relationship("Flight", back_populates="bookings")

    def to_dict(self) -> dict:
        return {
            "booking_ref": self.booking_ref,
            "flight_id": self.flight_id,
            "passenger_name": self.passenger_name,
            "passenger_email": self.passenger_email,
            "from": self.origin,
            "to": self.destination,
            "date": self.date,
            "departure_time": self.departure_time,
            "arrival_time": self.arrival_time,
            "airline": self.airline,
            "price": self.price,
            "status": self.status,
            "booked_at": self.booked_at,
            "cancelled_at": self.cancelled_at
        }
