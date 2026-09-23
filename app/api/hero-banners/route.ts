import { NextResponse } from "next/server";import { getHeroBanners } from "@/lib/hero-banners";
export async function GET(){return NextResponse.json({banners:await getHeroBanners()})}
