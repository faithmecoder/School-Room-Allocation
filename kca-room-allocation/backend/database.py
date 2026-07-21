# backend/database.py
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "kca_room_allocation")

class Database:
    client: AsyncIOMotorClient = None
    db = None

    # Collections
    timetables = None
    rooms = None
    users = None
    validation_reports = None

db_manager = Database()

async def connect_to_mongo():
    """Establish connection to MongoDB."""
    print("Connecting to MongoDB...")
    db_manager.client = AsyncIOMotorClient(MONGODB_URL)
    db_manager.db = db_manager.client[DATABASE_NAME]
    
    # Initialize collections
    db_manager.timetables = db_manager.db["timetables"]
    db_manager.rooms = db_manager.db["rooms"]
    db_manager.users = db_manager.db["users"]
    db_manager.validation_reports = db_manager.db["validation_reports"]
    
    print(f"Connected to database: {DATABASE_NAME}")

async def close_mongo_connection():
    """Close the MongoDB connection."""
    print("Closing MongoDB connection...")
    if db_manager.client:
        db_manager.client.close()
        print("MongoDB connection closed.")