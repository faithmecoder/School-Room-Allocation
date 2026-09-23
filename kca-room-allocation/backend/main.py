import re
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import connect_to_mongo, close_mongo_connection, db_manager
from routers import rooms
import pandas as pd
import io
from pydantic import BaseModel
from bson import ObjectId
from fastapi.responses import StreamingResponse
from typing import Optional
from collections import defaultdict
from datetime import datetime
from pydantic import BaseModel
import xlsxwriter
from bson import ObjectId


app = FastAPI(title="Room Allocation System API")
app.include_router(rooms.router)

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
            # 1. Save the parsed timetable data
            await db_manager.timetables.delete_many({})
            await db_manager.timetables.insert_many(parsed_records)
            
            # 2. Extract unique rooms and save them to the rooms collection
            unique_room_codes = {
                str(record["allocation"]["room_code"]).strip() 
                for record in parsed_records 
                if record.get("allocation") and record["allocation"].get("room_code")
            }
            
            invalid_rooms = ["", "NAN", "NONE", "VIRTUAL", "ZOOM"]
            
            for code in unique_room_codes:
                clean_code = str(code).strip()
                is_date = bool(re.search(r"\d{4}-\d{2}-\d{2}", clean_code))
                
                if clean_code.upper() not in invalid_rooms and not is_date:
                    existing_room = await db_manager.rooms.find_one({"room_code": clean_code})
                    if not existing_room:
                        await db_manager.rooms.insert_one({
                            "room_code": clean_code,
                            "capacity": 0,
                            "room_type": "Pending"
                        })
            
        return {
            "status": "success", 
            "message": f"Successfully parsed and inserted {len(parsed_records)} classes into the database."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")



@app.post("/api/rooms/bulk-upload")
async def bulk_upload_rooms(file: UploadFile = File(...)):
    """Bulk updates or inserts room capacities from a CSV or Excel file."""
    if not (file.filename.endswith('.xlsx') or file.filename.endswith('.csv')):
        raise HTTPException(status_code=400, detail="Only .xlsx or .csv files are supported.")

    try:
        contents = await file.read()
        
        # Parse based on extension
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))

        # Standardize column names to lowercase stripped strings
        df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]

        if 'room_code' not in df.columns or 'capacity' not in df.columns:
            raise HTTPException(
                status_code=400, 
                detail="File must contain at least 'room_code' and 'capacity' columns."
            )

        processed_count = 0
        for _, row in df.iterrows():
            raw_code = str(row['room_code']).strip()
            if not raw_code or raw_code.upper() in ["NAN", "NONE", ""]:
                continue

            try:
                cap = int(row['capacity'])
            except (ValueError, TypeError):
                cap = 0

            # Optional room_type column fallback
            if 'room_type' in df.columns and pd.notna(row['room_type']):
                r_type = str(row['room_type']).strip()
            elif "LAB" in raw_code.upper():
                r_type = "Laboratory"
            elif "AMPH" in raw_code.upper():
                r_type = "Amphitheatre"
            else:
                r_type = "Lecture Hall"

            # Upsert into MongoDB
            await db_manager.rooms.update_one(
                {"room_code": raw_code},
                {"$set": {
                    "room_code": raw_code,
                    "capacity": cap,
                    "room_type": r_type
                }},
                upsert=True
            )
            processed_count += 1

        return {
            "status": "success",
            "message": f"Successfully processed {processed_count} rooms from {file.filename}."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")


# --- DATA ENDPOINTS ---

@app.get("/api/dashboard-stats")
async def get_dashboard_stats():
    try:
        total_classes = await db_manager.timetables.count_documents({})
        total_rooms = await db_manager.rooms.count_documents({})
        unique_cohorts = await db_manager.timetables.distinct("cohort")
        
        return {
            "total_classes": total_classes,
            "total_rooms": total_rooms,
            "active_cohorts": len(unique_cohorts)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

DEFAULT_COHORT_SIZE = 50  # Estimated students per cohort

@app.get("/api/conflicts")
async def get_real_conflicts():
    try:
        # 1. Fetch registered rooms for metadata (capacity, type)
        rooms_cursor = db_manager.rooms.find({})
        rooms_list = await rooms_cursor.to_list(length=200)
        room_dict = {
            r["room_code"]: {
                "capacity": r.get("capacity", 0),
                "type": r.get("room_type", "Lecture Hall")
            }
            for r in rooms_list
        }

        # 2. Build map of rooms already in use for every (day, time) slot
        all_occupied_cursor = db_manager.timetables.aggregate([
            {"$group": {
                "_id": {
                    "day": {"$toUpper": {"$trim": {"input": "$schedule.day"}}},
                    "time": {"$toUpper": {"$trim": {"input": "$schedule.time_slot"}}}
                },
                "occupied_rooms": {"$addToSet": "$allocation.room_code"}
            }}
        ])
        occupied_matrix = {
            f"{item['_id']['day']}_{item['_id']['time']}": set(item.get("occupied_rooms", []))
            async for item in all_occupied_cursor
        }

        # 3. Find double bookings and combined sessions
        pipeline = [
            {"$match": {
                "allocation.room_code": {"$nin": ["ZOOM", "nan", "", "VIRTUAL", None]}
            }},
            {"$group": {
                "_id": {
                    "room": "$allocation.room_code",
                    "day": "$schedule.day",
                    "time": "$schedule.time_slot"
                },
                "count": {"$sum": 1},
                "units": {"$push": "$unit_name"},
                "unique_units": {"$addToSet": "$unit_name"},
                "cohorts": {"$push": "$cohort"},
                "room_types": {"$push": "$allocation.room_type"}
            }}
        ]

        cursor = db_manager.timetables.aggregate(pipeline)
        slots = await cursor.to_list(length=300)

        formatted_conflicts = []
        conflict_counter = 1

        for s in slots:
            room_code = s["_id"]["room"]
            day = s["_id"]["day"]
            time_slot = s["_id"]["time"]

            # Check conflict conditions
            is_double_booking = s["count"] > 1 and len(s.get("unique_units", [])) > 1
            current_room_meta = room_dict.get(room_code, {"capacity": 0, "type": "Lecture Hall"})
            room_capacity = current_room_meta["capacity"]
            estimated_students = len(s.get("cohorts", [])) * DEFAULT_COHORT_SIZE
            is_capacity_overrun = room_capacity > 0 and estimated_students > room_capacity

            # Only process if there is a scheduling clash or capacity overflow
            if is_double_booking or is_capacity_overrun:
                involved_classes = [
                    f"{c} ({u})" for c, u in zip(s.get("cohorts", []), s.get("units", []))
                ]
                course_display = " vs ".join(involved_classes)

                if is_double_booking:
                    issue_title = f"Double Booking on {day} at {time_slot}"
                    severity = "High"
                else:
                    issue_title = f"Capacity Overrun: ~{estimated_students} students in {room_code} (Max {room_capacity})"
                    severity = "Medium"

                # 4. Alternative Room Search (Adaptive & Normalized)
                clean_slot_key = f"{str(day).strip().upper()}_{str(time_slot).strip().upper()}"
                occupied_set = {
                    str(r).strip().upper() 
                    for r in occupied_matrix.get(clean_slot_key, set())
                }

                primary_room_type = s["room_types"][0] if s.get("room_types") else current_room_meta["type"]

                suggested_rooms = []
                for candidate_code, meta in room_dict.items():
                    norm_candidate = str(candidate_code).strip().upper()

                    # Rule A: Skip if already booked during this time
                    if norm_candidate in occupied_set:
                        continue
                    
                    # Rule B: Skip the conflicting room itself
                    if norm_candidate == str(room_code).strip().upper():
                        continue

                    # Rule C: Check capacity compatibility
                    cand_cap = meta.get("capacity", 0)
                    has_enough_seats = (cand_cap >= estimated_students) if cand_cap > 0 else True

                    # Rule D: Check facility type
                    cand_type = meta.get("type", "Lecture Hall")
                    is_type_match = (
                        cand_type.strip().lower() == str(primary_room_type).strip().lower() 
                        or cand_type == "Pending"
                    )

                    suggested_rooms.append({
                        "room_code": candidate_code,
                        "capacity": cand_cap,
                        "type": cand_type,
                        "exact_type_match": is_type_match,
                        "has_enough_seats": has_enough_seats
                    })

                # Sort priority:
                # 1. Matching type + sufficient seats
                # 2. Matching type
                # 3. Best capacity fit
                suggested_rooms.sort(
                    key=lambda r: (
                        not (r["exact_type_match"] and r["has_enough_seats"]),
                        not r["exact_type_match"],
                        -r["capacity"]
                    )
                )

                formatted_conflicts.append({
                    "id": f"CONF-{str(conflict_counter).zfill(3)}",
                    "room": room_code,
                    "day": day,
                    "time_slot": time_slot,
                    "course": course_display,
                    "issue": issue_title,
                    "severity": severity,
                    "units_involved": list(s.get("unique_units", [])),  # List of distinct units
                    "suggested_rooms": suggested_rooms[:5]
                })
                conflict_counter += 1

        return formatted_conflicts

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/rooms/sync")
async def sync_rooms_from_db():
    """Scans existing timetables in the database and extracts missing rooms."""
    try:
        # Get all unique rooms currently in the timetables collection
        unique_rooms = await db_manager.timetables.distinct("allocation.room_code")
        invalid_rooms = ["", "NAN", "NONE", "VIRTUAL", "ZOOM"]
        
        added_count = 0
        for code in unique_rooms:
            if not code:
                continue

            clean_code = str(code).strip()
            is_date = bool(re.search(r"\d{4}-\d{2}-\d{2}", clean_code))

            if clean_code.upper() not in invalid_rooms and not is_date:
                existing_room = await db_manager.rooms.find_one({"room_code": clean_code})

                # Only insert if it doesn't already exist in the rooms collection
                if not existing_room:
                    await db_manager.rooms.insert_one({
                        "room_code": clean_code,
                        "capacity": 0,
                        "room_type": "Pending"
                    })
                    added_count += 1

        return {"message": f"Sync complete! Automatically extracted {added_count} new rooms from existing timetables."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  


class ReassignRequest(BaseModel):
    day: str
    time_slot: str
    old_room: str
    new_room: str
    unit_to_move: str # The specific unit chosen to relocate

DEFAULT_COHORT_SIZE = 50  # Baseline student headcount per cohort

@app.get("/api/conflicts")
async def get_real_conflicts():
    try:
        # Pre-fetch registered rooms for quick metadata lookups (capacity, type)
        rooms_cursor = db_manager.rooms.find({})
        rooms_list = await rooms_cursor.to_list(length=200)
        room_dict = {
            r["room_code"]: {
                "capacity": r.get("capacity", 0),
                "type": r.get("room_type", "Lecture Hall")
            }
            for r in rooms_list
        }

        # 1. Aggregate classes grouped by room, day, and time slot
        pipeline = [
            {"$match": {
                "allocation.room_code": {"$nin": ["ZOOM", "nan", "", "VIRTUAL", None]}
            }},
            {"$group": {
                "_id": {
                    "room": "$allocation.room_code",
                    "day": "$schedule.day",
                    "time": "$schedule.time_slot"
                },
                "count": {"$sum": 1},
                "units": {"$push": "$unit_name"},
                "unit_codes": {"$push": "$unit_code"},
                "unique_units": {"$addToSet": "$unit_name"},
                "cohorts": {"$push": "$cohort"},
                "room_types": {"$push": "$allocation.room_type"}
            }}
        ]

        cursor = db_manager.timetables.aggregate(pipeline)
        slots = await cursor.to_list(length=300)

        # Pre-fetch all occupied rooms grouped by (day, time) for slot lookup
        all_occupied_cursor = db_manager.timetables.aggregate([
            {"$group": {
                "_id": {"day": "$schedule.day", "time": "$schedule.time_slot"},
                "occupied_rooms": {"$addToSet": "$allocation.room_code"}
            }}
        ])
        occupied_matrix = {
            f"{item['_id']['day']}_{item['_id']['time']}": set(item.get("occupied_rooms", []))
            async for item in all_occupied_cursor
        }

        formatted_conflicts = []
        conflict_counter = 1

        for s in slots:
            room_code = s["_id"]["room"]
            day = s["_id"]["day"]
            time_slot = s["_id"]["time"]

            # Cohort and unit pairings
            involved_classes = [
                f"{c} ({u})" for c, u in zip(s.get("cohorts", []), s.get("units", []))
            ]
            course_display = " vs ".join(involved_classes)

            # Metadata resolution
            current_room_meta = room_dict.get(room_code, {"capacity": 0, "type": "Lecture Hall"})
            room_capacity = current_room_meta["capacity"]
            primary_room_type = s["room_types"][0] if s["room_types"] else current_room_meta["type"]
            
            # Estimated headcount (number of cohorts * default size)
            estimated_students = len(s.get("cohorts", [])) * DEFAULT_COHORT_SIZE

            is_double_booking = s["count"] > 1 and len(s.get("unique_units", [])) > 1
            is_capacity_overrun = room_capacity > 0 and estimated_students > room_capacity

            # If either condition is met, flag as conflict
            if is_double_booking or is_capacity_overrun:
                # Determine issue type and severity
                if is_double_booking:
                    issue_title = f"Double Booking on {day} at {time_slot}"
                    severity = "High"
                else:
                    issue_title = f"Capacity Overrun: ~{estimated_students} students in {room_code} (Max {room_capacity})"
                    severity = "Medium"

                # Smart Reassignment Engine: Query free rooms for this slot
                occupied_set = occupied_matrix.get(f"{day}_{time_slot}", set())

                suggested_rooms = []
                for candidate_code, meta in room_dict.items():
                    # Rule 1: Room must not be occupied in this slot
                    if candidate_code in occupied_set:
                        continue
                    # Rule 2: Room must have defined capacity and meet student demand
                    if meta["capacity"] > 0 and meta["capacity"] < estimated_students:
                        continue
                    # Rule 3: Prefer matching room type
                    is_type_match = meta["type"].lower() == primary_room_type.lower()

                    suggested_rooms.append({
                        "room_code": candidate_code,
                        "capacity": meta["capacity"],
                        "type": meta["type"],
                        "exact_type_match": is_type_match
                    })

                # Sort suggestions: exact type matches first, then closest capacity fit
                suggested_rooms.sort(
                    key=lambda r: (not r["exact_type_match"], r["capacity"] if r["capacity"] > 0 else 9999)
                )

                formatted_conflicts.append({
                    "id": f"CONF-{str(conflict_counter).zfill(3)}",
                    "room": room_code,
                    "day": day,
                    "time_slot": time_slot,
                    "course": course_display,
                    "issue": issue_title,
                    "severity": severity,
                    "estimated_students": estimated_students,
                    "room_capacity": room_capacity,
                    "suggested_rooms": suggested_rooms[:5]  # Top 5 recommendations
                })
                conflict_counter += 1

        return formatted_conflicts

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/conflicts/reassign")
async def reassign_room(payload: ReassignRequest):
    """Moves ONLY the chosen unit from the clashing room to the alternative room."""
    try:
        filter_query = {
            "allocation.room_code": payload.old_room,
            "schedule.day": payload.day,
            "schedule.time_slot": payload.time_slot,
            "unit_name": payload.unit_to_move
        }
        
        update_query = {
            "$set": {
                "allocation.room_code": payload.new_room
            }
        }

        result = await db_manager.timetables.update_one(filter_query, update_query)
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Selected unit not found in this timeslot.")

        return {
            "status": "success",
            "message": f"Successfully relocated '{payload.unit_to_move}' to {payload.new_room}."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/export")
async def export_timetable():
    """Exports the resolved timetable matching the original nested format with Times New Roman."""
    try:
        # Fetch all records, sorted by Program, Cohort, Day, and Time
        cursor = db_manager.timetables.find({}).sort([
            ("program_sheet", 1),
            ("cohort", 1),
            ("schedule.day_no", 1), 
            ("schedule.time_slot", 1)
        ])
        records = await cursor.to_list(length=None)

        if not records:
            raise HTTPException(status_code=404, detail="No timetable data found to export.")

        # Group data: first by Program Sheet, then by Cohort
        grouped_data = defaultdict(lambda: defaultdict(list))
        for r in records:
            sheet = r.get("program_sheet", "Other")
            cohort = r.get("cohort", "UNKNOWN COHORT")
            
            grouped_data[sheet][cohort].append({
                "#": r.get("schedule", {}).get("day_no", ""),
                "DAY": str(r.get("schedule", {}).get("day", "")).upper(),
                "TIME": r.get("schedule", {}).get("time_slot", ""),
                "ROOM TYPE": str(r.get("allocation", {}).get("room_type", "")).upper(),
                "VENUE": r.get("allocation", {}).get("room_code", ""),
                "UNIT CODE": r.get("unit_code", ""),
                "UNIT NAME": r.get("unit_name", ""),
                "TRIMESTER": r.get("trimester", "")
            })

        output = io.BytesIO()
        
        # We use xlsxwriter directly to build the custom layout
        import xlsxwriter
        with xlsxwriter.Workbook(output) as workbook:
            
            # --- Define Times New Roman Formats ---
            base_font = 'Times New Roman'
            
            # Dark Blue Cohort Header (Matches the image)
            cohort_header_format = workbook.add_format({
                'bold': True,
                'font_name': base_font,
                'font_size': 14,
                'font_color': 'white',
                'bg_color': '#005eb8',  # KCA / standard dark blue
                'valign': 'vcenter',
                'border': 1
            })
            
            # Column Headers (#, DAY, TIME...)
            col_header_format = workbook.add_format({
                'bold': True,
                'font_name': base_font,
                'font_size': 11,
                'align': 'center',
                'valign': 'vcenter',
                'border': 1
            })
            
            # Standard Data Cells
            cell_format = workbook.add_format({
                'font_name': base_font,
                'font_size': 11,
                'valign': 'vcenter',
                'border': 1
            })
            
            # Centered Data Cells (for the # column)
            centered_cell_format = workbook.add_format({
                'font_name': base_font,
                'font_size': 11,
                'align': 'center',
                'valign': 'vcenter',
                'border': 1
            })

            columns = ["#", "DAY", "TIME", "ROOM TYPE", "VENUE", "UNIT CODE", "UNIT NAME", "TRIMESTER"]
            
            # --- Build the Sheets ---
            for sheet_name, cohorts_dict in grouped_data.items():
                # Clean sheet name for Excel rules
                clean_name = re.sub(r'[\\/*?:\[\]]', '', str(sheet_name))
                safe_sheet_name = clean_name[:31].strip()
                
                worksheet = workbook.add_worksheet(safe_sheet_name)
                
                row_idx = 0
                col_widths = {c: len(c) for c in columns}
                
                for cohort, rows in cohorts_dict.items():
                    # 1. Write the Cohort Title (Merged across all 8 columns)
                    worksheet.merge_range(row_idx, 0, row_idx, len(columns)-1, cohort, cohort_header_format)
                    row_idx += 1
                    
                    # 2. Write the Column Headers
                    for col_num, col_name in enumerate(columns):
                        worksheet.write(row_idx, col_num, col_name, col_header_format)
                    row_idx += 1
                    
                    # 3. Write the Data Rows
                    for row_data in rows:
                        for col_num, col_name in enumerate(columns):
                            val = str(row_data.get(col_name, ""))
                            
                            if col_name == "#":
                                worksheet.write(row_idx, col_num, val, centered_cell_format)
                            else:
                                worksheet.write(row_idx, col_num, val, cell_format)
                            
                            # Track max width for auto-sizing
                            if len(val) > col_widths[col_name]:
                                col_widths[col_name] = len(val)
                                
                        row_idx += 1
                        
                # 4. Set final column widths
                for col_num, col_name in enumerate(columns):
                    if col_name == "#":
                        worksheet.set_column(col_num, col_num, 5)  # Make # column narrow
                    else:
                        width = min(col_widths[col_name] + 2, 50)  # Add padding, cap at 50
                        worksheet.set_column(col_num, col_num, width)

        output.seek(0)

        headers = {
            'Content-Disposition': 'attachment; filename="Resolved_Master_Timetable.xlsx"'
        }
        return StreamingResponse(
            output, 
            headers=headers, 
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/stats")
async def get_dashboard_stats():
    """Fetches live high-level metrics and room utilization analytics for all rooms."""
    try:
        total_classes = await db_manager.timetables.count_documents({})
        cohorts = await db_manager.timetables.distinct("cohort")
        rooms = await db_manager.timetables.distinct("allocation.room_code")
        
        valid_cohorts = [c for c in cohorts if c and str(c).upper() != "UNKNOWN"]
        valid_rooms = [r for r in rooms if r and str(r).upper() not in ["ZOOM", "VIRTUAL", "NAN", "NONE"]]
        
        # Room Utilization Aggregation (Removed the $limit to get ALL rooms)
        pipeline = [
            {"$match": {"allocation.room_code": {"$nin": ["ZOOM", "VIRTUAL", "NAN", "NONE", "", None, "TBA"]}}},
            {"$group": {"_id": "$allocation.room_code", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        utilization_cursor = db_manager.timetables.aggregate(pipeline)
        all_rooms = await utilization_cursor.to_list(length=None) # Set length=None to fetch all
        
        utilization_data = [{"room": r["_id"], "classes": r["count"]} for r in all_rooms]
        
        # Calculate overall physical utilization rate
        total_possible_slots = len(valid_rooms) * 20 if len(valid_rooms) > 0 else 1
        physical_classes = await db_manager.timetables.count_documents({
            "allocation.room_code": {"$nin": ["ZOOM", "VIRTUAL", "NAN", "NONE", "", None, "TBA"]}
        })
        
        utilization_rate = min(round((physical_classes / total_possible_slots) * 100, 1), 100.0) if total_possible_slots > 0 else 0

        return {
            "total_classes": total_classes,
            "total_cohorts": len(valid_cohorts),
            "total_rooms": len(valid_rooms),
            "utilization_rate": utilization_rate,
            "top_utilized_rooms": utilization_data # Now contains all rooms
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




class VersionRequest(BaseModel):
    version_name: str

@app.post("/api/versions/snapshot")
async def create_version_snapshot(request: VersionRequest):
    """Saves the current master timetable as a versioned snapshot permanently."""
    try:
        if not request.version_name.strip():
            raise HTTPException(status_code=400, detail="Version name is required.")

        current_records = await db_manager.timetables.find({}).to_list(length=None)
        if not current_records:
            raise HTTPException(status_code=400, detail="The current timetable is empty. Nothing to save.")

        snapshot = {
            "version_name": request.version_name,
            "created_at": datetime.now().isoformat(),
            "total_classes": len(current_records),
            "data": current_records
        }

        # FIXED: Explicitly routes to the same database hosting your timetables
        await db_manager.timetables.database["timetable_history"].insert_one(snapshot)
        
        return {"message": f"Successfully saved version: {request.version_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/versions")
async def get_version_history():
    """Retrieves a list of all saved timetable versions."""
    try:
        # FIXED: Explicit database routing
        cursor = db_manager.timetables.database["timetable_history"].find({}, {"data": 0}).sort("created_at", -1)
        history = await cursor.to_list(length=None)
        
        formatted_history = []
        for item in history:
            formatted_history.append({
                "id": str(item["_id"]),
                "version_name": item["version_name"],
                "created_at": item["created_at"],
                "total_classes": item["total_classes"]
            })
            
        return formatted_history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/versions/{version_id}/restore")
async def restore_version(version_id: str):
    """Overwrites the active timetable with a previously saved version."""
    try:
        # FIXED: Explicit database routing
        snapshot = await db_manager.timetables.database["timetable_history"].find_one({"_id": ObjectId(version_id)})
        
        if not snapshot:
            raise HTTPException(status_code=404, detail="Saved version not found.")
        if not snapshot.get("data"):
            raise HTTPException(status_code=400, detail="This version contains no data to restore.")

        await db_manager.timetables.delete_many({})
        await db_manager.timetables.insert_many(snapshot["data"])
        
        return {"message": f"Successfully restored version: {snapshot['version_name']}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/versions/{version_id}/export")
async def export_version(version_id: str):
    """Generates the formatted Excel file for a specific archived version."""
    try:
        # FIXED: Explicit database routing
        snapshot = await db_manager.timetables.database["timetable_history"].find_one({"_id": ObjectId(version_id)})
        if not snapshot:
            raise HTTPException(status_code=404, detail="Version not found.")
            
        records = snapshot.get("data", [])
        if not records:
            raise HTTPException(status_code=400, detail="No data in this version.")

        grouped_data = defaultdict(lambda: defaultdict(list))
        for r in records:
            sheet = r.get("program_sheet", "Other")
            cohort = r.get("cohort", "UNKNOWN COHORT")
            
            grouped_data[sheet][cohort].append({
                "#": r.get("schedule", {}).get("day_no", ""),
                "DAY": str(r.get("schedule", {}).get("day", "")).upper(),
                "TIME": r.get("schedule", {}).get("time_slot", ""),
                "ROOM TYPE": str(r.get("allocation", {}).get("room_type", "")).upper(),
                "VENUE": r.get("allocation", {}).get("room_code", ""),
                "UNIT CODE": r.get("unit_code", ""),
                "UNIT NAME": r.get("unit_name", ""),
                "TRIMESTER": r.get("trimester", "")
            })

        output = io.BytesIO()
        with xlsxwriter.Workbook(output) as workbook:
            base_font = 'Times New Roman'
            cohort_header_format = workbook.add_format({
                'bold': True, 'font_name': base_font, 'font_size': 14,
                'font_color': 'white', 'bg_color': '#005eb8', 'valign': 'vcenter', 'border': 1
            })
            col_header_format = workbook.add_format({
                'bold': True, 'font_name': base_font, 'font_size': 11,
                'align': 'center', 'valign': 'vcenter', 'border': 1
            })
            cell_format = workbook.add_format({'font_name': base_font, 'font_size': 11, 'valign': 'vcenter', 'border': 1})
            centered_cell_format = workbook.add_format({'font_name': base_font, 'font_size': 11, 'align': 'center', 'valign': 'vcenter', 'border': 1})

            columns = ["#", "DAY", "TIME", "ROOM TYPE", "VENUE", "UNIT CODE", "UNIT NAME", "TRIMESTER"]
            
            for sheet_name, cohorts_dict in grouped_data.items():
                safe_sheet_name = re.sub(r'[\\/*?:\[\]]', '', str(sheet_name))[:31].strip()
                worksheet = workbook.add_worksheet(safe_sheet_name)
                
                row_idx = 0
                col_widths = {c: len(c) for c in columns}
                
                for cohort, rows in cohorts_dict.items():
                    worksheet.merge_range(row_idx, 0, row_idx, len(columns)-1, cohort, cohort_header_format)
                    row_idx += 1
                    
                    for col_num, col_name in enumerate(columns):
                        worksheet.write(row_idx, col_num, col_name, col_header_format)
                    row_idx += 1
                    
                    for row_data in rows:
                        for col_num, col_name in enumerate(columns):
                            val = str(row_data.get(col_name, ""))
                            fmt = centered_cell_format if col_name == "#" else cell_format
                            worksheet.write(row_idx, col_num, val, fmt)
                            if len(val) > col_widths[col_name]: col_widths[col_name] = len(val)
                        row_idx += 1
                        
                for col_num, col_name in enumerate(columns):
                    width = 5 if col_name == "#" else min(col_widths[col_name] + 2, 50)
                    worksheet.set_column(col_num, col_num, width)

        output.seek(0)
        file_name = f"Archived_{snapshot.get('version_name', 'Timetable')}.xlsx"
        headers = {'Content-Disposition': f'attachment; filename="{file_name}"'}
        
        return StreamingResponse(
            output, headers=headers, 
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/versions/{version_id}/stats")
async def get_version_stats(version_id: str):
    """Calculates utilization and metrics for a specific archived version."""
    try:
        # FIXED: Explicit database routing
        snapshot = await db_manager.timetables.database["timetable_history"].find_one({"_id": ObjectId(version_id)})
        if not snapshot:
            raise HTTPException(status_code=404, detail="Version not found.")
            
        records = snapshot.get("data", [])
        
        valid_cohorts = set()
        valid_rooms = set()
        room_counts = {}
        
        for r in records:
            cohort = r.get("cohort")
            if cohort and str(cohort).upper() != "UNKNOWN":
                valid_cohorts.add(cohort)
                
            room = r.get("allocation", {}).get("room_code")
            if room and str(room).upper() not in ["ZOOM", "VIRTUAL", "NAN", "NONE", "", None, "TBA"]:
                valid_rooms.add(room)
                room_counts[room] = room_counts.get(room, 0) + 1

        sorted_rooms = sorted([{"room": k, "classes": v} for k, v in room_counts.items()], key=lambda x: x["classes"], reverse=True)
        
        total_possible_slots = len(valid_rooms) * 20 if len(valid_rooms) > 0 else 1
        physical_classes = sum(room_counts.values())
        utilization_rate = min(round((physical_classes / total_possible_slots) * 100, 1), 100.0) if total_possible_slots > 0 else 0

        return {
            "version_name": snapshot.get("version_name"),
            "total_classes": len(records),
            "total_cohorts": len(valid_cohorts),
            "total_rooms": len(valid_rooms),
            "utilization_rate": utilization_rate,
            "top_utilized_rooms": sorted_rooms
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))