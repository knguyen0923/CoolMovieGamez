import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Explain how AI works in a few words", //edit to include the prompt script, as well as the movie information. 
  });
  console.log(response.text);
}

await main();