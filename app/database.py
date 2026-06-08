'''import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# .env file se secret link (MONGO_URL) load kar rahe hain
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

# Database client setup kar rahe hain
client = AsyncIOMotorClient(MONGO_URL)

# Hamare database ka naam 'patentguard_db' hoga
db = client.patentguard_db

# Ek collection (jaise SQL mein table hoti hai) banayenge chunks save karne ke liye
chunks_collection = db.get_collection("document_chunks")
'''
'''import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Code ko specifically bata rahe hain ki .env file kahan hai
load_dotenv(dotenv_path=".env")

MONGO_URL = os.getenv("MONGO_URL")

# Debugging ke liye check kar rahe hain
if MONGO_URL is None:
    print("❌ ERROR: .env file nahi mili ya MONGO_URL khali hai!")
else:
    print("⏳ Link mil gaya, Cloud se connect kar rahe hain...")

# Database client setup
client = AsyncIOMotorClient(MONGO_URL)
db = client.patentguard_db
chunks_collection = db.get_collection("document_chunks")
'''
'''import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# 1. Exact path nikal rahe hain backend folder ka
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(BASE_DIR, ".env")

# 2. Uss specific path se .env file load kar rahe hain
load_dotenv(dotenv_path=env_path)

MONGO_URL = os.getenv("MONGO_URL")

# Debugging check
if MONGO_URL is None:
    print(f"❌ ERROR: Python ko is path par file nahi mili: {env_path}")
else:
    print("⏳ Link mil gaya, Cloud se connect kar rahe hain...")

# Database client setup
if MONGO_URL:
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.patentguard_db
    chunks_collection = db.get_collection("document_chunks")
else:
    client = None # Agar error aaye toh crash na ho
'''
import os
import certifi  # NAYA IMPORT: Security certificates ke liye
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(BASE_DIR, ".env")

load_dotenv(dotenv_path=env_path)

MONGO_URL = os.getenv("MONGO_URL")

if MONGO_URL is None:
    print(f"❌ ERROR: Python ko is path par file nahi mili: {env_path}")
else:
    print("⏳ Link mil gaya, Cloud se connect kar rahe hain...")

# NAYA CODE: SSL issue ko fix karne ke liye tlsCAFile add kiya hai
if MONGO_URL:
    client = AsyncIOMotorClient(MONGO_URL, tlsCAFile=certifi.where())
    db = client.patentguard_db
    chunks_collection = db.get_collection("document_chunks")
else:
    client = None    