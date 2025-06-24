"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { saveAs } from "file-saver";
import Link from "next/link";
import LivePreview from "@/app/components/LivePreview";

const MonacoEditor = dynamic(() => import("@/app/components/CodeEditor"), { ssr: false });

export default function OutputPage() {
  const [code, setCode] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("generatedCode");
    if (saved) setCode(saved);
  }, []);

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "generated-code.jsx");
  };

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-700">Your Generated Code</h1>
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← Back to Home
          </Link>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
          >
            <Copy size={16} className="inline-block mr-1" /> Copy Code
          </button>

          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Download Code
          </button>
        </div>


        {/* ✅ Live Preview Below */}
        {code && <LivePreview code={code} />}
        
        <div className="rounded-lg overflow-hidden border shadow">
          <MonacoEditor code={code} />
        </div>
      </div>
    </main>
  );
}
