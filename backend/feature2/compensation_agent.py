"""
Compensation Agent Service
==========================

This module implements the logic for the Compensation Agent, which guides farmers through
the process of assessing crop loss and verifying eligibility for insurance schemes like PMFBY.

It uses a state machine combined with LLM capabilities to:
1. Interpret satellite NDVI data to assess crop stress.
2. Interact with the farmer to confirm local conditions.
3. Determine eligibility for crop insurance.
4. Guide the farmer through the documentation and application process.
"""

import os
import random
import logging
from typing import Dict, List, Any, Optional

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

# =============================================================================
# CONFIGURATION
# =============================================================================

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Context for the Agent (Expanded and Structured)
PMFBY_CONTEXT = """
You are an AI Agronomist and expert on the Pradhan Mantri Fasal Bima Yojana (PMFBY) Scheme.
Your role is to assist farmers in understanding their insurance eligibility and claim process.

### OFFICIAL PMFBY CHECKLIST ###

1. **Essential Documentation:**
   - Duly Completed Claim Form.
   - Aadhaar Card (Mandatory).
   - Proof of Land Records/Ownership (RoR, LPC).
   - Bank Account Details (Passbook/Cancelled Cheque for DBT).
   - Photo ID (Voter ID, PAN, etc.).
   - Sowing Declaration/Certificate.

2. **Proof of Crop Loss:**
   - Evidence of Damage (Geotagged Photos/Videos preferred).
   - Intimation Details (Survey No, Acreage affected).
   - Local Authority Verification (Sarpanch/Revenue Officer report).
   - Policy/Proposal Number.

3. **Important Deadlines:**
   - **Intimation Timeline:** Loss must be reported within **72 hours** of the event.
   - **Crop Cutting Experiments (CCE):** Full cooperation required for yield estimation.

### INSTRUCTIONS ###
- If the user asks about the claim process, documents, or eligibility, provide a HELPFUL, CONCISE, and STEP-BY-STEP answer.
- If the user seems to be following the compensation flow (confirming cause, submitting), keep answers SHORT and ACTION-ORIENTED.
- Maintain a supportive and professional tone.
"""

# =============================================================================
# COMPENSATION AGENT CLASS
# =============================================================================

