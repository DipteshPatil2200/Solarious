import {NextResponse} from "next/server";
import {ADMIN_SESSION_COOKIE} from "@/lib/admin-session";

export function GET(request:Request){const url=new URL(request.url),returnTo=url.searchParams.get("return_to"),destination=returnTo?.startsWith("/")&&!returnTo.startsWith("//")?returnTo:"/";const response=NextResponse.redirect(new URL(destination,request.url));response.cookies.set(ADMIN_SESSION_COOKIE,"",{httpOnly:true,sameSite:"lax",secure:url.protocol==="https:",path:"/",maxAge:0});return response}
