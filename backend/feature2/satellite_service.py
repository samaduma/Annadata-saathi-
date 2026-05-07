import os
import time
import requests
import statistics
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from oauthlib.oauth2 import BackendApplicationClient
from requests_oauthlib import OAuth2Session

# Sentinel Hub Config
CLIENT_ID = os.environ.get("SENTINEL_CLIENT_ID")
CLIENT_SECRET = os.environ.get("SENTINEL_CLIENT_SECRET")
TOKEN_URL = "https://services.sentinel-hub.com/oauth/token"
PROCESS_URL = "https://services.sentinel-hub.com/api/v1/process"

class SatelliteService:
    _token = None
    _token_expires_at = 0

    @classmethod
    def _get_token(cls):
        """Standard OAuth2 Token Retrieval for Client Credentials"""
        if cls._token and time.time() < cls._token_expires_at:
            return cls._token
            
        print("🔄 Authenticating with Sentinel Hub...")
        client = BackendApplicationClient(client_id=CLIENT_ID)
        oauth = OAuth2Session(client=client)
        
        try:
            token = oauth.fetch_token(
                token_url=TOKEN_URL,
                client_id=CLIENT_ID,
                client_secret=CLIENT_SECRET
            )
            cls._token = token["access_token"]
            cls._token_expires_at = time.time() + token["expires_in"] - 60 # Buffer
            print("✅ Sentinel Hub Authenticated")
            return cls._token
        except Exception as e:
            print(f"❌ Auth Failed: {e}")
            raise Exception("Failed to authenticate with Satellite Provider.")

    @staticmethod
    def get_ndvi_data(lat: float, lng: float, days_back=30, custom_bbox: List[float] = None) -> Dict:
        """
        Fetches REAL Sentinel-2 Data via Process API (10x10 Grid).
        """
        import io
        import numpy as np
        from PIL import Image

        token = SatelliteService._get_token()
        
        # 1. Bounding Box
        if custom_bbox:
            bbox = custom_bbox
        else:
            delta = 0.01 # wider view
            bbox = [lng - delta, lat - delta, lng + delta, lat + delta]
        
        # 2. Time Range
        now = datetime.now()
        start = now - timedelta(days=days_back)
        
        # 3. Evalscript: Return encoded NDVI in PNG (0-255)
        # NDVI (-1 to 1) -> mapped to 0-255
        evalscript = """
        //VERSION=3
        function setup() {
          return {
            input: ["B04", "B08", "dataMask"],
            output: { bands: 1, sampleType: "UINT8" }
          };
        }
        
        function evaluatePixel(sample) {
          if (sample.dataMask == 0) return [0]; // No Data
          
          let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
          
          // Map -1 to 1 -> 1 to 255 (0 reserved for nodata)
          // formula: (ndvi + 1) * 127 + 1
          let val = (ndvi + 1) * 127 + 1;
          return [val];
        }
        """

        # 4. Request Payload
        payload = {
            "input": {
                "bounds": {
                    "bbox": bbox,
                    "properties": {"crs": "http://www.opengis.net/def/crs/EPSG/0/4326"}
                },
                "data": [{
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "timeRange": {"from": start.isoformat() + "Z", "to": now.isoformat() + "Z"},
                        "maxCloudCoverage": 20
                    }
                }]
            },
            "output": {
                "width": 10,
                "height": 10,
                "responses": [
                    {"identifier": "default", "format": {"type": "image/png"}}
                ]
            },
            "evalscript": evalscript
        }
        
        print("🛰️ Calling Sentinel Hub Process API (Real Image)...")
        response = requests.post(
            PROCESS_URL, 
            headers={"Authorization": f"Bearer {token}"}, 
            json=payload
        )
        
        if response.status_code != 200:
            raise Exception(f"Sentinel API Error: {response.text}")
            
        # 5. Parse Image
        try:
            image_data = response.content
            image = Image.open(io.BytesIO(image_data))
            arr = np.array(image) # 10x10 array
            
            heatmap = []
            values = []
            
            width = 10
            height = 10
            
            # BBox dims
            min_lng, min_lat, max_lng, max_lat = bbox
            lat_step = (max_lat - min_lat) / height
            lng_step = (max_lng - min_lng) / width
            
            # Iterate grid
            for y in range(height):
                for x in range(width):
                    # Image origin is top-left (max_lat, min_lng)
                    # Array y goes down, lat goes down.
                    pixel_val = arr[y, x]
                    
                    if pixel_val == 0: continue # No Data
                    
                    # Decode NDVI
                    # val = (ndvi + 1) * 127 + 1
                    # ndvi = ((val - 1) / 127) - 1
                    ndvi_real = ((pixel_val - 1) / 127.0) - 1.0
                    ndvi_real = max(-1.0, min(1.0, ndvi_real))
                    
                    values.append(ndvi_real)
                    
                    # Coord for center of pixel
                    pt_lat = max_lat - (y * lat_step) - (lat_step/2)
                    pt_lng = min_lng + (x * lng_step) + (lng_step/2)
                    
                    heatmap.append({
                        "lat": pt_lat,
                        "lng": pt_lng,
                        "value": ndvi_real,
                        "intensity": (ndvi_real + 1) / 2 # Normalize 0-1 for heatmap color
                    })
            
            if not values:
                raise Exception("No clear satellite data found (Clouds/NoData).")
                
            avg_ndvi = float(np.mean(values))
            
            health_status = "Excellent Health"
            if avg_ndvi < 0.3: health_status = "Critical (Crop Loss Risk)"
            elif avg_ndvi < 0.5: health_status = "Moderate Stress"
            
            return {
                "center": {"lat": lat, "lng": lng},
                "layer": "NDVI-Real",
                "overall_health": health_status,
                "average_ndvi": round(avg_ndvi, 2),
                "heatmap_points": heatmap,
                "analysis": f"Real-time Analysis of {len(values)} satellite points.",
                "source": "Sentinel-2 L2A (Real-time)"
            }

        except Exception as e:
            print(f"Processing Error: {e}")
            raise e # Propagate error, DO NOT SIMULATE

    @staticmethod
    def simulate_fallback(lat, lng, reason="API Error"):
        # Explicitly disabled by user request
        raise Exception(f"Real-time data failed: {reason}. Simulation disabled.")

