"use client";

import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
} from "@codesandbox/sandpack-react";

interface LivePreviewProps {
  code: string;
}

function wrapCode(code: string): string {
  if (code.includes("export default")) return code;
  if (code.includes("function App(") || code.includes("const App")) {
    return `${code}\n\nexport default App;`;
  }
  return `function App() {\n${code}\n}\n\nexport default App;`;
}

export default function LivePreview({ code }: LivePreviewProps) {
  if (!code) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white/5 rounded-xl border border-white/10">
        <p className="text-white/50">No code to preview</p>
      </div>
    );
  }

  const finalCode = wrapCode(code);

  return (
    <div className="w-full h-full min-h-0">
      <SandpackProvider
        template="react"
        files={{
          "/App.js": { code: finalCode },
          "/index.js": {
            code: `
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
          `,
          },
          "/index.css": {
            code: `
@import url("https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css");
body { margin: 0; padding: 0; height: 100vh; }
#root { height: 100vh; }
          `,
          },
        }}
        customSetup={{
          dependencies: {
            react: "latest",
            "react-dom": "latest",
            "lucide-react": "latest",
          },
        }}
      >
        <SandpackLayout className="h-full min-h-0 w-full">
          <SandpackPreview className="h-full min-h-[600px] w-full" style={{height: '100%', minHeight: 600}} showOpenInCodeSandbox={false} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
