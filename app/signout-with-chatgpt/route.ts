import {NextResponse} from "next/server";
import {ADMIN_SESSION_COOKIE} from "@/lib/admin-session";

export function GET(request:Request){const url=new URL(request.url),returnTo=url.searchParams.get("return_to"),destination=returnTo?.startsWith("/")&&!returnTo.startsWith("//")?returnTo:"/",host=request.headers.get("x-forwarded-host")||request.headers.get("host")||url.host,protocol=request.headers.get("x-forwarded-proto")||url.protocol.replace(":","");const response=NextResponse.redirect(new URL(destination,`${protocol}://${host}`));response.cookies.set(ADMIN_SESSION_COOKIE,"",{httpOnly:true,sameSite:"lax",secure:protocol==="https",path:"/",maxAge:0});return response}
