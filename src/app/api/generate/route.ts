// app/api/generate/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const systemPrompt = `You are a Next.js expert developer. Generate a complete Next.js application based on the user's specific requirements.

CRITICAL: You MUST return ONLY a valid JSON object. Do not include any markdown, explanations, or other text.

IMPORTANT:
- Do NOT use or import 'clsx' or 'tailwind-merge' in any file.
- Do NOT add 'clsx' or 'tailwind-merge' to package.json.
- ALWAYS include a main component file named "components/MainComponent.tsx" that contains the primary UI.
- The MainComponent.tsx should be a complete, standalone React component that can be previewed.
- For the MainComponent.tsx, prefer standard HTML elements over Next.js components when possible:
  - Use <img> instead of <Image> when possible
  - Use <a> instead of <Link> when possible
  - Avoid Next.js-specific features that won't work in a basic React preview
- ALWAYS include these essential files for a working Next.js + Tailwind CSS app:
  - "components/MainComponent.tsx" (the main UI component)
  - "package.json" (dependencies and scripts)
  - "next.config.js" (Next.js configuration)
  - "tailwind.config.js" (Tailwind CSS configuration)
  - "postcss.config.js" (PostCSS configuration)
  - "app/globals.css" (global CSS with Tailwind imports)
  - "app/page.tsx" (Next.js 13+ app router page)
  - "app/layout.tsx" (root layout with CSS imports)

ADDITIONAL INSTRUCTIONS:
- The navbar MUST be fixed (not sticky or transparent), and always stay on top of all layers (z-50 or above). It must not allow background content to overlap.
- Ensure all text has enough contrast with its background: for example, avoid white text on white backgrounds or black text on black cards.
- Use Tailwind utility classes to enforce proper foreground/background contrast (e.g., 'bg-white text-black', '/bg-black text-white', etc.) across all components.

Create a unique, custom application that matches the user's prompt exactly. Do NOT use generic templates or placeholder content.

