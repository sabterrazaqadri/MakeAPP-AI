// app/api/generate/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const systemPrompt = `
You are a frontend React developer.
Generate a complete valid React component in JSX using Tailwind CSS for styling.
The component must be named App and written like: function App() { ... }
Do not use export statements.
Do not include <html>, <head>, or <body> tags.
Only return the JSX code for the component function.
`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent([systemPrompt, prompt]);
    const response = await result.response;
    const rawText = await response.text();

    const cleaned = rawText
      .replace(/^```(tsx|jsx|js)?/gm, "") // remove markdown
      .replace(/```$/gm, "")
      .replace(/export\s+default\s+function\s+App/, "function App") // clean export
      .replace(/export\s+default\s+App/, "")                        // clean default export line
      .trim();

    // ✅ Prepend React import
    const finalCode = `import React from "react";\n\n${cleaned}\n\nexport default App;`;

    return NextResponse.json({ code: finalCode });
  } catch (error: any) {
    console.error("🔴 Generation Error:", error);
    return NextResponse.json(
      { error: error?.message || "Code generation failed" },
      { status: 500 }
    );
  }
}
