"""
Face Database Status Checker
Run this to see who's registered in the face auth system.

Usage:
    cd backend/face_auth
    python check_faces.py
"""

import pickle
import os
import numpy as np

DATA_DIR = "data"
NAMES_FILE = os.path.join(DATA_DIR, "names.pkl")
FACES_FILE = os.path.join(DATA_DIR, "faces_data.pkl")

def main():
    print("\n" + "="*50)
    print("       FACE DATABASE STATUS")
    print("="*50)
    
    if not os.path.exists(DATA_DIR):
        print("❌ Data directory does not exist!")
        print(f"   Expected: {os.path.abspath(DATA_DIR)}")
        return
    
    if not os.path.exists(NAMES_FILE):
        print("❌ No names.pkl found - database is empty")
        return
    
    if not os.path.exists(FACES_FILE):
        print("❌ No faces_data.pkl found - database is empty")
        return
    
    # Load data
    with open(NAMES_FILE, "rb") as f:
        names = pickle.load(f)
    
    with open(FACES_FILE, "rb") as f:
        faces = pickle.load(f)
    
    # Calculate stats
    unique_users = list(set(names))
    user_counts = {user: names.count(user) for user in unique_users}
    
    print(f"\n📊 Database Statistics:")
    print(f"   Total samples: {len(names)}")
    print(f"   Unique users: {len(unique_users)}")
    print(f"   Face vector shape: {faces.shape}")
    
    print(f"\n👥 Registered Users:")
    for user, count in sorted(user_counts.items()):
        print(f"   • {user}: {count} samples")
    
    print("\n" + "="*50)
    
    # Suggest if more samples needed
    for user, count in user_counts.items():
        if count < 20:
            print(f"⚠️  {user} has only {count} samples. Consider adding more for better accuracy.")
    
    print()

if __name__ == "__main__":
    main()
