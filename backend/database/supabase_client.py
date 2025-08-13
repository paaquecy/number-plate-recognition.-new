import os
from typing import Any
try:
    from supabase import create_client, Client  # type: ignore
except Exception:
    create_client = None  # type: ignore
    Client = Any  # type: ignore

try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
except Exception:
    pass

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

class _NoOpSupabase:
    def table(self, *_args: Any, **_kwargs: Any):
        class _NoOpTable:
            def select(self, *args: Any, **kwargs: Any):
                return self
            def limit(self, *args: Any, **kwargs: Any):
                return self
            def execute(self, *args: Any, **kwargs: Any):
                return {"data": [], "error": None}
        return _NoOpTable()

# Initialize Supabase client (fallback to no-op in dev if env missing)
if SUPABASE_URL and SUPABASE_KEY and create_client is not None:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)  # type: ignore
else:
    supabase = _NoOpSupabase()  # type: ignore

# Test connection
def test_connection() -> bool:
    try:
        # Simple query to test connection
        if isinstance(supabase, _NoOpSupabase):
            print("⚠️  Supabase env not configured; using no-op client")
            return False
        response = supabase.table("users").select("*").limit(1).execute()
        print("✅ Supabase connection successful")
        return True
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

if __name__ == "__main__":
    test_connection()