`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent([systemPrompt, prompt]);
    const response = await result.response;
    const rawText = await response.text();

    // Debug: Log the raw AI response
    console.log("🤖 Raw AI Response:", rawText.substring(0, 500) + "...");

    // Try to parse as JSON first
    let projectStructure;
    try {
      // Clean the response first
      let cleanedText = rawText.trim();
      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
      cleanedText = cleanedText.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
      
      console.log("🧹 Cleaned text:", cleanedText.substring(0, 500) + "...");
      
      projectStructure = JSON.parse(cleanedText);
      
      // Handle nested file_structure format from AI
      if (projectStructure.file_structure) {
        console.log("🔄 Flattening nested file_structure...");
        const flattened: Record<string, string> = {};
        
        function flattenObject(obj: any, prefix = '') {
          for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              flattenObject(obj[key], prefix + key + '/');
            } else {
              flattened[prefix + key] = obj[key];
            }
          }
        }
        
        flattenObject(projectStructure.file_structure);
        projectStructure = flattened;
        console.log("✅ Flattened structure:", Object.keys(projectStructure));
      }
      
      // POST-PROCESS: Fix any lib/utils.ts that imports clsx or tailwind-merge
      if (projectStructure["lib/utils.ts"] &&
        (/clsx/.test(projectStructure["lib/utils.ts"]) || /tailwind-merge/.test(projectStructure["lib/utils.ts"]))
      ) {
        projectStructure["lib/utils.ts"] = `// Simple classNames utility, no dependencies\nexport function cn(...args) {\n  return args.filter(Boolean).join(' ');\n}`;
      }
      // Also remove clsx and tailwind-merge from package.json if present
      if (projectStructure["package.json"]) {
        try {
          const pkg = JSON.parse(projectStructure["package.json"]);
          if (pkg.dependencies) {
            delete pkg.dependencies["clsx"];
            delete pkg.dependencies["tailwind-merge"];
          }
          projectStructure["package.json"] = JSON.stringify(pkg, null, 2);
        } catch {}
      }
      
      // Ensure essential CSS configuration files are present
      if (!projectStructure["tailwind.config.js"]) {
        projectStructure["tailwind.config.js"] = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
        console.log("✅ Added missing tailwind.config.js");
      }
      
      if (!projectStructure["postcss.config.js"]) {
        projectStructure["postcss.config.js"] = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
        console.log("✅ Added missing postcss.config.js");
      }
      
      if (!projectStructure["app/globals.css"]) {
        projectStructure["app/globals.css"] = `@tailwind base;
@tailwind components;
@tailwind utilities;`;
        console.log("✅ Added missing app/globals.css");
      }
      
      if (!projectStructure["app/layout.tsx"]) {
        projectStructure["app/layout.tsx"] = `import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`;
        console.log("✅ Added missing app/layout.tsx");
      }
      
      // Ensure package.json has correct dependencies
      if (projectStructure["package.json"]) {
        try {
          const pkg = JSON.parse(projectStructure["package.json"]);
          
          // Ensure required dependencies are present
          if (!pkg.dependencies) pkg.dependencies = {};
          if (!pkg.devDependencies) pkg.devDependencies = {};
          
          // Required dependencies
          pkg.dependencies["next"] = pkg.dependencies["next"] || "14.0.0";
          pkg.dependencies["react"] = pkg.dependencies["react"] || "^18";
          pkg.dependencies["react-dom"] = pkg.dependencies["react-dom"] || "^18";
          
          // Required dev dependencies for Tailwind CSS
          pkg.devDependencies["tailwindcss"] = pkg.devDependencies["tailwindcss"] || "^3.3.0";
          pkg.devDependencies["autoprefixer"] = pkg.devDependencies["autoprefixer"] || "^10.0.1";
          pkg.devDependencies["postcss"] = pkg.devDependencies["postcss"] || "^8";
          pkg.devDependencies["@types/node"] = pkg.devDependencies["@types/node"] || "^20";
          pkg.devDependencies["@types/react"] = pkg.devDependencies["@types/react"] || "^18";
          pkg.devDependencies["@types/react-dom"] = pkg.devDependencies["@types/react-dom"] || "^18";
          pkg.devDependencies["typescript"] = pkg.devDependencies["typescript"] || "^5";
          
          projectStructure["package.json"] = JSON.stringify(pkg, null, 2);
          console.log("✅ Updated package.json with required dependencies");
        } catch (e) {
          console.error("❌ Failed to update package.json:", e);
        }
      }
    } catch (parseError) {
      console.error("🔴 JSON Parsing Error:", parseError);
      return NextResponse.json(
        { error: (parseError as any)?.message || "JSON parsing failed" },
        { status: 500 }
      );
    }

    // Find the main component for preview with improved fallback logic
    let mainComponentCode = "";
    
    // Debug: Log what files we have
    console.log("🔍 Generated files:", Object.keys(projectStructure));
    
    // Priority order for finding the main component:
    // 1. components/MainComponent.tsx (preferred)
    // 2. app/page.tsx (Next.js 13+ app router)
    // 3. pages/index.tsx (Next.js pages router)
    // 4. Any .tsx file in components/
    // 5. Any .tsx file in app/
    // 6. Any .tsx file in pages/
    
    if (projectStructure["components/MainComponent.tsx"]) {
      console.log("✅ Found components/MainComponent.tsx");
      mainComponentCode = projectStructure["components/MainComponent.tsx"];
    } else if (projectStructure["app/page.tsx"]) {
      console.log("✅ Found app/page.tsx");
      mainComponentCode = projectStructure["app/page.tsx"];
    } else if (projectStructure["pages/index.tsx"]) {
      console.log("✅ Found pages/index.tsx");
      mainComponentCode = projectStructure["pages/index.tsx"];
    } else {
      // Look for any .tsx file in components/, app/, or pages/
      const componentFiles = Object.keys(projectStructure).filter(
        (k) => k.endsWith(".tsx") && (k.startsWith("components/") || k.startsWith("app/") || k.startsWith("pages/"))
      );
      console.log("🔍 Found .tsx files:", componentFiles);
      if (componentFiles.length > 0) {
        console.log("✅ Using first .tsx file:", componentFiles[0]);
        mainComponentCode = projectStructure[componentFiles[0]];
      } else {
        // Look for ANY .tsx file anywhere
        const allTsxFiles = Object.keys(projectStructure).filter(k => k.endsWith(".tsx"));
        console.log("🔍 All .tsx files:", allTsxFiles);
        if (allTsxFiles.length > 0) {
          console.log("✅ Using any .tsx file:", allTsxFiles[0]);
          mainComponentCode = projectStructure[allTsxFiles[0]];
        }
      }
    }
    
    console.log("📝 Selected component length:", mainComponentCode.length);
    if (mainComponentCode.length > 0) {
      console.log("📝 Component preview:", mainComponentCode.substring(0, 200) + "...");
    }
    
    // Clean the component code for live preview (remove Next.js dependencies)
    if (mainComponentCode) {
      // Step 1: Remove all imports first to avoid duplicates
      mainComponentCode = mainComponentCode
        // Remove all import statements (we'll add React back later)
        .replace(/import\s+.*\s+from\s+['"][^'"]*['"];?\s*/g, '')
        .replace(/import\s+.*\s+from\s+[`][^`]*[`];?\s*/g, '')
        
        // Remove 'use client' directive
        .replace(/'use client';?\s*/g, '')
        .replace(/"use client";?\s*/g, '')
        
        // Replace Next.js components with standard HTML
        .replace(/<Image([^>]*)\/>/g, '<img$1 />')
        .replace(/<Image([^>]*)>(.*?)<\/Image>/g, '<img$1>$2</img>')
        .replace(/<Link([^>]*)>(.*?)<\/Link>/g, '<a$1>$2</a>')
        .replace(/<Link([^>]*)\/>/g, '<a$1 />')
        
        // Replace undefined components with placeholder divs
        .replace(/<(\w+)([^>]*)\/>/g, (match, componentName, attributes) => {
          // Skip HTML elements and React components we know exist
          const htmlElements = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'button', 'input', 'form', 'section', 'header', 'footer', 'nav', 'main', 'aside', 'article', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'label', 'select', 'option', 'textarea', 'br', 'hr'];
          if (htmlElements.includes(componentName.toLowerCase())) {
            return match; // Keep HTML elements as-is
          }
          // Replace custom components with placeholder divs
          return `<div className="bg-gray-200 border-2 border-dashed border-gray-400 p-4 text-center text-gray-600" data-component="${componentName}">
            <p className="text-sm">[${componentName} Component]</p>
            <p className="text-xs opacity-60">This component will be available in the full project</p>
          </div>`;
        })
        .replace(/<(\w+)([^>]*)>(.*?)<\/\1>/g, (match, componentName, attributes, content) => {
          // Skip HTML elements and React components we know exist
          const htmlElements = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'button', 'input', 'form', 'section', 'header', 'footer', 'nav', 'main', 'aside', 'article', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'label', 'select', 'option', 'textarea'];
          if (htmlElements.includes(componentName.toLowerCase())) {
            return match; // Keep HTML elements as-is
          }
          // Replace custom components with placeholder divs
          return `<div className="bg-gray-200 border-2 border-dashed border-gray-400 p-4 text-center text-gray-600" data-component="${componentName}">
            <p className="text-sm">[${componentName} Component]</p>
            <p className="text-xs opacity-60">This component will be available in the full project</p>
            <div className="mt-2 text-xs opacity-50">${content}</div>
          </div>`;
        })
        
        // Clean up multiple empty lines and normalize spacing
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .replace(/^\s+/, '') // Remove leading whitespace
        .trim();
      
      // Step 2: Add React import at the very beginning
      mainComponentCode = `import React from "react";\n\n${mainComponentCode}`;
      
      // Step 3: Handle cn function calls by replacing with simple className concatenation
      mainComponentCode = mainComponentCode
        .replace(/cn\(([^)]*)\)/g, (match, args) => {
          // Parse the cn function arguments and convert to space-separated classes
          const classes = args.split(',')
            .map((arg: string) => arg.trim())
            .filter((arg: string) => arg.length > 0)
            .map((arg: string) => {
              // Remove quotes and handle template literals
              return arg.replace(/['"`]/g, '').trim();
            })
            .filter(Boolean);
          return classes.join(' ');
        });
    }
    
    // Fallback: if nothing found, create a simple component
    if (!mainComponentCode) {
      console.log("⚠️ No component found, creating fallback component");
      
      // Create a basic MainComponent.tsx in the project structure
      const fallbackComponent = `import React from "react";

export default function MainComponent() { 
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Generated App</h1>
        <p className="text-xl opacity-80">Your app has been generated successfully!</p>
        <p className="text-sm opacity-60 mt-2">Check the source code tab to see the full project structure.</p>
      </div>
    </div>
  );
}`;
      
      // Add it to the project structure
      projectStructure["components/MainComponent.tsx"] = fallbackComponent;
      mainComponentCode = fallbackComponent;
    }
    return NextResponse.json({ code: mainComponentCode, projectStructure });
  } catch (error: any) {
    console.error("🔴 Generation Error:", error);
    return NextResponse.json(
      { error: error?.message || "Code generation failed" },
      { status: 500 }
    );
  }
}

function createErrorFallback(prompt: string) {
  // Simple error fallback - no hardcoded app code
  return {
    "package.json": `{
  "name": "generated-nextjs-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.0.0",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}`,
    "lib/utils.ts": `// Simple classNames utility, no dependencies
export function cn(...args) {
  return args.filter(Boolean).join(' ');
}`,
  };
}
