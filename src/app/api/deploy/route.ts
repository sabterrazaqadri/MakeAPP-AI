import { NextRequest, NextResponse } from 'next/server';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN!;

export async function POST(req: NextRequest) {
  try {
    if (!VERCEL_TOKEN) {
      return NextResponse.json({ error: "Vercel token not configured" }, { status: 500 });
    }

    const { projectStructure, projectName } = await req.json();

    if (!projectStructure || Object.keys(projectStructure).length === 0) {
      return NextResponse.json({ error: "Invalid project structure" }, { status: 400 });
    }

    console.log("🚀 Starting deployment with", Object.keys(projectStructure).length, "files");

    // Convert projectStructure to Vercel's file format with proper content handling
    const files = Object.entries(projectStructure).map(([file, content]) => {
      // Ensure content is a string
      let stringContent: string;
      if (typeof content === 'string') {
        stringContent = content;
      } else if (typeof content === 'object' && content !== null) {
        // If content is an object, stringify it
        stringContent = JSON.stringify(content, null, 2);
        console.log(`⚠️ Converting object to string for file: ${file}`);
      } else {
        // Fallback for other types
        stringContent = String(content);
        console.log(`⚠️ Converting ${typeof content} to string for file: ${file}`);
      }
      
      return {
        file,
        data: Buffer.from(stringContent).toString('base64'),
        encoding: 'base64',
      };
    });

    const body = {
      name: projectName || `makeapp-${Date.now()}`,
      files,
      projectSettings: { framework: 'nextjs' },
    };

    const res = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      const url = `https://${data.url}`;
      console.log("✅ Deployment successful:", url);
      return NextResponse.json({ url });
    } else {
      console.error("❌ Vercel API error:", data);
      const errorMessage = data.error?.message || data.message || 'Unknown deployment error';
      return NextResponse.json({ error: `Deployment failed: ${errorMessage}` }, { status: res.status || 500 });
    }
  } catch (error: any) {
    console.error("❌ Deploy API error:", error);
    return NextResponse.json({ error: `Deployment failed: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
} 