import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize the client only if the key exists to prevent immediate errors on load if missing
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateBookPreview = async (title: string, author: string): Promise<string> => {
  if (!ai) return "AI services are currently unavailable. Please check your API key.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a compelling, short marketing hook (max 50 words) for a book titled "${title}" by ${author}. Make it sound exciting.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating preview:", error);
    return "Discover the secrets within these pages. A journey you won't forget.";
  }
};

export const generateBookContent = async (title: string): Promise<string> => {
  if (!ai) return "Reader service unavailable.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are the actual book content generator. Write the first chapter (approx 300 words) of the book "${title}". Format it nicely with paragraphs.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content:", error);
    return "Error loading book content. Please try again later.";
  }
};
