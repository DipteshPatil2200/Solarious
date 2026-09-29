import "server-only";
import {createHmac,timingSafeEqual} from "node:crypto";
import {adminCredentials} from "@/lib/server-config";

export const ADMIN_SESSION_COOKIE="solarious_admin_session";
const SESSION_SECONDS=8*60*60;

function secret(){
  const {apiToken,password}=adminCredentials();
  return apiToken||password;
}

function signature(value:string){
  return createHmac("sha256",secret()).update(value).digest("base64url");
}

export function createAdminSession(username:string){
  const payload=Buffer.from(JSON.stringify({username,expires:Date.now()+SESSION_SECONDS*1000})).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifyAdminSession(token:string|undefined|null){
  if(!token||!secret())return null;
  const separator=token.lastIndexOf(".");
  if(separator<1)return null;
  const payload=token.slice(0,separator),provided=token.slice(separator+1),expected=signature(payload);
  const left=Buffer.from(provided),right=Buffer.from(expected);
  if(left.length!==right.length||!timingSafeEqual(left,right))return null;
  try{
    const data=JSON.parse(Buffer.from(payload,"base64url").toString("utf8")) as {username?:string;expires?:number};
    return data.username&&Number(data.expires)>Date.now()?data.username:null;
  }catch{return null}
}

export function cookieValue(cookieHeader:string|null,name:string){
  for(const part of (cookieHeader??"").split(";")){
    const [key,...rest]=part.trim().split("=");
    if(key===name)return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function adminSessionMaxAge(){return SESSION_SECONDS}
