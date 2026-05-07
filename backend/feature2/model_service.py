import os
import numpy as np
import io
from PIL import Image

# Global Variables
_interpreter = None
_input_details = None
_output_details = None

# Plant disease classes (Reference from User)
CLASS_NAMES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Blueberry___healthy", "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_", "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy",
    "Grape___Black_rot", "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
    "Raspberry___healthy", "Soybean___healthy", "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch", "Strawberry___healthy",
    "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight", "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot", "Tomato___Spider_mites Two-spotted_spider_mite", "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy",
]

def load_model():
    global _interpreter, _input_details, _output_details
    # Look for the .tflite file in the current directory (backend/feature2/)
    model_path = os.path.join(os.path.dirname(__file__), "ensemble_model.tflite")
    
    if os.path.exists(model_path):
        try:
            import tensorflow as tf
            print(f"🔄 Loading TFLite model from {model_path}...")
            
            _interpreter = tf.lite.Interpreter(model_path=model_path)
            _interpreter.allocate_tensors()
            
            _input_details = _interpreter.get_input_details()
            _output_details = _interpreter.get_output_details()
            
            print("✅ TFLite model loaded successfully.")
        except ImportError:
            print("⚠️ TensorFlow not installed. Using Mock Model.")
        except Exception as e:
            print(f"❌ Failed to load model: {e}")
    else:
        print(f"⚠️ Model file not found at {model_path}. Using Mock Prediction.")

def format_class_name(class_name):
    """Format class name for display (e.g. 'Tomato___Bacterial_spot' -> 'Tomato - Bacterial Spot')"""
    return class_name.replace("___", " - ").replace("__", " ").replace("_", " ").title()

def preprocess_image(image_bytes):
    """Preprocess image bytes for TFLite model"""
    try:
        image = Image.open(io.BytesIO(image_bytes))
        if image.mode != "RGB":
            image = image.convert("RGB")
            
        # Resize to 224x224 (User Requirement)
        image = image.resize((224, 224))
        
        # Normalize to [0, 1] (User Requirement)
        img_array = np.array(image) / 255.0
        
        # Add batch dimension and ensure float32 (User Requirement)
        img_array = np.expand_dims(img_array, axis=0).astype(np.float32)
        
        return img_array
    except Exception as e:
        print(f"Error processing image: {e}")
        return None

import cv2
import base64

def analyze_image_quality(image_bytes):
    """
    Checks for Blur and Brightness using OpenCV.
    """
    try:
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"valid": False, "message": "Could not decode image"}

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 1. Blur Detection (Laplacian Variance)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        is_blur = laplacian_var < 100 # Threshold
        
        # 2. Brightness Check
        mean_brightness = np.mean(gray)
        is_dark = mean_brightness < 50 # Threshold
        
        messages = []
        if is_blur: messages.append("Image is blurry. Please hold steady.")
        if is_dark: messages.append("Image is too dark. Use flash or better lighting.")
        
        return {
            "valid": not (is_blur or is_dark),
            "is_blur": bool(is_blur),
            "is_dark": bool(is_dark),
            "message": " & ".join(messages) if messages else "Image Quality: Good",
            "score": laplacian_var
        }
    except Exception as e:
        print(f"Quality Check Error: {e}")
        return {"valid": True, "message": "Skipped quality check"}

def generate_stress_heatmap(image_bytes):
    """
    Generates a heatmap highlighting potential disease areas (non-green).
    Returns Base64 string of the processed image.
    """
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Convert to HSV
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Define Green Range (Healthy)
        lower_green = np.array([35, 40, 40])
        upper_green = np.array([85, 255, 255])
        
        # Mask: Find Green
        mask_green = cv2.inRange(hsv, lower_green, upper_green)
        
        # Invert Mask: Finding NON-Green (Disease/Stress)
        mask_stress = cv2.bitwise_not(mask_green)
        
        # Create Heatmap (Red/Yellow for stress)
        # We apply a color map to the stress mask
        heatmap_img = cv2.applyColorMap(mask_stress, cv2.COLORMAP_JET)
        
        # Overlay heatmap on original image (weighted)
        overlay = cv2.addWeighted(img, 0.7, heatmap_img, 0.3, 0)
        
        # Encode to Base64
        _, buffer = cv2.imencode('.jpg', overlay)
        img_str = base64.b64encode(buffer).decode('utf-8')
        
        return f"data:image/jpeg;base64,{img_str}"
        
    except Exception as e:
        print(f"Heatmap Error: {e}")
        return None

def predict_disease(image_bytes: bytes):
    """
    Predicts disease from image bytes using TFLite.
    Returns: {"class": str, "confidence": float, "quality": dict, "heatmap": str}
    """
    global _interpreter
    
    # Lazy load model on first use (saves memory on startup)
    if _interpreter is None:
        load_model()
    
    # 0. Run Quality Check & Heatmap
    quality = analyze_image_quality(image_bytes)
    heatmap = generate_stress_heatmap(image_bytes)
    
    # 1. Preprocess
    img_array = preprocess_image(image_bytes)
    if img_array is None:
        return {"error": "Invalid Image"}

    # 2. Run TFLite Prediction
    prediction_result = {}
    if _interpreter:
        try:
            # Set input tensor
            _interpreter.set_tensor(_input_details[0]["index"], img_array)
            _interpreter.invoke()
            
            # Get output
            output_data = _interpreter.get_tensor(_output_details[0]["index"])
            predictions = output_data[0]
            
            # Get Top Prediction
            top_idx = np.argmax(predictions)
            confidence = float(predictions[top_idx])
            class_name = CLASS_NAMES[top_idx] if top_idx < len(CLASS_NAMES) else "Unknown"
            
            prediction_result = {
                "class": format_class_name(class_name),
                "raw_class": class_name,
                "confidence": confidence,
                "is_mock": False
            }
        except Exception as e:
            print(f"Prediction Error: {e}")
    
    if not prediction_result:
        # 3. Mock Fallback (if model missing or error)
        import random
        random.seed(len(image_bytes)) 
        mock_class = random.choice(CLASS_NAMES)
        mock_conf = 0.85 + (random.random() * 0.14)
        
        prediction_result = {
            "class": format_class_name(mock_class),
            "raw_class": mock_class,
            "confidence": mock_conf,
            "is_mock": True,
            "note": "Place 'ensemble_model.tflite' in backend/feature2/ to use real AI."
        }
        
    # Attach extra metadata
    prediction_result["quality"] = quality
    prediction_result["heatmap"] = heatmap
    
    return prediction_result

# Model will be loaded lazily on first prediction (not on import)
# This saves memory during startup

