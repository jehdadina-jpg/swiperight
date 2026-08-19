"""
Shared slowapi rate limiter instance.
Kept in its own module (rather than main.py) so endpoint modules can
import it without creating a circular import with main.py -> api_router
-> endpoints -> main.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

from core.config import settings

limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"])
