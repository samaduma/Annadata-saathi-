"""
Agronomist Chat Service
=======================

This module provides a conversational interface for the AI Agronomist system.
It allows users (farmers) to ask follow-up questions about crop diagnoses
detected by the vision system.

The agent maintains context about the specific disease diagnosis provided 
by the `agents.py` workflow to ensure relevant and accurate advice.
"""

import os
import logging
from typing import Dict, List, Any, Optional

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, BaseMessage

# =============================================================================
# CONFIGURATION
# =============================================================================

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
GEMINI_MODEL = "gemini-2.5-flash"

# =============================================================================
# AGRONOMIST CHAT AGENT
# =============================================================================

class AgronomistChatAgent:
    """
    Handles conversational interactions between the farmer and the AI Agronomist.
    
    This agent wraps the LangChain Google Generative AI model to provide
    context-aware responses based on previous diagnostic results.
    """
    
    @staticmethod
    def chat(message: str, history: List[Dict[str, str]], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes a user message in the context of a specific diagnosis.

        Args:
            message: The user's input text (question or comment).
            history: List of prior messages [{"role": "user"|"ai", "content": "..."}].
            context: Dictionary containing diagnosis details:
                     - disease: Detected disease name
                     - confidence: Model confidence score
                     - analysis: Initial expert analysis text

        Returns:
            Dict containing:
                - response: The AI's reply text.
                - history: Updated message history.
        """
        logger.info(f"🗨️ Agronomist Chat: Processing message (History length: {len(history)})")
        
        # Extract context safely with defaults
        disease = context.get("disease", "Unknown")
        confidence = context.get("confidence", 0.0)
        initial_analysis = context.get("analysis", "No initial analysis provided.")
        
        try:
            # Initialize Gemini Model
            # A higher temperature allows for more conversational/natural responses
            llm = ChatGoogleGenerativeAI(
                model=GEMINI_MODEL, 
                google_api_key=os.getenv("GEMINI_API_KEY"),
                temperature=0.7
            )
            
            # Construct Context-Aware System Prompt
            system_prompt = AgronomistChatAgent._build_system_prompt(disease, confidence, initial_analysis)
            
            # Reconstruct Conversation History for LangChain
            messages: List[BaseMessage] = [SystemMessage(content=system_prompt)]
            
            for msg in history:
                if msg.get("role") == "user":
                    messages.append(HumanMessage(content=msg.get("content", "")))
                elif msg.get("role") == "ai":
                    messages.append(AIMessage(content=msg.get("content", "")))
            
            # Handle user input
            user_input_msg = message.strip()
            
            if not user_input_msg:
                # If message is empty (e.g., initial load), prompt the AI to start the conversation
                logger.info("ℹ️ Empty message received. Generating welcome/summary message.")
                hidden_prompt = "Please explain the diagnosis and suggest immediate next steps based on the context provided above. Be welcoming."
                messages.append(HumanMessage(content=hidden_prompt))
                # Note: We don't add the hidden prompt to the returned history typically, 
                # but we will add the AI's response.
            else:
                messages.append(HumanMessage(content=user_input_msg))
            
            # Invoke LLM
            response = llm.invoke(messages)
            ai_reply = response.content
            
            # Update History
            # Only add the user's explicit message to history, not the hidden prompt
            new_history = list(history) # Copy history
            if user_input_msg:
                new_history.append({"role": "user", "content": user_input_msg})
            
            new_history.append({"role": "ai", "content": ai_reply})
            
            return {
                "response": ai_reply,
                "history": new_history
            }
            
        except Exception as e:
            logger.error(f"❌ Agronomist Chat Error: {e}", exc_info=True)
            return {
                "response": "I apologize, but I'm currently having trouble connecting to my knowledge base. Please check your connection or try again in a moment.",
                "history": history
            }

    @staticmethod
    def _build_system_prompt(disease: str, confidence: float, initial_analysis: str) -> str:
        """Helper to build the system prompt with injected context."""
        return f"""
        You are an expert AI Agronomist assistant dedicated to helping farmers.
        
        === CURRENT DIAGNOSIS CONTEXT ===
        - Crop Condition: {disease}
        - Detection Confidence: {confidence*100:.1f}%
        - Initial Assessment: {initial_analysis}
        
        === YOUR GOAL ===
        - Answer the farmer's follow-up questions specifically about this diagnosis.
        - Recommend practical, step-by-step treatments (prioritize organic/low-cost options first, then chemical).
        - If asked about costs or subsidies, mention that specific Government Schemes might be available.
        
        === GUIDELINES ===
        - Tone: Empathetic, professional, encouraging, and clear.
        - Language: Use simple, plain English suitable for a general audience. Avoid overly academic jargon unless explained.
        - Length: Keep responses concise (under 3-4 sentences) for direct questions, unless detailed instructions are requested.
        - Safety: If the user asks about non-farming topics, politely redirect back to crop health.
        """
