
import cv2
import pickle
import numpy as np
import os
from sklearn.neighbors import KNeighborsClassifier

# Constants
MODULE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(MODULE_DIR, "data")
FACES_FILE = os.path.join(DATA_DIR, "faces_data.pkl")
NAMES_FILE = os.path.join(DATA_DIR, "names.pkl")

# DISTANCE CHECK
# User reported "simple code" worked better.
# Switching back to COLOR (7500 dims) and RAW values (0-255).
# L2 Distance in this space:
# If avg pixel diff is 20: sqrt(7500 * 20^2) = ~1732
# If avg pixel diff is 30: sqrt(7500 * 30^2) = ~2598
# If avg pixel diff is 40: sqrt(7500 * 1600) = ~3000
# We will set a threshold around 3000 to filter blatant mismatches while allowing some lighting variance.
DISTANCE_THRESHOLD = 3000.0 

# Ensure data dir exists
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Load Haar Cascade
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def load_data():
    faces = None
    names = None
    
    if os.path.exists(FACES_FILE):
        with open(FACES_FILE, 'rb') as f:
            faces = pickle.load(f)
            
    if os.path.exists(NAMES_FILE):
        with open(NAMES_FILE, 'rb') as f:
            names = pickle.load(f)
            
    return faces, names

def save_data(faces, names):
    with open(FACES_FILE, 'wb') as f:
        pickle.dump(faces, f)
    with open(NAMES_FILE, 'wb') as f:
        pickle.dump(names, f)

def get_knn_model():
    """
    Trains and returns a KNN model based on current data.
    """
    faces, names = load_data()
    
    if faces is None or names is None:
        return None
    
    n_samples = len(names)
    if n_samples == 0:
        return None
        
    n_neighbors = min(5, n_samples)
    if n_neighbors < 1:
        return None
        
    knn = KNeighborsClassifier(n_neighbors=n_neighbors)
    knn.fit(faces, names)
    return knn

def process_image(image_path):
    """
    Reads image, detects face, crops COLOR image, resizes to 50x50, flattens.
    Returns the flattened face vector (1, 7500).
    """
    frame = cv2.imread(image_path)
    if frame is None:
        return None
        
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    
    if len(faces) == 0:
        return None
    
    # Take the largest face
    (x, y, w, h) = max(faces, key=lambda f: f[2] * f[3])
    
    # Crop COLOR image (as requested by user)
    crop_img = frame[y:y+h, x:x+w, :]
    resized_img = cv2.resize(crop_img, (50, 50))
    
    # Flatten (No normalization, raw 0-255)
    flattened = resized_img.flatten().reshape(1, -1)
    
    return flattened

def register_face_opencv(image_path, name):
    face_vector = process_image(image_path)
    
    if face_vector is None:
        return False
        
    faces, names = load_data()
    
    if faces is None:
        faces = face_vector
        names = [name]
    else:
        # Check dimensions
        if faces.shape[1] != face_vector.shape[1]:
            print(f"Dimension mismatch: DB={faces.shape[1]}, New={face_vector.shape[1]}. Resetting.")
            faces = face_vector
            names = [name]
        else:
            faces = np.append(faces, face_vector, axis=0)
            names = names + [name]
        
    save_data(faces, names)
    return True

def authenticate_face_opencv(image_path):
    face_vector = process_image(image_path)
    
    if face_vector is None:
        print("Auth: No face detected.")
        return None
        
    knn = get_knn_model()
    if knn is None:
        print("Auth: No model.")
        return None
        
    # Check dimensions
    try:
        if knn._fit_X.shape[1] != face_vector.shape[1]:
            return None
    except:
        pass

    # Get neighbors and distances
    distances, indices = knn.kneighbors(face_vector, n_neighbors=1)
    
    min_distance = distances[0][0]
    identified_idx = indices[0][0]
    
    faces_train, names_train = load_data()
    candidate_name = names_train[identified_idx]
    
    print(f"Auth Check: Closest match '{candidate_name}' with distance {min_distance:.4f}")
    
    if min_distance > DISTANCE_THRESHOLD:
        print(f"Auth: Rejected. Distance {min_distance:.4f} > Threshold {DISTANCE_THRESHOLD}")
        return None
        
    return candidate_name
