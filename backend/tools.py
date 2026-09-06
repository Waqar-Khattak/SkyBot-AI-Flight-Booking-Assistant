import json
from . import flight_service

# Groq / OpenAI compatible tool declarations
TOOLS_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "search_flights",
            "description": "Search for available flights based on origin city, destination city, and optional travel date.",
            "parameters": {
                "type": "object",
                "properties": {
                    "origin": {
                        "type": "string",
                        "description": "The departure city or airport (e.g. London, Dubai, Paris, Tokyo)."
                    },
                    "destination": {
                        "type": "string",
                        "description": "The destination city or airport (e.g. Paris, New York, Tokyo, Sydney)."
                    },
                    "date": {
                        "type": "string",
                        "description": "Optional flight date in YYYY-MM-DD format (e.g. 2024-12-10)."
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_ticket_price",
            "description": "Retrieve price and schedule details for a specific flight ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "flight_id": {
                        "type": "string",
                        "description": "The flight identifier, e.g. FL101, FL201."
                    }
                },
                "required": ["flight_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "book_ticket",
            "description": "Book a ticket for a passenger on a specific flight.",
            "parameters": {
                "type": "object",
                "properties": {
                    "flight_id": {
                        "type": "string",
                        "description": "The flight identifier to book, e.g. FL101."
                    },
                    "passenger_name": {
                        "type": "string",
                        "description": "Full name of the passenger."
                    },
                    "passenger_email": {
                        "type": "string",
                        "description": "Email address of the passenger."
                    }
                },
                "required": ["flight_id", "passenger_name", "passenger_email"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "check_booking",
            "description": "Look up reservation details using a booking reference code.",
            "parameters": {
                "type": "object",
                "properties": {
                    "booking_ref": {
                        "type": "string",
                        "description": "The booking reference code, e.g. SKY123456."
                    }
                },
                "required": ["booking_ref"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "cancel_booking",
            "description": "Cancel an active booking using its booking reference.",
            "parameters": {
                "type": "object",
                "properties": {
                    "booking_ref": {
                        "type": "string",
                        "description": "The booking reference to cancel, e.g. SKY123456."
                    }
                },
                "required": ["booking_ref"]
            }
        }
    }
]


def execute_tool_call(tool_name: str, arguments: dict) -> str:
    """Dispatches a tool call to the corresponding flight_service function and returns JSON string."""
    try:
        if tool_name == "search_flights":
            origin = arguments.get("origin")
            destination = arguments.get("destination")
            date = arguments.get("date")
            flights = flight_service.search_flights(origin=origin, destination=destination, date=date)
            return json.dumps({"status": "success", "count": len(flights), "flights": flights})

        elif tool_name == "get_ticket_price":
            flight_id = arguments.get("flight_id")
            flight = flight_service.get_flight_by_id(flight_id)
            if flight:
                return json.dumps({"status": "success", "flight": flight})
            return json.dumps({"status": "not_found", "message": f"Flight {flight_id} was not found."})

        elif tool_name == "book_ticket":
            flight_id = arguments.get("flight_id")
            name = arguments.get("passenger_name")
            email = arguments.get("passenger_email")
            booking = flight_service.book_flight(flight_id, name, email)
            return json.dumps({"status": "success", "booking": booking})

        elif tool_name == "check_booking":
            ref = arguments.get("booking_ref")
            booking = flight_service.get_booking_by_ref(ref)
            if booking:
                return json.dumps({"status": "success", "booking": booking})
            return json.dumps({"status": "not_found", "message": f"No reservation found for reference '{ref}'."})

        elif tool_name == "cancel_booking":
            ref = arguments.get("booking_ref")
            cancelled = flight_service.cancel_booking(ref)
            return json.dumps({"status": "success", "message": f"Booking {ref} has been cancelled.", "booking": cancelled})

        else:
            return json.dumps({"status": "error", "message": f"Unknown function: {tool_name}"})

    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})
