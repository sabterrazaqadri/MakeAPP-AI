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
  Save,
  Star,
  CheckSquare,
} from "lucide-react";
import { saveAs } from "file-saver";
import Link from "next/link";
import LivePreview from "@/app/components/LivePreview";
import AgentChat from "@/app/components/AgentChat";
import DeployToVercelButton from "@/app/components/DeployToVercelButton";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const MonacoEditor = dynamic(() => import("@/app/components/CodeEditor"), {
  ssr: false,
});

export default function OutputPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isAgentProcessing, setIsAgentProcessing] = useState(false);
  const [projectStructure, setProjectStructure] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("landing");
  const [isFavorite, setIsFavorite] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("generatedCode");
    if (saved) setCode(saved);
    const savedStructure = sessionStorage.getItem("generatedProjectStructure");
    if (savedStructure) {
      try {
        const parsed = JSON.parse(savedStructure);
        setProjectStructure(parsed);
        console.log("Loaded project structure:", Object.keys(parsed).length, "files");
      } catch (e) {
        console.error("Failed to parse project structure:", e);
        setProjectStructure({});
      }
    } else {
      console.log("No project structure found in sessionStorage");
    }
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

  const handleSaveProject = () => {
    if (!isSignedIn) {
      alert("Please sign in to save your project");
      return;
    }

    if (!code.trim()) {
      alert("No code to save");
      return;
    }

    // Set default project name if empty
    if (!projectName.trim()) {
      setProjectName(`Generated App ${new Date().toLocaleDateString()}`);
    }
    setShowSaveDialog(true);
  };

  const handleSaveProjectConfirm = async () => {
    if (!projectName.trim()) {
      alert("Please enter a project name");
      return;
    }

    if (saveAsTemplate && !templateName.trim()) {
      alert("Please enter a template name");
      return;
    }

    setIsSaving(true);
    try {
      const projectData = {
        title: projectName.trim(),
        description: projectDescription.trim() || "Generated with MakeApp AI",
        code: code,
        tags: ["ai-generated", "react", selectedCategory],
        category: selectedCategory,
        isFavorite: isFavorite,
        isPublic: false,
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        // Save as template if requested
        if (saveAsTemplate) {
          try {
            const templateData = {
              name: templateName.trim(),
              category: selectedCategory,
              description: projectDescription.trim() || "Generated with MakeApp AI",
              code: code,
              tags: ["template", selectedCategory],
            };

            const templateResponse = await fetch('/api/templates', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(templateData),
            });

            if (!templateResponse.ok) {
              console.warn("Failed to save template, but project was saved");
            }
          } catch (error) {
            console.warn("Error saving template:", error);
          }
        }

        setSaveSuccess(true);
        setShowSaveDialog(false);
        setProjectName("");
        setProjectDescription("");
        setSelectedCategory("landing");
        setIsFavorite(false);
        setSaveAsTemplate(false);
        setTemplateName("");
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error("Failed to save project");
      }
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const categories = [
    { id: "landing", name: "Landing Page", icon: "🌐" },
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "ecommerce", name: "E-commerce", icon: "🛍️" },
    { id: "blog", name: "Blog", icon: "📝" },
    { id: "portfolio", name: "Portfolio", icon: "🎨" },
    { id: "saas", name: "SaaS", icon: "🚀" },
    { id: "other", name: "Other", icon: "📁" }
  ];

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

  const getMainComponentCode = () => {
    // Implement the logic to extract the main component code from the generated code
    // This is a placeholder and should be replaced with the actual implementation
    return code;
  };

  // Don't render the save button until Clerk is loaded to prevent hydration mismatch
  const renderSaveButton = () => {
    if (!isLoaded) {
      return (
        <button
          disabled
          className="flex items-center gap-2 !px-4 !py-2 rounded-lg bg-white/10 border border-white/20 opacity-50 cursor-not-allowed transition-colors text-white text-sm"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </button>
      );
    }

    return (
      <button
        onClick={handleSaveProject}
        disabled={!isSignedIn || isSaving}
        className="flex items-center gap-2 !px-4 !py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white text-sm"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : saveSuccess ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-400" />
            Saved!
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Project
          </>
        )}
      </button>
    );
  };

  return (
    <main className="min-h-screen bg-black/20 backdrop-blur-sm flex flex-col">
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
              {renderSaveButton()}
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

      <div className={`container flex-1 flex flex-col !py-8 transition-all duration-300 ${isAgentOpen ? '!pr-4' : ''}`} style={{minHeight:0}}>
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
        <div className="flex gap-6 flex-1 min-h-0">
          {/* Main Content */}
          <div className={`feature-card overflow-hidden transition-all duration-300 ${isAgentOpen ? 'flex-1' : 'w-full'} relative flex flex-col min-h-0`}>
            {isAgentProcessing && (
              <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-indigo-500 to-purple-600 text-white !px-3 !py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                AI is updating your app...
              </div>
            )}
            {activeTab === "preview" ? (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="!p-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="!ml-2">Live Preview</span>
                  </div>
                </div>
                <div className="w-full flex-1 min-h-[400px]">
                  <LivePreview code={getMainComponentCode()} />
                </div>
                {/* Deploy to Vercel Button */}
                {Object.keys(projectStructure).length > 0 && (
                  <DeployToVercelButton projectStructure={projectStructure} />
                )}
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
                <button 
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                  onClick={() => router.push("/deploy-guide")}
                >
                  Deploy guide →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Project Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Save className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Save Project</h3>
              <p className="text-white/70 text-sm mb-6">
                Configure your project settings and save
              </p>
              
              <div className="space-y-4 text-left">
                {/* Project Name */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-indigo-500 transition-colors"
                    autoFocus
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe your project"
                    rows={3}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm ${
                          selectedCategory === category.id
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                            : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        <span className="text-base">{category.icon}</span>
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <Star className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Add to Favorites</p>
                        <p className="text-white/60 text-xs">Quick access to important projects</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        isFavorite
                          ? 'bg-yellow-500 border-yellow-500'
                          : 'border-white/30 hover:border-white/50'
                      }`}
                    >
                      {isFavorite && <CheckSquare className="w-4 h-4 text-white" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Save as Template</p>
                        <p className="text-white/60 text-xs">Reuse this design for future projects</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSaveAsTemplate(!saveAsTemplate)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        saveAsTemplate
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-white/30 hover:border-white/50'
                      }`}
                    >
                      {saveAsTemplate && <CheckSquare className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                </div>

                {/* Template Name (if saving as template) */}
                {saveAsTemplate && (
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Enter template name"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveProjectConfirm}
                  disabled={!projectName.trim() || (saveAsTemplate && !templateName.trim()) || isSaving}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Project
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setProjectName("");
                    setProjectDescription("");
                    setSelectedCategory("landing");
                    setIsFavorite(false);
                    setSaveAsTemplate(false);
                    setTemplateName("");
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
