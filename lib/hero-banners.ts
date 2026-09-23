import "server-only";
import { runtimeEnv as env } from "@/lib/runtime-env";
export type HeroBanner={id:number;image_url:string;alt_text:string;headline:string;supporting_text:string;cta_label:string;cta_href:string;display_order:number};
export const defaultHeroBanners:HeroBanner[]=[
  {id:-1,image_url:"/hero-solar-1.webp",alt_text:"Solar panels illuminated by sunrise",headline:"Clean energy. Pure world.",supporting_text:"High-efficiency solar modules for demanding renewable-energy projects.",cta_label:"Explore products",cta_href:"/products",display_order:1},
  {id:-2,image_url:"/hero-solar-2.webp",alt_text:"Industrial rooftop solar installation",headline:"Engineered for industry.",supporting_text:"Reliable module technology for commercial and industrial applications.",cta_label:"Request a quote",cta_href:"/quote",display_order:2},
  {id:-3,image_url:"/hero-solar-3.webp",alt_text:"Advanced photovoltaic module technology",headline:"Technology that performs.",supporting_text:"Modern solar architectures supported by disciplined manufacturing.",cta_label:"Explore technology",cta_href:"/technology",display_order:3},
  {id:-4,image_url:"/hero-solar-4.webp",alt_text:"Large utility-scale solar energy plant",headline:"Power for every scale.",supporting_text:"Product discovery and engineering support from rooftop to utility scale.",cta_label:"View solutions",cta_href:"/products",display_order:4},
  {id:-5,image_url:"/hero-solar-5.webp",alt_text:"Premium rooftop solar array in natural sunlight",headline:"A brighter energy future.",supporting_text:"Practical digital tools and responsive support for solar project planning.",cta_label:"Calculate project",cta_href:"/solar-calculator",display_order:5},
];
export async function getHeroBanners(){try{const rows=await env.DB.prepare("SELECT id,image_url,alt_text,headline,supporting_text,cta_label,cta_href,display_order FROM hero_banners WHERE published=1 ORDER BY display_order,id LIMIT 5").all<HeroBanner>();return rows.results.length?rows.results:defaultHeroBanners}catch{return defaultHeroBanners}}
