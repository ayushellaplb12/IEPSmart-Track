import { DailyRecord, Student } from "../types";

export async function generateStudentConclusion(student: Student, records: DailyRecord[]) {
  if (records.length === 0) return null;

  try {
    const response = await fetch("/api/generate-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ student, records }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate summary");
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
}
