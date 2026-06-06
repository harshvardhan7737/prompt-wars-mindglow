/**
 * @jest-environment node
 */

process.env.GEMINI_API_KEY = "mock_key";

import { NextRequest } from "next/server";
import { POST } from "../app/api/analyze/route";

jest.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockImplementation(() => ({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({
              emotionalState: "Anxious and overwhelmed about JEE mock test syllabus backlog",
              stressLevel: "High",
              confidenceLevel: "Low",
              burnoutRisk: "Medium",
              triggers: ["Syllabus Backlog", "Mock Tests"],
              recommendations: [
                "Take a 10-minute deep breathing break",
                "Divide topics into tiny chunks",
                "Solve only 5 questions to rebuild confidence"
              ],
              insight: "Preparation is a marathon, not a sprint. Take it one topic at a time!"
            })
          }
        })
      }))
    }))
  };
});

describe("MindGlow API Suite", () => {
  it("should process POST requests and return correct mock JSON", async () => {
    // Mock NextRequest cleanly
    const req = {
      json: jest.fn().mockResolvedValue({
        mood: "Stressed",
        reflection: "I am extremely worried about my mock test backlog on physics.",
        examType: "JEE Main/Advanced"
      })
    } as any;
    
    const response = await POST(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.stressLevel).toBe("High");
    expect(data.triggers).toContain("Syllabus Backlog");
  });

  it("should reject requests missing mood", async () => {
    const req = {
      json: jest.fn().mockResolvedValue({
        reflection: "I am extremely worried about my mock test backlog on physics.",
        examType: "JEE Main/Advanced"
      })
    } as any;
    
    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Invalid or missing mood value");
  });

  it("should reject empty reflection input", async () => {
    const req = {
      json: jest.fn().mockResolvedValue({
        mood: "Neutral",
        reflection: "",
        examType: "NEET UG"
      })
    } as any;
    
    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Invalid or missing reflection thoughts");
  });
});
