import "server-only";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function getAdminUser() {
  return getChatGPTUser();
}
