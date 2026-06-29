import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, summary } = await req.json();
    
    // Initialize Gemini using your secret key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // The "System Prompt" - This tells the AI how to behave
    const prompt = `
      You are OmniLearn's helpful AI Tutor. 
      The student is studying this material: "${summary}"
      The student asks: "${message}"
      
      INSTRUCTIONS:
      1. Be helpful, clear, and encouraging.
      2. If they ask a direct question, answer it directly using the study material.
      3. If they ask you to "Explain like I'm 5", use very simple analogies and everyday concepts.
      4. Keep your answers brief (under 3-4 sentences) and easy to read.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}