from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from .agents import crop_agent_app
from .satellite_service import SatelliteService
import traceback

router = APIRouter(prefix="/api/feature2", tags=["crop-health"])

from .agents import crop_agent_app, analysis_agent_app # Import new graph
from .model_service import predict_disease # Import direct model call

class AnalysisRequest(BaseModel):
    disease: str
    confidence: float

from typing import List, Optional

class SatelliteRequest(BaseModel):
    lat: float
    lng: float
    bbox: Optional[List[float]] = None

@router.post("/predict")
async def predict_only(file: UploadFile = File(...)):
    """
    Step 1: Fast CNN Prediction Only.
    """
    try:
        content = await file.read()
        result = predict_disease(content)
        return result
    except Exception as e:
        print(f"❌ Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze")
async def analyze_results(request: AnalysisRequest):
    """
    Step 2: Slow Agentic Analysis.
    """
    try:
        # Invoke the Analysis Workflow
        result = analysis_agent_app.invoke({
            "disease_class": request.disease,
            "confidence": request.confidence
        })
        
        return {
            "analysis": result.get("analysis_report", "Analysis failed"),
            "treatment": result.get("treatment_plan", "No plan generated"),
            "subsidy": result.get("subsidy_info", "No info")
        }
    except Exception as e:
        print(f"❌ Analysis Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from .compensation_agent import CompensationAgent
from .agronomist_chat import AgronomistChatAgent

class ChatRequest(BaseModel):
    message: str
    state: dict
    context: Optional[dict] = None

@router.post("/agent/chat")
async def chat_agent(request: ChatRequest):
    """
    Interacts with Compensation Agent or Agronomist Agent.
    """
    try:
        # If context is provided, it's the Agronomist Chat
        if request.context:
             result = AgronomistChatAgent.chat(request.message, request.state.get("history", []), request.context)
             return result
        
        result = CompensationAgent.process_message(request.state, request.message)
        return result
    except Exception as e:
         print(f"❌ Agent Error: {e}")
         raise HTTPException(status_code=500, detail=str(e))

@router.post("/ndvi")
async def get_satellite_ndvi(request: SatelliteRequest):
    """
    Fetches NDVI Satellite Data (Real Sentinel-2).
    """
    try:
        # Default to checking last 30 days
        data = SatelliteService.get_ndvi_data(request.lat, request.lng, days_back=30, custom_bbox=request.bbox)
        return data
    except Exception as e:
        print(f"❌ NDVI Error: {e}")
        raise HTTPException(status_code=500, detail=f"Satellite Data Unavailable: {str(e)}")

# --- PDF GENERATION ---
from fastapi.responses import Response
from .pdf_service import PDFService

class ClaimFormRequest(BaseModel):
    farmer_name: str
    guardian_name: str
    mobile: str
    aadhaar: str
    address: str
    account_holder: str
    bank_name: str
    branch_name: str
    account_number: str
    ifsc: str
    survey_no: str
    village: str
    crop_name: str
    sowing_date: str
    area_insured: str
    loss_date: str
    loss_cause: str
    loss_percentage: str

@router.post("/claim/generate-pdf")
async def generate_claim_pdf(request: ClaimFormRequest):
    try:
        pdf_bytes = PDFService.generate_claim_form(request.dict())
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=Claim_Form_{request.aadhaar[-4:]}.pdf"
            }
        )
    except Exception as e:
        print(f"❌ PDF Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
