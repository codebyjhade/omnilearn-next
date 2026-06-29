import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase lazily so the module evaluates without env vars at build time
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase server configuration.");
  return createClient(url, key);
}

export async function POST(req: Request) {
  try {
    const { filePath } = await req.json();
    const supabase = getSupabase();
    
    // 1. Download the uploaded PDF from your Supabase Storage bucket
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('study_materials')
      .download(filePath);

    if (downloadError || !fileData) throw new Error("Failed to download PDF from storage.");

    // 2. Convert the PDF into Base64 format so Gemini can read it
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Pdf = buffer.toString('base64');

    // 3. Wake up the Gemini AI 
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    
    // 🔥 MAGIC TRICK: We force Gemini to respond ONLY in valid JSON format
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" } 
    });

    // 4. The Master Prompt
    const prompt = `
      You are an expert AI professor. Read the attached PDF document and generate a study kit.
      Return ONLY a valid JSON object matching this exact structure:
      {
        "summary": "A comprehensive 3-paragraph summary of the core concepts in the text. Format beautifully.",
        "flashcards": [
          { "front": "Key Term or Concept", "back": "Detailed definition or explanation" }
        ],
        "quizzes": [
          {
            "question": "A challenging multiple-choice question based on the text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswerIndex": 0
          }
        ]
      }
      Generate exactly 10 flashcards and exactly 5 quiz questions.
    `;

    // 5. Send the PDF and the Prompt to Gemini
    const result = await model.generateContent([
      { inlineData: { data: base64Pdf, mimeType: 'application/pdf' } },
      prompt
    ]);

    // 6. Parse the AI's response into a usable Javascript Object
    const jsonText = result.response.text();
    const studyData = JSON.parse(jsonText);

    // 7. Extract the User ID from the filePath (Format: userId/filename.pdf)
    const userId = filePath.split('/')[0];

    // 8. Save the newly generated study kit permanently to the database
    const { error: dbError } = await supabase.from('study_notes').insert({
      user_id: userId,
      file_path: filePath,
      summary: studyData.summary,
      flashcards: studyData.flashcards,
      quizzes: studyData.quizzes
    });

    if (dbError) throw dbError;

    // 9. Tell the frontend we finished successfully!
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Generation Engine Error:", error);
    return NextResponse.json({ error: 'Failed to process the PDF material.' }, { status: 500 });
  }
}
