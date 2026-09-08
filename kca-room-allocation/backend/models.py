# backend/models.py
from pydantic import BaseModel, Field

class RoomModel(BaseModel):
    room_code: str = Field(..., description="E.g., LAB 1, LT 1-1, TC 0-1")
    capacity: int = Field(..., gt=0, description="Maximum student capacity")
    room_type: str = Field(..., description="E.g., Laboratory, Lecture Hall, Virtual")

    class Config:
        json_schema_extra = {
            "example": {
                "room_code": "LAB 1",
                "capacity": 45,
                "room_type": "Laboratory"
            }
        }