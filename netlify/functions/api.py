import os
import sys

# Ensure the project root directory is in the python path
# so that the serverless runtime can import app.py, models, config, and other modules.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from serverless_wsgi import handle_request
from app import app

def handler(event, context):
    # Pass the incoming serverless event and context to Flask via WSGI
    return handle_request(app, event, context)
