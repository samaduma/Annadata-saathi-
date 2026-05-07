"""
Crop Disease Analysis Multi-Agent System
=========================================

This module implements a multi-agent workflow for comprehensive crop disease analysis
using LangGraph for orchestration. The system consists of three specialized agents:

1. **Vision Agent**: Uses a CNN model to detect crop diseases from images
2. **Agronomist Agent**: Provides expert analysis and treatment recommendations  
3. **Government Agent**: Identifies relevant agricultural schemes and subsidies

Architecture:
    Image Input → Vision Node → [Agronomist Agent + Gov Agent (parallel)] → Final Report

Dependencies:
    - LangGraph: Workflow orchestration
    - LangChain + Gemini: LLM-powered agents
    - TensorFlow/Keras: CNN model for disease detection
"""

import os
import json
import logging
from typing import TypedDict, Optional, Dict, Any, List

from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

from .model_service import predict_disease

# =============================================================================
# CONFIGURATION & CONSTANTS
# =============================================================================

# Configure logging for debugging and monitoring
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# LLM Configuration
GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Confidence thresholds for disease detection
HIGH_CONFIDENCE_THRESHOLD = 0.85
MEDIUM_CONFIDENCE_THRESHOLD = 0.60


# =============================================================================
# STATE DEFINITION
# =============================================================================

class AgentState(TypedDict):
    """
    Defines the shared state schema for the multi-agent workflow.
    
    Attributes:
        image_bytes: Raw image data for disease analysis
        disease_class: Detected disease name from CNN model
        confidence: Prediction confidence score (0.0 - 1.0)
        analysis_report: Agronomist's explanation of the diagnosis
        treatment_plan: JSON string containing treatment recommendations
        subsidy_info: JSON string containing relevant government schemes
        is_mock: Flag indicating if mock/test data was used
    """
    image_bytes: bytes
    disease_class: str
    confidence: float
    analysis_report: str
    treatment_plan: str
    subsidy_info: str
    is_mock: bool

# Initialize Gemini Model
llm = ChatGoogleGenerativeAI(
    model=GEMINI_MODEL, 
    google_api_key=GEMINI_API_KEY,
    temperature=0.3
)

# =============================================================================
# AGENT NODES
# =============================================================================

def vision_node(state: AgentState) -> Dict[str, Any]:
    """
    Vision Node: Computer Vision Agent for Disease Detection
    
    This node acts as the first stage in the pipeline, using a pre-trained
    CNN model to analyze crop images and identify potential diseases.
    
    Args:
        state: Current workflow state containing image_bytes
        
    Returns:
        Dict containing disease class, confidence, and mock status
    """
    logger.info("🔬 Vision Agent: Analyzing crop image with CNN model...")
    
    try:
        result = predict_disease(state["image_bytes"])
        
        disease = result["class"]
        confidence = result["confidence"]
        
        # Log confidence level for monitoring
        if confidence >= HIGH_CONFIDENCE_THRESHOLD:
            logger.info(f"✅ High confidence detection: {disease} ({confidence:.1%})")
        elif confidence >= MEDIUM_CONFIDENCE_THRESHOLD:
            logger.warning(f"⚠️ Medium confidence detection: {disease} ({confidence:.1%})")
        else:
            logger.warning(f"❓ Low confidence detection: {disease} ({confidence:.1%})")
        
        return {
            "disease_class": disease,
            "confidence": confidence,
            "is_mock": result.get("is_mock", False)
        }
        
    except Exception as e:
        logger.error(f"❌ Vision Agent Error: {e}")
        return {
            "disease_class": "Unknown",
            "confidence": 0.0,
            "is_mock": True
        }

