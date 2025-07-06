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

CRITICAL RULES - FOLLOW THESE EXACTLY:
- Always return valid React JSX code using Tailwind CSS
- The component must be named App and written as: function App() { ... }
- Do not use export statements in the returned code 
- Do not include import statements in the returned code
- Do not include <html>, <head>, or <body> tags
- Only return the JSX code for the component function (starting with function App() {)
- NEVER include the word "javascript" anywhere in your response
- NEVER include syntax errors or invalid JavaScript
- Maintain the existing functionality while making requested changes
- Use modern React patterns and best practices
- Ensure the code is responsive and accessible

NAVBAR SPECIFIC RULES:
- All navigation bars should use "fixed" positioning, NOT "sticky"
- Use className="fixed top-0 left-0 right-0 z-50" for navbars
- Never use "sticky" positioning for navigation elements
- Always ensure proper z-index (z-50) for fixed navbars
- Add appropriate padding-top to main content to account for fixed navbar

Current conversation context: ${conversationHistory ? conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') : 'No previous context'}

User's current code:
${currentCode}

User's request: ${message}

Please provide the updated React component code that addresses the user's request. Return ONLY the function App() { ... } code, nothing else.
`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent([systemPrompt, message]);
    const response = await result.response;
    const rawText = await response.text();

    // Enhanced cleaning with better validation
    let cleaned = rawText
      .replace(/^```(tsx|jsx|js)?/gm, "") // remove markdown
      .replace(/```$/gm, "")
      .replace(/^import\s+.*?from\s+['"][^'"]*['"];?\s*$/gm, "") // remove import statements
      .replace(/export\s+default\s+function\s+App/, "function App") // clean export
      .replace(/export\s+default\s+App/, "")                        // clean default export line
      .replace(/^javascript\s*$/gm, "") // remove any "javascript" lines
      .replace(/^javascript$/gm, "") // remove "javascript" without spaces
      .trim();

    // Additional validation to ensure we have a valid function
    if (!cleaned.includes("function App()")) {
      // If no function App found, try to extract it or return error
      const functionMatch = cleaned.match(/function\s+\w+\s*\([^)]*\)\s*{/);
      if (functionMatch) {
        // Replace the function name with App
        cleaned = cleaned.replace(/function\s+\w+\s*\([^)]*\)\s*{/, "function App() {");
      } else {
        throw new Error("Invalid code structure - no function found");
      }
    }

    // Remove any remaining invalid syntax
    cleaned = cleaned
      .replace(/^[^f]*function/, "function") // remove anything before function if it's not valid
      .replace(/\n\s*javascript\s*\n/g, "\n") // remove any "javascript" lines
      .replace(/\n\s*javascript$/g, "") // remove "javascript" at end
      .trim();

    // Final validation
    if (cleaned.includes("javascript") || !cleaned.startsWith("function App()")) {
      throw new Error("Generated code contains invalid syntax");
    }

    // ✅ Always prepend React import since we removed all imports
    const finalCode = `import React from "react";\n\n${cleaned}\n\nexport default App;`;

    return NextResponse.json({ 
      code: finalCode,
      message: "I've updated your app based on your request. The changes have been applied to the code."
    });
  } catch (error: any) {
    console.error("🔴 Agent Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process your request. Please try again with a different prompt." },
      { status: 500 }
    );
  }
} 