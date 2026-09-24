import "server-only";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { runtimeEnv as env } from "@/lib/runtime-env";

export async function getAdminUser() {
  return getChatGPTUser();
}

export async function getSuperAdminUser() {
  const user = await getChatGPTUser();
  if (!user) return null;
  const existing = await env.DB.prepare("SELECT role FROM admin_users WHERE user_id=?").bind(user.userId).first<{role:string}>();
  if (existing?.role === "super_admin") return user;
  const count = await env.DB.prepare("SELECT COUNT(*) AS count FROM admin_users WHERE role='super_admin'").first<{count:number}>();
  if (Number(count?.count) !== 0) return null;
  await env.DB.prepare("INSERT INTO admin_users(user_id,email,role,created_at) VALUES(?,?, 'super_admin', ?)").bind(user.userId,user.email,new Date().toISOString()).run();
  return user;
}
