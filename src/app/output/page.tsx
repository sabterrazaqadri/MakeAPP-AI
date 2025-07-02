"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  Copy,
  Download,
  Eye,
  Code,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Zap,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { saveAs } from "file-saver";
import Link from "next/link";
import LivePreview from "@/app/components/LivePreview";
import AgentChat from "@/app/components/AgentChat";

const MonacoEditor = dynamic(() => import("@/app/components/CodeEditor"), {
  ssr: false,
});

export default function OutputPage() {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isAgentProcessing, setIsAgentProcessing] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("generatedCode");
    if (saved) setCode(saved);
  }, []);

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "generated-app.jsx");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCodeUpdate = (newCode: string) => {
    setCode(newCode);
    sessionStorage.setItem("generatedCode", newCode);
  };

  const handleAgentProcessing = (processing: boolean) => {
    setIsAgentProcessing(processing);
  };

  const handleToggleAgent = () => {
    // Save current scroll position
    const currentScroll = window.scrollY;
    
    setIsAgentOpen(!isAgentOpen);
    
    // Restore scroll position after state update
    setTimeout(() => {
      window.scrollTo(0, currentScroll);
    }, 0);
  };

  return (
    <main className="min-h-screen bg-black/20 backdrop-blur-sm">
      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="container !py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Generator</span>
              </Link>
              <div className="h-6 w-px bg-white/20"></div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-white">
                  Your Generated App
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const currentScroll = window.scrollY;
                  setIsAgentOpen(!isAgentOpen);
                  setTimeout(() => window.scrollTo(0, currentScroll), 0);
                }}
                className={`flex items-center gap-2 !px-4 !py-2 rounded-lg transition-all duration-200 text-white text-sm font-medium ${
                  isAgentOpen
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg"
                    : "bg-white/10 border border-white/20 hover:bg-white/20"
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                {isAgentOpen ? "Hide AI" : "AI Assistant"}
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 !px-4 !py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors text-white text-sm"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 text-white text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`container !py-8 transition-all duration-300 ${isAgentOpen ? '!pr-4' : ''}`}>
        {/* Success Message */}
        <div className="mb-8">
          <div className="form-card border-green-500/20">
            <div className="flex items-center gap-4 !mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="heading-lg text-white !mb-1">
                  App Generated Successfully!
                </h1>
                <p className="text-white/70 text-base">
                  Your AI-powered application is ready to use
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2 text-white/80">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Generated in under 60 seconds</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Code className="w-4 h-4 text-blue-400" />
                <span>React + Tailwind CSS</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Eye className="w-4 h-4 text-green-400" />
                <span>Live preview available</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <MessageCircle className="w-4 h-4 text-indigo-400" />
                <span>AI assistant ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="!mb-6">
          <div className="flex gap-1 glass rounded-xl !p-1 w-fit">
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-2 !px-6 !py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "preview"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Eye className="w-4 h-4" />
              Live Preview
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`flex items-center gap-2 !px-6 !py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "code"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Code className="w-4 h-4" />
              Source Code
            </button>
          </div>
        </div>

        {/* Content with Side Panel */}
        <div className="flex gap-6">
          {/* Main Content */}
          <div className={`feature-card overflow-hidden transition-all duration-300 ${isAgentOpen ? 'flex-1' : 'w-full'} relative`}>
            {isAgentProcessing && (
              <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-indigo-500 to-purple-600 text-white !px-3 !py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                AI is updating your app...
              </div>
            )}
            {activeTab === "preview" ? (
              <div>
                <div className="!p-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="!ml-2">Live Preview</span>
                  </div>
                </div>
                <div className="w-full h-[600px]">
                  <LivePreview code={code} />
                </div>
              </div>
            ) : (
              <div>
                <div className="!p-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Code className="w-4 h-4" />
                    <span>Generated React Component</span>
                    <div className="!ml-auto flex items-center gap-2 text-xs">
                      <span className="!px-2 !py-1 bg-white/10 rounded">JSX</span>
                      <span>{code.split("\n").length} lines</span>
                    </div>
                  </div>
                </div>
                <div className="h-[600px]">
                  <MonacoEditor code={code} />
                </div>
              </div>
            )}
          </div>

          {/* AI Assistant Side Panel */}
          {isAgentOpen && (
            <div className="w-96 h-[600px] transition-all duration-300">
              <AgentChat 
                currentCode={code} 
                onCodeUpdate={handleCodeUpdate} 
                onProcessing={handleAgentProcessing}
              />
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="!mt-8">
          <div className="form-card">
            <h3 className="text-xl font-semibold text-white !mb-6">
              What's Next?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="!p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-lg font-medium text-white !mb-3">
                  AI Assistant
                </h4>
                <p className="text-white/70 text-sm !mb-4 leading-relaxed">
                  Use the AI assistant to modify colors, add features, create tabs, and more
                </p>
                <button 
                  onClick={() => {
                    const currentScroll = window.scrollY;
                    setIsAgentOpen(true);
                    setTimeout(() => window.scrollTo(0, currentScroll), 0);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                >
                  Chat with AI →
                </button>
              </div>
              <div className="!p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-lg font-medium text-white !mb-3">
                  Customize Your App
                </h4>
                <p className="text-white/70 text-sm !mb-4 leading-relaxed">
                  Edit the code to add your own content, colors, and features
                </p>
                <button 
                  onClick={() => setActiveTab("code")}
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                >
                  View code →
                </button>
              </div>
              <div className="!p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-lg font-medium text-white !mb-3">
                  Deploy Your App
                </h4>
                <p className="text-white/70 text-sm !mb-4 leading-relaxed">
                  Deploy to Vercel, Netlify, or any hosting platform
                </p>
                <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                  Deploy guide →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
