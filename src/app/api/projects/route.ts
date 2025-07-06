import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { client } from "../../../lib/sanity";

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Query projects for the specific user
    const projects = await client.fetch(`
      *[_type == "project" && userId == $userId] | order(createdAt desc) {
        _id,
        title,
        description,
        code,
        userId,
        userEmail,
        tags,
        category,
        isFavorite,
        isPublic,
        createdAt,
        updatedAt
      }
    `, { userId });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, code, tags = [], category = "other", isFavorite = false, isPublic = false } = await req.json();
    
    if (!title || !code) {
      return NextResponse.json({ error: "Title and code are required" }, { status: 400 });
    }

    const newProject = {
      _type: 'project',
      title,
      description: description || "",
      code,
      userId,
      userEmail: "", // Will be set from client side if needed
      tags,
      category,
      isFavorite,
      isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await client.create(newProject);
    
    return NextResponse.json({ project: result });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
  }
} 