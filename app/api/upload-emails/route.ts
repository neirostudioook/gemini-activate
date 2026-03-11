import { NextRequest, NextResponse } from "next/server";
import { addEmails, getEmails, getStats, removeEmail } from "@/lib/emails";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "gemini2024";

function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emails, password } = body;

    if (!verifyPassword(password)) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: "Emails array is required" },
        { status: 400 }
      );
    }

    const result = addEmails(emails);
    const stats = getStats();

    return NextResponse.json({
      success: true,
      ...result,
      stats,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const password = request.nextUrl.searchParams.get("password");

  if (!password || !verifyPassword(password)) {
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );
  }

  const allEmails = getEmails();
  const stats = getStats();

  return NextResponse.json({
    emails: allEmails,
    stats,
  });
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!verifyPassword(password)) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const removed = removeEmail(email);
    const stats = getStats();

    return NextResponse.json({
      success: removed,
      stats,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
