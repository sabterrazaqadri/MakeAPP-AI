import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { client } from "../../../lib/sanity";

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Query templates for the specific user
    const templates = await client.fetch(`
      *[_type == "template" && userId == $userId] | order(createdAt desc) {
        _id,
        name,
        description,
        code,
        category,
        tags,
        userId,
        createdAt,
        updatedAt
      }
    `, { userId });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description, code, category = "other", tags = [] } = await req.json();
    
    if (!name || !code) {
      return NextResponse.json({ error: "Name and code are required" }, { status: 400 });
    }

    const newTemplate = {
      _type: 'template',
      name,
      description: description || "",
      code,
      category,
      tags,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await client.create(newTemplate);
    
    return NextResponse.json({ template: result });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json({ error: "Failed to save template" }, { status: 500 });
  }
} 