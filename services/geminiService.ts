import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateBookPreview = async (title: string, author: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI services are currently unavailable. Please check your configuration.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a compelling, short marketing hook (max 50 words) for a book titled "${title}" by ${author}. Make it sound exciting.`,
    });
    return response.text || "Discover the secrets within these pages. A journey you won't forget.";
  } catch (error) {
    console.error("Error generating preview:", error);
    return "Discover the secrets within these pages. A journey you won't forget.";
  }
};

export const generateBookContent = async (title: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "Reader service unavailable.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are the actual book content generator. Write the first chapter (approx 300 words) of the book "${title}". Format it nicely with paragraphs.`,
    });
    return response.text || "Error loading book content. Please try again later.";
  } catch (error) {
    console.error("Error generating content:", error);
    return "Error loading book content. Please try again later.";
  }
};