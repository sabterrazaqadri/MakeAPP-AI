"use client";

import { useState } from "react";
import { Loader2, Rocket } from "lucide-react";

interface DeployToVercelButtonProps {
  projectStructure: Record<string, string>;
  projectName?: string;
}

export default function DeployToVercelButton({ projectStructure, projectName }: DeployToVercelButtonProps) {
  const [deploying, setDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async () => {
    setDeploying(true);
    setError(null);
    setDeployedUrl(null);
    
    // Validate projectStructure
    if (!projectStructure || Object.keys(projectStructure).length === 0) {
      setError("No project structure available. Please regenerate your app.");
      setDeploying(false);
      return;
    }
    
    try {
      console.log("Deploying project with", Object.keys(projectStructure).length, "files");
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectStructure, projectName }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Deploy API error:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.error || `Deployment failed (${res.status})`);
        } catch {
          setError(`Deployment failed (${res.status}): ${errorText}`);
        }
        return;
      }
      
      const data = await res.json();
      if (data.url) {
        setDeployedUrl(data.url);
      } else {
        setError(data.error || "Deployment failed - no URL returned");
      }
    } catch (err: any) {
      console.error("Deploy error:", err);
      setError(err.message || "Network error during deployment");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="my-4">
      <button
        onClick={handleDeploy}
        disabled={deploying}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-black to-gray-800 hover:from-gray-900 hover:to-black transition-all duration-200 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {deploying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Deploying to Vercel...
          </>
        ) : (
          <>
            <Rocket className="w-4 h-4" />
            Deploy to Vercel
          </>
        )}
      </button>
      {deployedUrl && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-900 dark:text-green-100 text-sm">
          <span className="font-semibold">Deployed!</span> &nbsp;
          <a href={deployedUrl} target="_blank" rel="noopener noreferrer" className="underline text-green-700 dark:text-green-200">View your live app</a>
        </div>
      )}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-900 dark:text-red-100 text-sm">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}
    </div>
  );
} 