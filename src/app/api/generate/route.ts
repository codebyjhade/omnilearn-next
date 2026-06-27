import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { front: { type: Type.STRING }, back: { type: Type.STRING } }
      }
    },
    quizzes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswerIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        }
      }
    }
  },
  required: ["summary", "flashcards", "quizzes"]
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filePath } = body;

    if (!filePath || typeof filePath !== "string") {
      return NextResponse.json({ error: "No file path provided" }, { status: 400 });
    }

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('study_materials')
      .download(filePath);

    if (downloadError || !fileData) {
      return NextResponse.json({ error: "Failed to download file from storage." }, { status: 500 });
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    const prompt = "You are an expert cognitive science AI tutor. Please deconstruct the attached educational PDF and extract the required assets into the provided JSON schema.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ inlineData: { data: base64Data, mimeType: "application/pdf" } }, prompt],
      config: { responseMimeType: "application/json", responseSchema: responseSchema, temperature: 0.2 }
    });

    if (!response.text) throw new Error("Gemini returned an empty response.");

    const structuredData = JSON.parse(response.text);
    const userId = filePath.split('/')[0];
    
    const { error: dbError } = await supabaseAdmin.from('study_notes').insert({
      user_id: userId,
      file_path: filePath,
      summary: structuredData.summary,
      flashcards: structuredData.flashcards,
      quizzes: structuredData.quizzes
    });

    if (dbError) console.error("Failed to save to database:", dbError);

    return NextResponse.json({ success: true, assets: structuredData });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}