class CompensationAgent:
    """
    Handles the interaction flow for Crop Loss Compensation.
    
    Uses a hybrid approach:
    - Rule-based state machine for the main application flow.
    - Gemini LLM for dynamic Q&A and natural language interpretation.
    """
    
    @staticmethod
    def process_message(state: Dict[str, Any], user_input: str) -> Dict[str, Any]:
        """
        Process the user's message based on the current agent state and satellite data.

        Args:
            state: Dictionary containing current flow state:
                   - step: Current step ID (e.g., "START", "CONFIRM_CAUSE")
                   - history: List of prior messages
                   - ndvi: Float value representing crop health index
            user_input: The text message from the user.

        Returns:
            Updated state dictionary with new step, response, and history.
        """
        # Extract state with defaults
        step = state.get("step", "START")
        history = state.get("history", [])
        ndvi_val = state.get("ndvi", 0.0)
        
        logger.info(f"🔄 Processing Step: {step} | NDVI: {ndvi_val} | Input: {user_input[:50]}")
        
        response_text = ""
        next_step = step
        
        # --- LLM INITIALIZATION AND HELPER ---
        try:
            llm = ChatGoogleGenerativeAI(
                model=GEMINI_MODEL, 
                google_api_key=GEMINI_API_KEY,
                temperature=0.3 # Lower temperature for more consistent process guidance
            )
        except Exception as e:
            logger.error(f"Failed to initialize LLM: {e}")
            return _authentication_error_response(state)
        
        def ask_gemini(query: str, custom_prompt: str = None) -> str:
            """Helper to invoke Gemini with context."""
            try:
                sys_msg = SystemMessage(content=custom_prompt if custom_prompt else PMFBY_CONTEXT)
                msg_list = [sys_msg, HumanMessage(content=f"User Query: {query}")]
                res = llm.invoke(msg_list)
                return res.content
            except Exception as e:
                logger.error(f"LLM Invocation Error: {e}")
                return "I'm having trouble accessing the scheme database right now. Please try again later."

        # --- STATE MACHINE LOGIC ---
        
        # 0. Check for General Questions (Interrupt Logic)
        # If the user asks a specific lookup question, prioritize answering it over the flow
        keyword_triggers = ["?", "document", "scheme", "deadline", "eligibility", "form"]
        is_query = any(k in user_input.lower() for k in keyword_triggers)
        
        # Only trigger interrupt if it's NOT a simple Yes/No during a confirmation step
        if is_query and len(user_input.split()) > 2 and step not in ["START"]: 
             # Heuristic: Short inputs like "Yes", "No", "Submit" are likely flow responses
            logger.info("ℹ️ Detected interrupt query. Answering via LLM.")
            response_text = ask_gemini(user_input)
            # We don't update 'next_step' so the user stays in the current flow context
            return _update_state(state, next_step, response_text, user_input)

        # 1. Normal Flow Logic
        
        try:
            if step == "START":
                # Initial Analysis Triggered automatically or by first user contact
                
                # Logic: Check NDVI Ranges
                prompt = _build_ndvi_analysis_prompt(ndvi_val)
                response_text = ask_gemini(prompt, custom_prompt=prompt) # Use specific prompt as system logic

                if ndvi_val >= 0.6:
                    next_step = "HEALTHY_FOLLOWUP"
                elif ndvi_val >= 0.4:
                    next_step = "DIAGNOSE_STRESS"
                else:
                    next_step = "CONFIRM_CAUSE"
                
            # --- HEALTHY BRANCH ---
            elif step == "HEALTHY_FOLLOWUP":
                if any(x in user_input.lower() for x in ["yield", "forecast", "production"]):
                    # Mock calculation based on healthy NDVI
                    yield_estimate = 4.0 + (ndvi_val * 0.5) 
                    response_text = f"📈 **Yield Forecast**: Based on current biomass (NDVI {ndvi_val:.2f}), we predict a yield of **{yield_estimate:.1f} tons/hectare**, which is excellent! Keep up the good irrigation schedule."
                else:
                    response_text = ask_gemini(user_input) # Fallback to generic chat
                next_step = "END"

            # --- MODERATE BRANCH ---
            elif step == "DIAGNOSE_STRESS":
                 if any(x in user_input.lower() for x in ["yes", "yellow", "dry"]):
                     response_text = "I see. It could be **Nitrogen deficiency** or early fungal stress. \n\nI recommend applying a foliar spray of **NPK 19:19:19 (5g/liter)** to boost recovery. Would you like a list of nearby shops?"
                 else:
                     response_text = "Okay. It might just be temporary heat stress. Please ensure soil moisture is maintained. I will scan again in 24 hours."
                 next_step = "END"

            # --- CRITICAL BRANCH (Insurance) ---
            elif step == "CONFIRM_CAUSE":
                # Expecting confirmation of adverse event
                if any(x in user_input.lower() for x in ["no", "cancel", "wrong"]):
                    response_text = "Understood. The system will continue monitoring, but no claim will be filed at this time. If the situation changes, please report back."
                    next_step = "END"
                else:
                    # User likely confirmed bad weather (Yes, flood, drought, etc.)
                    response_text = (
                        "Thank you for confirming. Based on your location and the detected critical stress/loss, you are eligible for the **Pradhan Mantri Fasal Bima Yojana (PMFBY)** under 'Mid-Season Adversity'.\n\n"
                        "To apply, you will need:\n"
                        "1. Aadhaar Card\n"
                        "2. Land Record (RoR)\n"
                        "3. Sowing Certificate\n\n"
                        "**Do you want me to help you fill the application form now?**"
                    )
                    next_step = "FINAL_SUBMIT"
                    
            elif step == "FINAL_SUBMIT":
                if any(x in user_input.lower() for x in ["yes", "submit", "fill", "apply", "ok"]):
                    response_text = (
                        "✅ **Redirecting to Application Form...** \n\n"
                        "Please keep your **Aadhaar Card** and **Bank Passbook** handy. \n"
                        "Click the button below or go to the 'Forms' tab to complete your claim."
                    )
                    next_step = "END"
                else:
                    response_text = "Okay. You can access the form later from the Dashboard at any time. Take care."
                    next_step = "END"
            
            # --- END STATE --- 
            elif step == "END":
                 # Fallback to generic chat if conversation continues
                 response_text = ask_gemini(user_input)
            
            # If logic fell through without response (shouldn't happen but for safety)
            if not response_text:
                response_text = ask_gemini(user_input)

            return _update_state(state, next_step, response_text, user_input)
            
        except Exception as e:
            logger.error(f"❌ Error in process_message: {e}")
            return _update_state(state, step, "I encountered an error processing your request. Please try again.", user_input)

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def _update_state(state: Dict, step: str, response: str, user_input: str) -> Dict:
    """Helper to cleanly construct the returned state dictionary."""
    history = state.get("history", [])
    # Append the interaction to history efficiently
    new_history = list(history)
    new_history.append({"role": "user", "content": user_input})
    new_history.append({"role": "agent", "content": response})
    
    return {
        "step": step,
        "response": response,
        "history": new_history
    }

def _build_ndvi_analysis_prompt(ndvi_val: float) -> str:
    """Constructs the prompt for the initial NDVI analysis."""
    return f"""
    You are an AI Agronomist analyzing satellite data for a farmer.
    The detected NDVI (Normalized Difference Vegetation Index) is {ndvi_val}.
    
    Interpretation Guide:
    - NDVI > 0.6: Healthy, dense vegetation. (Tone: Optimistic. Task: Offer yield forecast.)
    - NDVI 0.4 - 0.6: Moderate stress. (Tone: Concerned. Task: Ask about visual symptoms like yellowing.)
    - NDVI < 0.4: Critical crop loss risk. (Tone: Urgent. Task: Ask if there was a recent weather event like Drought/Flood to check insurance eligibility.)
    
    Generate a short, friendly message to the farmer explaining this status.
    Keep the message under 3 sentences. Use emojis (🌾, ⚠️, 🌧️).
    Do NOT mention the technical term "NDVI" unless necessary, explain it simply as "crop health score".
    """

def _authentication_error_response(state: Dict) -> Dict:
    """Returns a standardized error response if auth fails."""
    return {
        "step": state.get("step", "START"),
        "response": "System Error: Unable to authenticate AI service. Please check API keys.",
        "history": state.get("history", [])
    }

