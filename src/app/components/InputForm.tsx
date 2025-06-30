'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Send, Loader2, Zap } from "lucide-react";

export default function InputForm() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        alert("Something went wrong!");
        return;
      }

      const { code } = await res.json();
      sessionStorage.setItem("generatedCode", code);
      router.push("/output");
    } catch (err) {
      alert("Error generating code.");
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Create a modern portfolio website",
    "Build a landing page for a SaaS product",
    "Design a restaurant website with menu",
    "Make a dashboard with charts",
    "Create a blog with article cards"
  ];

  return (
    <div className="form-container z-10">
      {/* Main Form */}
      <div className="form-card ">
        <div className="text-center !mb-2">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-full !px-4 !py-2 !mb-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-white/90">AI App Generator</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white !mb-2">Describe Your App</h2>
          <p className="text-white/70 text-sm md:text-base">Be as detailed as possible for the best results</p>
        </div>

        <form onSubmit={handleSubmit} className="!space-y-4">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create a modern portfolio website with a hero section, about me, skills showcase, and contact form. Use a dark theme with purple accents..."
              className="input-field"
              rows={4}
              required
            />
            <div className="absolute bottom-3 right-3 text-white/30 text-xs">
              {prompt.length}/1000
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="btn-primary  !mt-2 btn-large w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="loading-dots">Generating your app</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate App
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {loading && (
          <div className="!mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full !px-4 !py-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-white/80">AI is crafting your app...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="form-card">
        <h3 className="text-lg md:text-xl font-semibold text-white !mb-6 flex items-center gap-2">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
          Quick Start Prompts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickPrompts.map((quickPrompt, index) => (
            <button
              key={index}
              onClick={() => setPrompt(quickPrompt)}
              className="text-left !p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
            >
              <div className="text-white/90 group-hover:text-white transition-colors text-sm font-medium !mb-1">
                {quickPrompt}
              </div>
              <div className="text-white/50 text-xs">Click to use</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="!mt-6 text-center">
        <div className="inline-flex items-center gap-2 text-white/60 text-xs md:text-sm">
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
          <span>Tip: Be specific about colors, layout, and features for better results</span>
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
