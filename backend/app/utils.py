import resend
from app.core.config import settings
from icalendar import Calendar, Event
from datetime import datetime, date, time
import uuid
from app.models import Shift
import base64


resend.api_key = settings.RESEND_KEY


def generate_ics(
    shift_title: str,
    shift_date: date,
    start_time: time,
    end_time: time,
    location: str,
    notes: str | None,
) -> bytes:
    cal = Calendar()
    cal.add("prodid", "-//ShiftMate//shiftmate.app//EN")
    cal.add("version", "2.0")
    cal.add("method", "PUBLISH")

    event = Event()
    event.add("summary", shift_title)
    event.add("dtstart", datetime.combine(shift_date, start_time))
    event.add("dtend", datetime.combine(shift_date, end_time))
    event.add("location", location)
    event.add("uid", str(uuid.uuid4()))

    if notes:
        event.add("description", notes)

    cal.add_component(event)
    return cal.to_ical()


def send_signup_confirmation(
    volunteer_name: str,
    volunteer_email: str,
    org_name: str,
    shift: Shift,
) -> None:
    ics_bytes = generate_ics(
        shift_title=shift.title,
        shift_date=shift.date,
        start_time=shift.start_time,
        end_time=shift.end_time,
        location=shift.location,
        notes=shift.notes,
    )

    resend.Emails.send(
        {
            "from": "ShiftMate <onboarding@resend.dev>",
            "to": volunteer_email,
            "subject": f"You're signed up for {shift.title}",
            "html": f"""
            <p>Hi {volunteer_name},</p>
            <p>You're confirmed for <strong>{shift.title}</strong> with <strong>{org_name}</strong>.</p>
            <ul>
                <li><strong>Date:</strong> {shift.date.strftime("%B %d, %Y")}</li>
                <li><strong>Time:</strong> {shift.start_time.strftime("%I:%M %p")} – {shift.end_time.strftime("%I:%M %p")}</li>
                <li><strong>Location:</strong> {shift.location}</li>
            </ul>
            <p>The calendar invite is attached — add it to your calendar so you don't forget.</p>
            <p>See you there!</p>
        """,
            "attachments": [
                {
                    "filename": "shift.ics",
                    "content": list(ics_bytes),
                }
            ],
        }
    )
