from app import create_app
from flask import url_for

app = create_app()
with app.test_request_context():
    files = [
        'images/gallery/WhatsApp Image 2026-04-30 at 8.57.04 PM.jpeg',
        'images/gallery/WhatsApp Video 2026-04-30 at 8.57.06 PM.mp4',
        'images/gallery/WhatsApp Video 2026-04-30 at 8.57.07 PM (1).mp4'
    ]
    for f in files:
        print(f, '->', url_for('static', filename=f))
