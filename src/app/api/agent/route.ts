import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { message, currentCode, conversationHistory } = await req.json();

  const systemPrompt = `
You are an AI assistant that helps users modify and enhance their React applications. You can:

1. Modify colors, styling, and themes
2. Add new components, tabs, or sections
3. Change layouts and functionality
4. Add new features or interactions
5. Fix bugs or improve code quality

IMPORTANT RULES:
- Always return valid React JSX code using Tailwind CSS
- The component must be named App and written as: function App() { ... }
- Do not use export statements in the returned code
- Do not include import statements in the returned code
- Do not include <html>, <head>, or <body> tags
- Only return the JSX code for the component function (starting with function App() {)
- Maintain the existing functionality while making requested changes
- Use modern React patterns and best practices
- Ensure the code is responsive and accessible

Current conversation context: ${conversationHistory ? conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') : 'No previous context'}

User's current code:
${currentCode}

User's request: ${message}

Please provide the updated React component code that addresses the user's request.
`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent([systemPrompt, message]);
    const response = await result.response;
    const rawText = await response.text();

    const cleaned = rawText
      .replace(/^```(tsx|jsx|js)?/gm, "") // remove markdown
      .replace(/```$/gm, "")
      .replace(/^import\s+.*?from\s+['"][^'"]*['"];?\s*$/gm, "") // remove import statements
      .replace(/export\s+default\s+function\s+App/, "function App") // clean export
      .replace(/export\s+default\s+App/, "")                        // clean default export line
      .trim();

    // ✅ Always prepend React import since we removed all imports
    const finalCode = `import React from "react";\n\n${cleaned}\n\nexport default App;`;

    return NextResponse.json({ 
      code: finalCode,
      message: "I've updated your app based on your request. The changes have been applied to the code."
    });
  } catch (error: any) {
    console.error("🔴 Agent Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process your request" },
      { status: 500 }
    );
  }
} 