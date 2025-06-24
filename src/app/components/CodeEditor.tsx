"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
}

export default function CodeEditor({ code }: CodeEditorProps) {
  return (
    <Editor
      height="600px"
      theme="vs-dark"
      defaultLanguage="javascript"
      value={code}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        scrollBeyondLastLine: false,
      }}
    />
  );
}
