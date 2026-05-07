
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from .face_service import register_face_opencv, authenticate_face_opencv
import shutil
import os
import uuid

router = APIRouter()

@router.post("/register")
async def register_user_face(name: str = Form(...), file: UploadFile = File(...)):
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")

    # Save temp file
    temp_filename = f"temp_reg_{uuid.uuid4()}.jpg"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        success = register_face_opencv(temp_filename, name)
        if success:
            return {"success": True, "message": f"User {name} registered successfully via KNN!"}
        else:
            raise HTTPException(status_code=400, detail="No face detected. Please try again with better lighting.")
            
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

@router.post("/login")
async def login_user_face(file: UploadFile = File(...)):
    temp_filename = f"temp_login_{uuid.uuid4()}.jpg"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        identified_name = authenticate_face_opencv(temp_filename)
        
        if identified_name:
            return {
                "success": True, 
                "message": f"Welcome back, {identified_name}!", 
                "user": {"name": identified_name, "id": "knn-user"}
            }
        else:
            raise HTTPException(status_code=401, detail="Face not recognized. Please register first or try with better lighting.")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Auth error: {e}")
        # Return more helpful error messages
        error_msg = str(e)
        if "n_neighbors" in error_msg or "n_samples" in error_msg:
            raise HTTPException(status_code=400, detail="Not enough registered faces. Please register more users first.")
        raise HTTPException(status_code=500, detail=f"Face Auth Error: {error_msg}")
    finally:
         if os.path.exists(temp_filename):
            os.remove(temp_filename)

