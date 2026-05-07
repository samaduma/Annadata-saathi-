import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { AVAILABLE_ROUTES } from "../utils/routeConfig";

// Initialize the ChatOpenAI client with OpenRouter configuration
const llm = new ChatOpenAI({
    modelName: "google/gemini-2.0-flash-exp:free", // Use free tier Gemini 2.0 Flash
    configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    },
    temperature: 0,
});

// Create a string representation of available routes for the prompt
const routesContext = AVAILABLE_ROUTES.map(
    (r) => `- "${r.path}": ${r.description} (Keywords: ${r.keywords.join(", ")})`
).join("\n");

const template = `You are a helpful navigation assistant for a smart farming application.
Your goal is to understand the user's intent from their spoken command and map it to one of the available routes.
The user might speak in English, Hindi, or Marathi. If they speak in Hindi or Marathi, translate it internally to understand the intent.

Available Routes:
{routes_context}

User Command: "{transcript}"

Instructions:
1. Analyze the user command.
2. If the command matches one of the available routes, return the "targetPath".
3. If the command is unclear or doesn't match a route, return "targetPath": null.
4. Provide a brief, friendly "feedback" message to be spoken back to the user (e.g., "Navigating to Farm Dashboard", "Sorry, I didn't understand that").

Return ONLY a valid JSON object with the following format, no markdown formatting:
{{
  "targetPath": "/path/to/route" || null,
  "feedback": "Your feedback message here"
}}
`;

const prompt = PromptTemplate.fromTemplate(template);

export const getNavigationIntent = async (transcript) => {
    try {
        const formattedPrompt = await prompt.format({
            routes_context: routesContext,
            transcript: transcript,
        });

        const response = await llm.invoke(formattedPrompt);

        // Parse the JSON response. 
        // Gemini sometimes wraps JSON in markdown blocks (e.g. ```json ... ```), so we clean it.
        const cleanContent = response.content.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            return JSON.parse(cleanContent);
        } catch (parseError) {
            console.error("Failed to parse LLM response:", response.content);
            return {
                targetPath: null,
                feedback: "Sorry, I encountered an error processing your request.",
            };
        }

    } catch (error) {
        console.error("Error in getNavigationIntent:", error);
        return {
            targetPath: null,
            feedback: "Sorry, something went wrong. Please try again.",
        };
    }
};
