import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const aiKey = process.env.GEMINI_API_KEY;
  try {
    // 1. Backend environment variable validation
    if (!aiKey) {
      return NextResponse.json(
        { error: "AI service is currently unavailable. Please configure the environment key." },
        { status: 500 }
      );
    }

    // 2. Client payload extraction and validation
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON format in request body." },
        { status: 400 }
      );
    }

    const { mood, reflection, examType } = body;

    // Strict input validations to prevent empty or weird injection attacks
    if (!mood || typeof mood !== "string" || !["Happy", "Good", "Neutral", "Sad", "Stressed"].includes(mood)) {
      return NextResponse.json(
        { error: "Invalid or missing mood value. Allowed: Happy, Good, Neutral, Sad, Stressed." },
        { status: 400 }
      );
    }

    if (!reflection || typeof reflection !== "string" || reflection.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing reflection thoughts." },
        { status: 400 }
      );
    }

    if (!examType || typeof examType !== "string" || examType.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing exam type." },
        { status: 400 }
      );
    }

    const cleanMood = mood.trim();
    const cleanReflection = reflection.trim().slice(0, 1000); // Truncate long inputs to prevent abuse
    const cleanExam = examType.trim().slice(0, 100);

    // 3. Gemini API initialization
    const genAI = new GoogleGenerativeAI(aiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 4. Structured system prompt & instructions
    const systemPrompt = `You are a student mental wellness advisor designed to analyze emotional state and stress levels of students preparing for highly competitive exams (like JEE, NEET, Boards, UPSC, CAT, etc.) in India.
Your task is to analyze the student's mood check-in, written or voice-transcribed reflection, and current exam context, then generate a detailed emotional wellness evaluation.

You MUST write all your text outputs (emotionalState, triggers, recommendations, insight) in a highly expressive Gen Z tone. Use popular Gen Z slang (like "no cap", "rent-free", "down bad", "main character", "valid", "slaying", "locked in", "cooking", "panik", "kalm") and refer to Indian student memes (like Sharma Ji Ka Beta, mock test backlogs, Phir Hera Pheri e.g. "Bilkul risk nahi lene ka", Welcome e.g. "Control Uday Control", Ashneer Grover e.g. "Bhai kya kar raha hai tu") and famous pop-culture movie quotes (specifically Spider-Man e.g. "With great power comes...", Batman e.g. "It's not who I am underneath...", Iron Man/Avengers e.g. "I am Iron Man" or "I love you 3000" or "Part of the journey is the end", Fight Club e.g. "The first rule of Fight Club is...").

You MUST return your response as a valid, parsable JSON object matching this schema exactly:
{
  "emotionalState": "Single-sentence concise summary of their emotional state using Gen Z slang (e.g., 'Bro is currently down bad and panicking over mock marks, no cap.')",
  "stressLevel": "High, Medium, or Low",
  "confidenceLevel": "High, Medium, or Low",
  "burnoutRisk": "High, Medium, or Low",
  "triggers": ["A list of 1-3 specific academic stressors written in slang, e.g., 'Syllabus backlog renting space rent-free', 'Expectation pressure from parents'"],
  "recommendations": ["A list of 3-4 highly actionable wellness suggestions written in Gen Z lingo. Mix in famous pop culture movie quotes (like Spider-Man, Batman, Iron Man, Avengers, Fight Club) and cool Indian memes (Phir Hera Pheri, Welcome, Ashneer Grover). (e.g., 'Do a 10-min box breathing run. As Batman says: \"It\'s not who I am underneath, but what I do that defines me.\" Define yourself as a breathing legend.', 'Stop letting mock scores live rent-free. Remember the first rule of Study Club: you DO talk about Study Club to your friends for support.')"],
  "insight": "A comforting, empathetic 1-2 sentence encouragement note using Indian memes/movie quotes or global superhero movie quotes. E.g. 'All is well! Remember, picture abhi baaki hai mere dost. Take it one topic at a time.'"
}

Guidelines for Generation:
1. Empathy: Write the recommendations and insight in a deeply supportive, warm, and comforting tone. Avoid clinical, robotic, or diagnostic medical language.
2. Triggers: Map triggers to logical academic stressors (e.g., Backlog, Mock Test Scores, Revision Stress, Board exams, Peer pressure).
3. Budget/Wellness: Do not suggest expensive tools or therapies. Focus on free, immediate coping exercises, study hacks, and breathing routines.
4. JSON Integrity: You must only return JSON. Do not include markdown codeblocks, notes, or explanations outside the JSON structure.`;

    const userPrompt = `Analyze this student wellness check-in:
- Checked Mood: "${cleanMood}"
- Preparing for Exam: "${cleanExam}"
- Personal Reflection: "${cleanReflection}"

Provide the response in the specified JSON format.`;

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
      systemInstruction: systemPrompt,
    });

    const responseText = response.response.text();
    if (!responseText) {
      throw new Error("Received empty response from generative model.");
    }

    // Attempt to parse JSON to verify correctness before sending to client
    const parsedData = JSON.parse(responseText.trim());

    // Basic keys validation in output
    const requiredKeys = ["emotionalState", "stressLevel", "confidenceLevel", "burnoutRisk", "triggers", "recommendations", "insight"];
    for (const key of requiredKeys) {
      if (!(key in parsedData)) {
        throw new Error(`Generative model returned incomplete JSON schema. Missing: ${key}`);
      }
    }

    return NextResponse.json(parsedData);

  } catch (error: unknown) {
    // Mask raw stack traces or database errors with a safe user message for security
    console.error("API error during emotion analysis:", error);
    return NextResponse.json(
      { error: "Failed to analyze your check-in thoughts. Please verify inputs or try again shortly." },
      { status: 500 }
    );
  }
}
