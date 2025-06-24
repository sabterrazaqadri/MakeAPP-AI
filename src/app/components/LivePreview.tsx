"use client";

import { Sandpack } from "@codesandbox/sandpack-react";

interface LivePreviewProps {
  code: string;
}

export default function LivePreview({ code }: LivePreviewProps) {
  return (
    <div className="mt-6 mb-6 border rounded-lg shadow overflow-hidden">
      <Sandpack
        template="react"
        theme="light"
        options={{
          showTabs: true,
          wrapContent: true,
          editorHeight: 550,
          editorWidthPercentage: 0,
          autorun: true,
        }}
        files={{
          "/App.js": code,
          "/index.js": `
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
          `,
          "/index.css": `
@import url("https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css");
          `,
        }}
      />
    </div>
  );
}
