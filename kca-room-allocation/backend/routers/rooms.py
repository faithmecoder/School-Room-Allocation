# backend/routers/rooms.py
from fastapi import APIRouter, HTTPException, Body
from database import db_manager
from models import RoomModel
from pydantic import BaseModel
from bson import ObjectId

router = APIRouter(prefix="/api/rooms", tags=["Rooms"])

def room_helper(room) -> dict:
    return {
        "id": str(room["_id"]),
        "room_code": room["room_code"],
        "capacity": room.get("capacity", 0),
        "room_type": room.get("room_type", "Pending")
    }

class RoomUpdateModel(BaseModel):
    capacity: int
    room_type: str

@router.get("/")
async def get_rooms():
    rooms = []
    async for room in db_manager.rooms.find().sort("room_code", 1):
        rooms.append(room_helper(room))
    return rooms

@router.post("/")
async def add_room(room: RoomModel = Body(...)):
    existing = await db_manager.rooms.find_one({"room_code": room.room_code})
    if existing:
        raise HTTPException(status_code=400, detail=f"Room {room.room_code} already exists.")
    new_room = await db_manager.rooms.insert_one(room.model_dump())
    created = await db_manager.rooms.find_one({"_id": new_room.inserted_id})
    return room_helper(created)

@router.put("/{id}")
async def update_room(id: str, room_data: RoomUpdateModel = Body(...)):
    res = await db_manager.rooms.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"capacity": room_data.capacity, "room_type": room_data.room_type}}
    )
    if res.matched_count == 1:
        updated = await db_manager.rooms.find_one({"_id": ObjectId(id)})
        return room_helper(updated)
    raise HTTPException(status_code=404, detail="Room not found.")

@router.delete("/{id}")
async def delete_room(id: str):
    res = await db_manager.rooms.delete_one({"_id": ObjectId(id)})
    if res.deleted_count == 1:
        return {"message": "Room deleted successfully"}
    raise HTTPException(status_code=404, detail="Room not found.")