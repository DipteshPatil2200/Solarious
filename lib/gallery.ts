import "server-only";
import { backendApiUrl } from "@/lib/server-config";

export type SiteGalleryImage = { id:string; title:string; description:string; category:string; image_url:string; alt_text:string; width:number; height:number };
const legacy: SiteGalleryImage[] = [
  {id:"legacy-utility",title:"Utility-scale solar installation",description:"Solar modules prepared for large-scale energy generation.",category:"Industrial Solar",image_url:"/utility-solar.webp",alt_text:"Utility-scale solar panel installation",width:900,height:620},
  {id:"legacy-manufacturing",title:"Advanced manufacturing line",description:"Precision manufacturing for dependable solar modules.",category:"Solar Products",image_url:"/manufacturing-line.webp",alt_text:"Advanced solar manufacturing line",width:900,height:620},
  {id:"legacy-ai",title:"Smart energy monitoring",description:"Solar performance and intelligent energy analytics.",category:"Commercial Solar",image_url:"/ai-solar-intelligence.webp",alt_text:"Solar energy monitoring and intelligent analytics",width:900,height:620},
  {id:"legacy-rooftop",title:"Industrial rooftop installation",description:"Solar systems engineered for productive rooftops.",category:"Commercial Solar",image_url:"/hero-solar-2.webp",alt_text:"Industrial rooftop solar installation",width:900,height:620},
  {id:"legacy-module",title:"Photovoltaic module technology",description:"High-efficiency solar module detail.",category:"Solar Products",image_url:"/hero-solar-3.webp",alt_text:"Photovoltaic module technology",width:900,height:620},
  {id:"legacy-premium",title:"Premium rooftop solar",description:"Clean-energy generation for every project.",category:"Residential Solar",image_url:"/hero-solar-5.webp",alt_text:"Premium rooftop solar array",width:900,height:620},
];
export async function getGallery(): Promise<SiteGalleryImage[]> { const backend=backendApiUrl(); if(!backend) return legacy; try { const response=await fetch(`${backend}/api/gallery?limit=60`,{cache:"no-store",signal:AbortSignal.timeout(8_000)}); const data=await response.json() as {images?:SiteGalleryImage[]}; return response.ok&&Array.isArray(data.images)&&data.images.length?data.images:legacy; } catch { return legacy; } }
