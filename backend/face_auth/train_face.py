"""
Face Registration Training Script
Run this script to capture and train face data for authentication.

Usage:
    cd backend/face_auth
    python train_face.py

Press 'o' to stop capturing and save the data.
"""

import cv2
import pickle
import numpy as np
import os

# Configuration
DATA_DIR = "data"  # Relative to face_auth directory
NUM_SAMPLES = 50   # Number of face samples to capture
CAPTURE_INTERVAL = 5  # Capture every Nth frame for variety

def main():
    # Create data directory if it doesn't exist
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    # Initialize video capture
    video = cv2.VideoCapture(0)
    if not video.isOpened():
        print("❌ Error: Could not open camera. Please check your webcam connection.")
        return
    
    # Load face detector
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    if face_cascade.empty():
        print("❌ Error: Could not load Haar cascade classifier.")
        return
    
    # Get user name
    print("\n" + "="*50)
    print("       FACE REGISTRATION SYSTEM")
    print("="*50)
    name = input("\n👤 Enter your name: ").strip()
    if not name:
        print("❌ Name cannot be empty!")
        return
    
    print(f"\n📸 Starting face capture for: {name}")
    print(f"   Capturing {NUM_SAMPLES} samples...")
    print("   Press 'o' to stop early or wait for auto-complete.")
    print("-"*50)
    
    faces_data = []
    frame_count = 0
    
    while True:
        ret, frame = video.read()
        if not ret:
            print("❌ Error reading from camera")
            break
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)
        
        for (x, y, w, h) in faces:
            # Crop (COLOR) and resize face
            crop_img = frame[y:y+h, x:x+w, :]
            resized_img = cv2.resize(crop_img, (50, 50))
            
            # Capture every Nth frame for variety
            if len(faces_data) < NUM_SAMPLES and frame_count % CAPTURE_INTERVAL == 0:
                # Store raw color data (flattened)
                flattened_face = resized_img.flatten().reshape(1, -1)
                faces_data.append(flattened_face)
            
            frame_count += 1
            
            # Draw rectangle and progress
            progress = len(faces_data)
            color = (0, 255, 0) if progress >= NUM_SAMPLES else (0, 165, 255)
            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
            cv2.putText(frame, f"{progress}/{NUM_SAMPLES}", (x, y-10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        
        # Display status
        status_text = f"Capturing: {len(faces_data)}/{NUM_SAMPLES} | Press 'o' to finish"
        cv2.putText(frame, status_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        cv2.putText(frame, f"User: {name}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        
        cv2.imshow("Face Registration - Press 'o' to save", frame)
        
        # Check for exit or completion
        key = cv2.waitKey(1) & 0xFF
        if key == ord('o') or len(faces_data) >= NUM_SAMPLES:
            break
    
    video.release()
    cv2.destroyAllWindows()
    
    # Save the data
    if len(faces_data) < 5:
        print(f"\n❌ Only captured {len(faces_data)} samples. Need at least 5 for reliable recognition.")
        return
    
    print(f"\n✅ Captured {len(faces_data)} face samples!")
    print("💾 Saving data...")
    
    # Convert to numpy array and flatten
    faces_data = np.asarray(faces_data)
    faces_data = faces_data.reshape(faces_data.shape[0], -1)
    
    # File paths
    names_file = os.path.join(DATA_DIR, "names.pkl")
    faces_file = os.path.join(DATA_DIR, "faces_data.pkl")
    
    # Load existing data or create new
    if os.path.exists(names_file):
        with open(names_file, "rb") as f:
            existing_names = pickle.load(f)
        names = existing_names + [name] * len(faces_data)
    else:
        names = [name] * len(faces_data)
    
    if os.path.exists(faces_file):
        with open(faces_file, "rb") as f:
            existing_faces = pickle.load(f)
        faces = np.append(existing_faces, faces_data, axis=0)
    else:
        faces = faces_data
    
    # Save
    with open(names_file, "wb") as f:
        pickle.dump(names, f)
    with open(faces_file, "wb") as f:
        pickle.dump(faces, f)
    
    # Show summary
    unique_users = list(set(names))
    print("\n" + "="*50)
    print("       REGISTRATION COMPLETE")
    print("="*50)
    print(f"✅ User '{name}' registered successfully!")
    print(f"📊 Total samples in database: {len(names)}")
    print(f"👥 Registered users: {', '.join(unique_users)}")
    print("="*50)

if __name__ == "__main__":
    main()
