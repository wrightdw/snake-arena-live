#!/usr/bin/env python
"""Entry point for the Snake Arena backend application."""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    workers = int(os.getenv("API_WORKERS", "1"))

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        workers=workers,
        reload=True,  # Enable auto-reload for development
    )
