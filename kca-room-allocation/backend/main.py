from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import connect_to_mongo, close_mongo_connection, db_manager
import pandas as pd
import io

app = FastAPI(title="Room Allocation System API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/")
async def root():
    return {"message": "KCA Room Allocation API is running and connected to MongoDB."}

@app.post("/api/upload")
async def upload_timetable(file: UploadFile = File(...)):
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Only .xlsx files are allowed")

    try:
        contents = await file.read()
        xls = pd.ExcelFile(io.BytesIO(contents))
        parsed_records = []
        
        for sheet_name in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name=sheet_name, header=None)
            current_cohort = "Unknown"
            
            for index, row in df.iterrows():
                col0 = str(row[0]).strip() if pd.notna(row[0]) else ""
                col1 = str(row[1]).strip() if pd.notna(row[1]) else ""
                
                if not col0 and not col1:
                    continue
                    
                if col0 and not col1 and "BACHELOR" not in col0.upper():
                    current_cohort = col0
                    continue
                
                if col0.upper() == "DAY NO":
                    continue
                    
                if col0.isdigit():
                    room_type = str(row[3]).strip() if pd.notna(row[3]) else ""
                    room_code = str(row[4]).strip() if pd.notna(row[4]) else ""
                    
                    record = {
                        "program_sheet": sheet_name,
                        "cohort": current_cohort,
                        "trimester": str(row[7]).strip() if pd.notna(row[7]) else "",
                        "unit_code": str(row[5]).strip() if pd.notna(row[5]) else "",
                        "unit_name": str(row[6]).strip() if pd.notna(row[6]) else "",
                        "schedule": {
                            "day_no": int(col0),
                            "day": str(row[1]).strip() if pd.notna(row[1]) else "",
                            "time_slot": str(row[2]).strip() if pd.notna(row[2]) else ""
                        },
                        "allocation": {
                            "room_type": room_type,
                            "room_code": room_code
                        },
                        "metadata": {
                            "is_virtual": "VIRTUAL" in room_type.upper(),
                            "needs_multiple_rooms": "/" in room_code
                        }
                    }
                    parsed_records.append(record)
        
        if parsed_records:
            await db_manager.timetables.delete_many({})
            await db_manager.timetables.insert_many(parsed_records)
            
        return {
            "status": "success", 
            "message": f"Successfully parsed and inserted {len(parsed_records)} classes into the database."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

# --- NEW DATA ENDPOINTS ---

@app.get("/api/dashboard-stats")
async def get_dashboard_stats():
    try:
        total_classes = await db_manager.timetables.count_documents({})
        unique_rooms = await db_manager.timetables.distinct("allocation.room_code")
        unique_cohorts = await db_manager.timetables.distinct("cohort")
        
        return {
            "total_classes": total_classes,
            "total_rooms": len(unique_rooms),
            "active_cohorts": len(unique_cohorts)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/rooms")
async def get_real_rooms():
    try:
        pipeline = [
            {"$group": {
                "_id": "$allocation.room_code",
                "room_type": {"$first": "$allocation.room_type"}
            }},
            {"$sort": {"_id": 1}}
        ]
        cursor = db_manager.timetables.aggregate(pipeline)
        rooms_list = await cursor.to_list(length=100)
        
        formatted_rooms = []
        for r in rooms_list:
            # Prevent empty or 'nan' rooms from appearing in the UI
            if r["_id"] and str(r["_id"]).lower() != "nan":
                formatted_rooms.append({
                    "code": r["_id"],
                    "name": f"Facility {r['_id']}",
                    "type": r["room_type"] or "Physical",
                    "capacity": 100, 
                    "status": "Active"
                })
        
        return formatted_rooms
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/conflicts")
async def get_real_conflicts():
    try:
        pipeline = [
            {"$group": {
                "_id": {
                    "room": "$allocation.room_code",
                    "day": "$schedule.day",
                    "time": "$schedule.time_slot"
                },
                "count": {"$sum": 1},
                "units": {"$push": "$unit_name"},
                "cohorts": {"$push": "$cohort"}
            }},
           {"$match": {
            "count": {"$gt": 1},
            "_id.room": {"$nin": ["ZOOM", "nan", "", "VIRTUAL"]}
        }}
        ]
        cursor = db_manager.timetables.aggregate(pipeline)
        conflicts_raw = await cursor.to_list(length=50)
        
        formatted_conflicts = []
        for idx, c in enumerate(conflicts_raw):
            formatted_conflicts.append({
                "id": f"CONF-{str(idx+1).zfill(3)}",
                "room": c["_id"]["room"],
                "course": f"{c['units'][0]} & {c['units'][1]}",
                "issue": f"Double Booking on {c['_id']['day']} at {c['_id']['time']}",
                "severity": "High"
            })
            
        return formatted_conflicts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))