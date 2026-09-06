import os
import json
from dotenv import load_dotenv
from .tools import TOOLS_SCHEMA, execute_tool_call
from . import flight_service

load_dotenv()

SYSTEM_PROMPT = """You are SkyBot, an intelligent and courteous AI flight assistant.
Your job is to help users:
1. Search and compare flight routes, dates, and prices.
2. Provide details about specific flights (times, airline, prices).
3. Check existing booking references (e.g., SKY123456).
4. Assist with reservations and cancellations.

Important Guidelines:
- Whenever you present a flight option to the user, ALWAYS include the flight ID formatted as bold, e.g., **FL101**, **FL201**. The frontend interface automatically detects these IDs to render a quick '✈️ Book' action button for the user!
- Provide concise, pleasant, and structured responses using markdown bullet points and bolding for readability.
- If the user asks to search for flights without specifying an origin or destination, ask them politely for the missing information (slot filling).
- If the user provides flight dates, prioritize matching flights on that date.
- Use your tools to check real flight data and booking statuses rather than guessing.
"""

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    try:
        from groq import Groq
        return Groq(api_key=api_key)
    except ImportError:
        return None


def run_fallback_assistant(messages: list[dict]) -> str:
    """A helpful offline fallback when GROQ_API_KEY is not configured."""
    last_msg = (messages[-1]["content"] if messages else "").lower()

    if "london" in last_msg and "paris" in last_msg:
        flights = flight_service.search_flights(origin="London", destination="Paris")
        lines = ["Here are the available flights from **London** to **Paris**:\n"]
        for f in flights:
            lines.append(f"• **{f['flight_id']}** | {f['airline']} | 📅 {f['date']} | ⏰ {f['departure_time']}–{f['arrival_time']} | 💰 ${f['price']}")
        lines.append("\nYou can click the **Book** button below or ask me to book it for you!")
        return "\n".join(lines)

    if "new york" in last_msg:
        flights = flight_service.search_flights(destination="New York")
        lines = ["Here are the flights to **New York**:\n"]
        for f in flights:
            lines.append(f"• **{f['flight_id']}** | {f['airline']} | 🛫 {f['from']} → 🛬 {f['to']} | 📅 {f['date']} | 💰 ${f['price']}")
        return "\n".join(lines)

    if "dubai" in last_msg:
        flights = flight_service.search_flights(origin="Dubai")
        lines = ["Here are the flights departing from **Dubai**:\n"]
        for f in flights:
            lines.append(f"• **{f['flight_id']}** | {f['airline']} | 🛫 {f['from']} → 🛬 {f['to']} | 📅 {f['date']} | 💰 ${f['price']}")
        return "\n".join(lines)

    if "sky" in last_msg or "booking" in last_msg:
        import re
        match = re.search(r"SKY\d{6}", last_msg.upper())
        if match:
            b = flight_service.get_booking_by_ref(match.group(0))
            if b:
                return (
                    f"📋 **Booking Details Found:**\n\n"
                    f"• Reference: **{b['booking_ref']}**\n"
                    f"• Passenger: **{b['passenger_name']}**\n"
                    f"• Flight: **{b['flight_id']}** ({b['from']} → {b['to']})\n"
                    f"• Date: {b['date']} ({b['departure_time']} - {b['arrival_time']})\n"
                    f"• Status: **{b['status']}**"
                )
            return f"❌ No booking found with reference **{match.group(0)}**."

    return (
        "I can help you search flights, check reservations, or book tickets!\n\n"
        "💡 *Tip: Configure your `GROQ_API_KEY` in `.env` to enable full autonomous LLM tool calling. "
        "In the meantime, try asking: 'Search flights from London to Paris' or 'Check my booking SKY123456'.*"
    )


def generate_chat_reply(messages: list[dict]) -> str:
    """Generate assistant response using Groq LLM with multi-turn history and function calling."""
    client = get_groq_client()
    if not client:
        return run_fallback_assistant(messages)

    # Format messages payload with system prompt
    formatted_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in messages:
        if m.get("role") in ["user", "assistant", "system"]:
            formatted_messages.append({
                "role": m["role"],
                "content": m.get("content") or ""
            })

    # Reload .env in case it was updated
    load_dotenv(override=True)

    # Candidate models in order of priority
    env_model = os.getenv("GROQ_MODEL")
    candidate_models = []
    if env_model:
        candidate_models.append(env_model)
    for fallback in ["openai/gpt-oss-120b", "openai/gpt-oss-20b"]:
        if fallback not in candidate_models:
            candidate_models.append(fallback)

    last_error = None
    for model_name in candidate_models:
        try:
            # Multi-step tool execution loop (up to 4 rounds)
            current_messages = list(formatted_messages)
            for _ in range(4):
                response = client.chat.completions.create(
                    model=model_name,
                    messages=current_messages,
                    tools=TOOLS_SCHEMA,
                    tool_choice="auto",
                    temperature=0.3,
                    max_tokens=1024
                )

                response_message = response.choices[0].message
                tool_calls = response_message.tool_calls

                # If no further tools requested, return the final response
                if not tool_calls:
                    return response_message.content or ""

                current_messages.append(response_message)

                for tool_call in tool_calls:
                    function_name = tool_call.function.name
                    try:
                        function_args = json.loads(tool_call.function.arguments)
                    except Exception:
                        function_args = {}

                    tool_result = execute_tool_call(function_name, function_args)

                    current_messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": tool_result
                    })

            # If all rounds used, return content from the latest message
            return response_message.content or ""

        except Exception as e:
            err_str = str(e)
            last_error = e
            # If model was not found or 404, try the next candidate model
            if "model_not_found" in err_str or "does not exist" in err_str or "404" in err_str:
                continue
            # For other unexpected errors, break and show fallback
            break

    # If all candidates failed
    return f"⚠️ Groq API connection notice: {str(last_error)}\n\n" + run_fallback_assistant(messages)
