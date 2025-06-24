'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the app you want..."
        className="w-full p-4 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        rows={5}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md w-full font-medium shadow transition duration-200"
      >
        {loading ? "Generating..." : "Generate App"}
      </button>
      {loading && <p className="text-sm text-center text-gray-500">Please wait, generating your code...</p>}
    </form>
  );
}
