import { NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/db";

/**
 * API endpoint to initialize the database
 * This should only be called once during setup
 *
 * For security, this endpoint should be disabled in production
 * or protected with authentication
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Database initialization is disabled in production" },
      { status: 403 }
    );
  }

  try {
    await initializeDatabase();
    return NextResponse.json({
      message: "Database initialized successfully",
    });
  } catch (error) {
    console.error("Database initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}
