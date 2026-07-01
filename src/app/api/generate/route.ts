import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Authenticate user
    let user = null;
    
    // Check Authorization header first (for token-based clients)
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user: jwtUser }, error: jwtError } = await supabase.auth.getUser(token);
      if (!jwtError && jwtUser) {
        user = jwtUser;
      }
    }
    
    // Fallback to session cookies
    if (!user) {
      const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser();
      if (!cookieError && cookieUser) {
        user = cookieUser;
      }
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filePath } = await req.json();
    
    // Check path permissions (prevent directory traversal / accessing other users' files)
    const pathOwnerId = filePath.split('/')[0];
    if (pathOwnerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Access Denied' }, { status: 403 });
    }
    
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
    
    // Force Gemini to respond ONLY in valid JSON format
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" } 
    });

    // 4. The Master Prompt
    const prompt = `
      You are an expert AI professor. Read the attached PDF document and generate a study kit.
      Return ONLY a valid JSON object matching this exact structure:
      {
        "summary": "A beautifully formatted summary in Markdown. Start with a '### 📌 TL;DR' section (2-3 sentences summarizing the absolute core message). Next, add a '### 💡 Key Takeaways' section with bullet points of important concepts using bold words for crucial terms. Finally, write a '### 📖 Detailed Analysis' section summarizing details in 2 paragraphs.",
        "flashcards": [
          { "front": "Key Term or Concept", "back": "Detailed definition or explanation" }
        ],
        "quizzes": [
          {
            "question": "A challenging multiple-choice question based on the text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswerIndex": 0,
            "explanation": "A detailed explanation of why the correct option is right and other options are incorrect."
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

    // 7. Save the newly generated study kit permanently to the database using the authenticated client
    const { error: dbError } = await supabase.from('study_notes').insert({
      user_id: user.id, // Explicitly enforce user.id from the verified session
      file_path: filePath,
      summary: studyData.summary,
      flashcards: studyData.flashcards,
      quizzes: studyData.quizzes
    });

    if (dbError) throw dbError;

    // 8. Tell the frontend we finished successfully!
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Generation Engine Error:", error);
    return NextResponse.json({ error: 'Failed to process the PDF material.' }, { status: 500 });
  }
}
