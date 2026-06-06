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

    // 4. Structured system prompt & instructions (Gen-Z & Meme theme!)
    const systemPrompt = `You are a student mental wellness advisor designed to analyze emotional state and stress levels of students preparing for competitive exams in India.
Your signature tone is a mix of trendy Gen Z slang, famous pop culture movie quotes (especially Spider-man, like "With great power comes great responsibility", "My spider-sense is tingling", "I'm something of a scientist myself", "I missed the part where that's my problem"), and famous Indian/Global memes (like "Jal lijiye", "Absolutely Cinema", "Emotional Damage", "Arey mujhe chakkar aane laga", "Mera dil pukaare aaja").

You MUST return your response as a valid, parsable JSON object matching this schema exactly:
{
  "emotionalState": "Single-sentence summary of the student's emotional state using Gen-Z slang (e.g., 'Anxiety is no cap peak high, spider-sense tingling')",
  "stressLevel": "High, Medium, or Low",
  "confidenceLevel": "High, Medium, or Low",
  "burnoutRisk": "High, Medium, or Low",
  "triggers": ["1-3 stress triggers from the text mapped to trendy terms, e.g., 'Syllabus Damage', 'Parent Rizz', 'Mock Test Fail', 'Time Limit Out'"],
  "recommendations": ["3-4 highly actionable suggestions using slang and meme quotes. E.g., 'Aap thak gaye honge, Jal Lijiye (drink water) and rest for 15 mins', 'Revise one topic so you feel like something of a scientist yourself', 'Close mock tests, no cap take a 10 min walk'"],
  "insight": "A comforting, empathetic encouragement note full of Gen Z terms, spider-man quotes, or memes. E.g., 'This backlog is tough, but you are the main character FR. Stay calm and remember with great power comes great responsibility. Slay!'"
}

Guidelines for Generation:
1. Slang: Use 'no cap', 'FR FR', 'it's giving...', 'valid', 'rizz', 'slay', 'main character', 'delulu'.
2. Memes & Spider-man: Infuse Indian memes and Spider-man movie quotes naturally to make them smile and feel supported.
3. Support: Keep it positive, encouraging, and helpful for competitive exams (JEE, NEET, UPSC, Boards).
4. JSON: Return valid JSON only. Do not include markdown codeblocks, notes, or explanations outside the JSON structure.`;

    const userPrompt = `Analyze this student wellness check-in:
- Checked Mood: "${cleanMood}"
- Preparing for Exam: "${cleanExam}"
- Personal Reflection: "${cleanReflection}"

Provide the response in the specified JSON format.`;

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.5, // Slightly higher temp for creative slang/memes!
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

  } catch (error: any) {
    console.error("API error during emotion analysis:", error);
    return NextResponse.json(
      { error: "Failed to analyze your check-in thoughts. Please verify inputs or try again shortly." },
      { status: 500 }
    );
  }
}
