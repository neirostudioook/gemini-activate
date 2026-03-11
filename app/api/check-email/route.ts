import { NextRequest, NextResponse } from "next/server";
import { checkEmail, markActivated } from "@/lib/emails";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const result = checkEmail(email);

    if (result.found && !result.activated) {
      markActivated(email);
      return NextResponse.json({
        found: true,
        activated: false,
        message: "Subscription ready for activation",
      });
    }

    if (result.found && result.activated) {
      return NextResponse.json({
        found: true,
        activated: true,
        message: "Subscription already activated",
      });
    }

    return NextResponse.json({
      found: false,
      activated: false,
      message: "Email not found",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
