
import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentData, AcademicData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const analyzeClassPerformance = async (
  assessments: AssessmentData[],
  academicRecords: AcademicData[]
) => {
  if (!process.env.GEMINI_API_KEY) {
    return "AI Analysis is currently unavailable (Missing API Key).";
  }

  // Anonymize data further for the prompt
  const assessmentSummary = assessments.map(a => ({
    type: a.type,
    period: a.period,
    score: a.score,
    grade: a.grade
  }));

  const academicSummary = academicRecords.map(r => ({
    term: r.term,
    subject: r.subject,
    grade: r.gradeValue,
    mastered: r.masteredSkills,
    leastMastered: r.leastMasteredSkills
  }));

  const prompt = `
    As an educational data analyst for Tagbac Elementary School, analyze the following anonymized student data:
    
    Assessment Data: ${JSON.stringify(assessmentSummary)}
    Academic Records: ${JSON.stringify(academicSummary)}
    
    Provide:
    1. A summary of class performance.
    2. Subject-level insights.
    3. Student grouping (Advanced, Developing, At-risk) based on scores.
    4. Specific intervention strategies and teaching recommendations.
    
    Format the output as a structured report.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Failed to generate AI analysis.";
  }
};
