"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

interface CodeEditorProps {
  code: string;
}

export default function CodeEditor({ code }: CodeEditorProps) {
  const [value, setValue] = useState(code);

  return (
    <div className="rounded-lg border border-white/10 overflow-hidden shadow-lg bg-[#1e1e1e]">
      <CodeMirror
        value={value}
        onChange={(val) => setValue(val)}
        height="500px"
        theme={oneDark}
        extensions={[javascript()]}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          foldGutter: true,
        }}
      />
    </div>
  );
}