def agronomist_node(state: AgentState) -> Dict[str, Any]:
    """
    Agronomist Agent: Expert Disease Analysis and Treatment Recommendations
    
    This LLM-powered agent acts as a virtual agronomist, providing:
    - Visual symptom explanation for the detected disease
    - Severity assessment
    - Immediate action steps
    - Organic and chemical treatment options
    - Recovery timeline with forecasts
    
    The agent uses structured JSON output for consistent frontend parsing.
    
    Args:
        state: Current workflow state with disease_class and confidence
        
    Returns:
        Dict containing:
            - analysis_report: Brief explanation of the diagnosis
            - treatment_plan: JSON string with comprehensive treatment data
    """
    logger.info("🌾 Agronomist Agent: Generating treatment recommendations...")
    
    disease = state["disease_class"]
    confidence = state["confidence"]
    
    # Handle healthy crop case - no treatment needed
    if disease == "Healthy":
        logger.info("✅ Crop is healthy - no intervention required")
        healthy_response = {
            "explanation": "The crop shows no signs of disease or stress.",
            "severity": "None",
            "immediate_action": ["Continue regular irrigation and monitoring", "Ensure detailed soil testing"],
            "treatment": {"organic": [], "chemical": []},
            "timeline": [],
            "recovery_forecast": [100, 100, 100]
        }
        return {
            "analysis_report": "The crop appears healthy and vigorous.",
            "treatment_plan": json.dumps(healthy_response)
        }

    # Construct the expert agronomist prompt
    prompt = _build_agronomist_prompt(disease, confidence)
    
    try:
        # Invoke LLM for expert analysis
        logger.debug("Prompting Gemini for Agronomist analysis...")
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content.strip()
        logger.debug(f"Agronomist raw response: {content[:200]}...")

        # Parse and validate JSON response
        parsed_data = _extract_json_from_response(content)
        
        if parsed_data:
            return {
                "analysis_report": parsed_data.get("explanation", ""),
                "treatment_plan": json.dumps(parsed_data)
            }
        else:
            # Fallback: Return raw content if JSON parsing fails
            logger.warning("⚠️ JSON parsing failed, using raw response")
            return {
                "analysis_report": content,
                "treatment_plan": json.dumps({
                    "error": "Failed to parse AI response",
                    "explanation": content, # Pass content as explanation so user sees something
                    "raw": content
                })
            }
            
    except Exception as e:
        logger.error(f"❌ Agronomist Agent Error: {e}")
        return _get_fallback_treatment_plan(disease, str(e))


def _build_agronomist_prompt(disease: str, confidence: float) -> str:
    """Helper to build the Agronomist Agent prompt."""
    return f"""
    You are an expert Agronomist Agent. 
    The computer vision system has detected '{disease}' in a crop with {confidence*100:.1f}% confidence.
    
    Task: Provide a comprehensive crop health assessment.
    
    RETURN ONLY RAW JSON. DO NOT USE MARKDOWN.
    
    IMPORTANT GUIDELINES:
    1. "explanation": Provide a short 2-sentence explanation of WHY this disease is detected based on typical visual symptoms (e.g., "Identified by characteristic brown lesions with yellow halos on lower leaves.").
    2. "treatment": In 'organic' and 'chemical' lists, 'item' MUST be the exact commercial product/chemical name (e.g., "Captan 50 WP"). 'description' is the type (e.g., "Fungicide"). 'usage' is the mixing ratio/dosage (e.g., "2g per liter").
    3. "timeline": Create a 3-step action plan for the next 7 days.
    
    Structure:
    {{
        "explanation": "Visual reasoning for the diagnosis...",
        "severity": "High", 
        "immediate_action": ["Isolate affected plants", "Reduce humidity"],
        "treatment": {{
            "organic": [
                {{"item": "Neem Oil", "description": "Botanical Insecticide", "usage": "5ml per liter"}}
            ],
            "chemical": [
                 {{"item": "Copper Oxychloride", "description": "Contact Fungicide", "usage": "3g per liter"}}
            ]
        }},
        "timeline": [
            {{"day": "Day 1", "title": "Isolation", "task": "Remove infected leaves and burn them."}},
            {{"day": "Day 3", "title": "Treatment", "task": "Spray recommended fungicide in early morning."}}
        ],
        "recovery_forecast": [20, 50, 80]
    }}
    """

def _extract_json_from_response(content: str) -> Optional[Dict[str, Any]]:
    """Helper to robustly extract and parse JSON from LLM response."""
    try:
        # Find the first '{' and last '}' to handle potential markdown wrappers
        start_idx = content.find('{')
        end_idx = content.rfind('}')
        
        if start_idx != -1 and end_idx != -1:
            json_str = content[start_idx : end_idx + 1]
            return json.loads(json_str)
        return None
    except json.JSONDecodeError:
        return None

