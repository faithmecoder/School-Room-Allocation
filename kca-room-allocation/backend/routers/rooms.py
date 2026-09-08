# backend/routers/rooms.py
from fastapi import APIRouter, HTTPException, Body
from database import db_manager
from models import RoomModel
from bson import ObjectId

router = APIRouter(prefix="/api/rooms", tags=["Rooms"])

def room_helper(room) -> dict:
    return {
        "id": str(room["_id"]),
        "room_code": room["room_code"],
        "capacity": room["capacity"],
        "room_type": room["room_type"]
    }

@router.post("/", response_description="Add a new room")
async def add_room(room: RoomModel = Body(...)):
    # Check if the room code already exists to prevent duplicates
    existing_room = await db_manager.rooms.find_one({"room_code": room.room_code})
    if existing_room:
        raise HTTPException(status_code=400, detail=f"Room {room.room_code} already exists.")
    
    room_dict = room.model_dump()
    new_room = await db_manager.rooms.insert_one(room_dict)
    created_room = await db_manager.rooms.find_one({"_id": new_room.inserted_id})
    return room_helper(created_room)

@router.get("/", response_description="List all rooms")
async def get_rooms():
    rooms = []
    async for room in db_manager.rooms.find():
        rooms.append(room_helper(room))
    return rooms

@router.delete("/{id}", response_description="Delete a room")
async def delete_room(id: str):
    delete_result = await db_manager.rooms.delete_one({"_id": ObjectId(id)})
    if delete_result.deleted_count == 1:
        return {"message": "Room deleted successfully"}
    raise HTTPException(status_code=404, detail="Room not found")

# backend/routers/rooms.py (Add to the bottom of the file)
from pydantic import BaseModel

class RoomUpdateModel(BaseModel):
    capacity: int
    room_type: str

@router.put("/{id}", response_description="Update a room's capacity and type")
async def update_room(id: str, room_data: RoomUpdateModel = Body(...)):
    update_result = await db_manager.rooms.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"capacity": room_data.capacity, "room_type": room_data.room_type}}
    )
    
    if update_result.modified_count == 1:
        updated_room = await db_manager.rooms.find_one({"_id": ObjectId(id)})
        return room_helper(updated_room)
    
    raise HTTPException(status_code=404, detail="Room not found or no changes made")