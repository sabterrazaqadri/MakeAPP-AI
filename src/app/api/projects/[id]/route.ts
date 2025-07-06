import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { client } from "../../../../lib/sanity";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, code, tags, isPublic } = await req.json();
    
    // Verify the project belongs to the user
    const existingProject = await client.fetch(`
      *[_type == "project" && _id == $id && userId == $userId][0]
    `, { id: params.id, userId });

    if (!existingProject) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

    const updatedProject = {
      title,
      description,
      code,
      tags,
      isPublic,
      updatedAt: new Date().toISOString(),
    };

    const result = await client
      .patch(params.id)
      .set(updatedProject)
      .commit();
    
    return NextResponse.json({ project: result });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify the project belongs to the user
    const existingProject = await client.fetch(`
      *[_type == "project" && _id == $id && userId == $userId][0]
    `, { id: params.id, userId });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await client.delete(params.id);
    
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
} 

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updates = await req.json();
    
    // Update the project
    const result = await client
      .patch(params.id)
      .set(updates)
      .commit();

    return NextResponse.json({ project: result });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
} 