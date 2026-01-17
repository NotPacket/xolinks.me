import { NextResponse } from "next/server";
import { AVAILABLE_FONTS, FONT_CATEGORIES } from "@/lib/fonts/config";

export async function GET() {
  return NextResponse.json({
    fonts: AVAILABLE_FONTS,
    categories: FONT_CATEGORIES,
  });
}