def _get_fallback_treatment_plan(disease: str, error_msg: str) -> Dict[str, Any]:
    """Returns a safe fallback plan when the LLM fails."""
    fallback_plan = {
        "explanation": f"AI Analysis Unavailable: {error_msg}. Please consult a local expert.",
        "severity": "Unknown",
        "immediate_action": ["Consult Local Agronomist", "Check Manual Guides"],
        "treatment": {
            "organic": [{"item": "Consult Expert", "description": "Manual Diagnosis Required", "usage": "-"}],
            "chemical": []
        },
        "timeline": [],
        "recovery_forecast": [0, 0, 0]
    }
    return {
        "analysis_report": f"Detected {disease}. AI offline.", 
        "treatment_plan": json.dumps(fallback_plan)
    }

def gov_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    Government Agent: Subsidies and Schemes Identifier
    
    Identifies relevant government agricultural schemes, insurance policies, 
    and subsidies applicable to the detected crop disease or condition.
    
    Args:
        state: Current workflow state with disease_class
        
    Returns:
        Dict containing 'subsidy_info' as a JSON string
    """
    logger.info("🏛️ Gov Agent: Identifying relevant schemes...")
    
    disease = state["disease_class"]
    
    if disease == "Healthy":
        logger.info("✅ Crop is healthy - checking for general productivity schemes")
        # Could potentially return general growth schemes, but for now returning none as per original logic
        return {"subsidy_info": "No compensation needed for healthy crops."}

    prompt = _build_gov_prompt(disease)
    
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content.strip()
        logger.debug(f"Gov Agent raw response: {content[:200]}...")

        parsed_data = _extract_json_from_response(content)
        
        if parsed_data:
            return {"subsidy_info": json.dumps(parsed_data)}
        else:
            logger.warning("⚠️ Gov Agent JSON parsing failed")
            return {"subsidy_info": content} # Fallback to raw text
             
    except Exception as e:
        logger.error(f"❌ Gov Agent Error: {e}")
        return {"subsidy_info": "Could not fetch subsidy info."}


def _build_gov_prompt(disease: str) -> str:
    """Helper to build the Government Agent prompt."""
    return f"""
    You are a Government Schemes Expert for Indian Agriculture.
    A farmer is facing crop loss/risk due to: '{disease}'.
    
    Task: 
    1. Identify relevant Indian government schemes (Central & State) that could help.
    2. Consider: PMFBY, Paramparagat Krishi Vikas Yojana (PKVY), Soil Health Card, PM-KISAN, etc.
    3. PRIORITIZE them based on 'Suitability' for this specific problem ("High" or "Medium").
    4. Provide the OFFICIAL website URL for each scheme.
    
    RETURN ONLY RAW JSON.
    
    Structure:
    {{
        "schemes": [
            {{
                "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
                "type": "Insurance",
                "details": "Covers yield losses due to non-preventable risks.",
                "benefits": "Premium subsidy + Claim settlement.",
                "priority": "High",
                "website_url": "https://pmfby.gov.in/"
            }}
        ]
    }}
    """

# =============================================================================
# WORKFLOW DEFINITION
# =============================================================================

# Define the main workflow graph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("vision", vision_node)
workflow.add_node("agronomist", agronomist_node)
workflow.add_node("gov", gov_agent_node)

# Set Entry Point
workflow.set_entry_point("vision")

# Add Edges (Parallel Execution after Vision)
# After Vision completes, both Agronomist and Gov agents run in parallel
workflow.add_edge("vision", "agronomist")
workflow.add_edge("vision", "gov")

# Both parallel branches end the workflow 
# (LangGraph handles state merging automatically)
workflow.add_edge("agronomist", END)
workflow.add_edge("gov", END)

# Compile the application
crop_agent_app = workflow.compile()
logger.info("✅ Crop Disease Agent Workflow Compiled Successfully")


# --- Analysis Only Graph (For manual text-based queries or skipped vision) ---

def start_node(state: AgentState):
    """Pass-through node to broadcast state to parallel agents."""
    return state

analysis_workflow = StateGraph(AgentState)
analysis_workflow.add_node("start", start_node)
analysis_workflow.add_node("agronomist", agronomist_node)
analysis_workflow.add_node("gov", gov_agent_node)

analysis_workflow.set_entry_point("start")
analysis_workflow.add_edge("start", "agronomist")
analysis_workflow.add_edge("start", "gov")
analysis_workflow.add_edge("agronomist", END)
analysis_workflow.add_edge("gov", END)

analysis_agent_app = analysis_workflow.compile()
logger.info("✅ Analysis-Only Workflow Compiled Successfully")
