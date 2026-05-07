"""
Face Database Reset Script
Run this to clear all registered faces and start fresh.

Usage:
    cd backend/face_auth
    python reset_faces.py
"""

import os
import shutil

DATA_DIR = "data"

def main():
    print("\n" + "="*50)
    print("       FACE DATABASE RESET")
    print("="*50)
    
    if not os.path.exists(DATA_DIR):
        print("❌ Data directory does not exist - nothing to reset.")
        return
    
    files = os.listdir(DATA_DIR)
    pkl_files = [f for f in files if f.endswith('.pkl')]
    
    if not pkl_files:
        print("❌ No .pkl files found - database is already empty.")
        return
    
    print(f"\n⚠️  This will delete the following files:")
    for f in pkl_files:
        filepath = os.path.join(DATA_DIR, f)
        size = os.path.getsize(filepath)
        print(f"   • {f} ({size} bytes)")
    
    confirm = input("\n🔴 Are you sure you want to delete? (yes/no): ").strip().lower()
    
    if confirm == "yes":
        for f in pkl_files:
            os.remove(os.path.join(DATA_DIR, f))
        print("\n✅ Face database has been reset!")
        print("   Run train_face.py to register new faces.")
    else:
        print("\n❌ Reset cancelled.")
    
    print("="*50 + "\n")

if __name__ == "__main__":
    main()
