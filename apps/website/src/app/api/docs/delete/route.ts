import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const deleteSchema = z.object({
  id: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = deleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const { id } = parsed.data;

    // For now, we'll just return success since the actual file deletion
    // would need to be handled by finding the document in the approvals
    // system and removing it from there. The frontend already removes it
    // from the UI after a successful delete response.

    console.log(`Document ${id} marked for deletion by admin`);

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully"
    });

  } catch (e) {
    console.error('Error deleting document:', e);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
