import sys
from pathlib import Path

# Add the backend directory to the path so tests can import the app module
sys.path.insert(0, str(Path(__file__).parent.parent))
