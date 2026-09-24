"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Inbox, Loader2, Package, RefreshCw, Save, Search, Trash2 } from "lucide-react";
import type { Product } from "@/data/site";
import AdminResources from "@/components/admin-resources";
import AdminHeroBanners from "@/components/admin-hero-banners";
import AdminLogManagement from "@/components/admin-log-management";

type Inquiry = { id:number; kind:string; name:string; company:string; email:string; phone:string; product:string; capacity:string; location:string; message:string; details:string; status:string; created_at:string };
const statuses = ["new", "contacted", "qualified", "closed"];

export default function AdminDashboard({ adminName }:{ adminName:string }) {
  const [tab,setTab]=useState<"inquiries"|"products"|"resources"|"homepage"|"system">("inquiries");
  const [inquiries,setInquiries]=useState<Inquiry[]>([]);
  const [products,setProducts]=useState<Product[]>([]);
  const [query,setQuery]=useState("");
  const [loading,setLoading]=useState(true);
  const [notice,setNotice]=useState("");
  const [editing,setEditing]=useState<Product|null>(null);

  const load=useCallback(async()=>{
    setLoading(true); setNotice("");
    try {
      const [iq,pq]=await Promise.all([fetch("/api/admin/inquiries"),fetch("/api/admin/products")]);
      if(!iq.ok||!pq.ok) throw new Error("Unable to load admin data");
      const i=await iq.json() as {inquiries:Inquiry[]}; const p=await pq.json() as {products:Product[]};
      setInquiries(i.inquiries); setProducts(p.products);
    } catch { setNotice("Admin data is temporarily unavailable. Please retry."); }
    finally { setLoading(false); }
  },[]);
  useEffect(()=>{const timer=window.setTimeout(()=>void load(),0);return()=>window.clearTimeout(timer)},[load]);

  const filtered=useMemo(()=>inquiries.filter(item=>`${item.name} ${item.company} ${item.email} ${item.phone} ${item.message}`.toLowerCase().includes(query.toLowerCase())),[inquiries,query]);
  const updateStatus=async(id:number,status:string)=>{await fetch("/api/admin/inquiries",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});setInquiries(v=>v.map(x=>x.id===id?{...x,status}:x));};
  const removeInquiry=async(id:number)=>{if(!confirm("Delete this inquiry permanently?"))return;const r=await fetch(`/api/admin/inquiries?id=${id}`,{method:"DELETE"});if(r.ok)setInquiries(v=>v.filter(x=>x.id!==id));};
  const saveProduct=async(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();if(!editing)return;const r=await fetch("/api/admin/products",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(editing)});if(r.ok){setProducts(v=>v.map(x=>x.slug===editing.slug?editing:x));setNotice("Product changes saved and are live on the product pages.");setEditing(null);}else setNotice("Product could not be saved.");};

  return <main className="admin-page">
    <header className="admin-topbar"><div><p className="eyebrow">Solarious control centre</p><h1>Admin Dashboard</h1><p>Signed in as {adminName}</p></div><div className="admin-top-actions"><button className="button button-ghost" onClick={()=>void load()}><RefreshCw size={16}/> Refresh</button><a className="button button-ghost" href="/signout-with-chatgpt?return_to=/">Sign out</a></div></header>
    <section className="admin-stats"><article><Inbox/><div><strong>{inquiries.length}</strong><span>Total enquiries</span></div></article><article><CheckCircle2/><div><strong>{inquiries.filter(x=>x.status==="new").length}</strong><span>New leads</span></div></article><article><Package/><div><strong>{products.length}</strong><span>Products</span></div></article></section>
    {notice&&<div className="admin-notice">{notice}</div>}
    <nav className="admin-tabs" aria-label="Admin sections"><button className={tab==="inquiries"?"active":""} onClick={()=>setTab("inquiries")}>Enquiries</button><button className={tab==="products"?"active":""} onClick={()=>setTab("products")}>Products</button><button className={tab==="resources"?"active":""} onClick={()=>setTab("resources")}>Resources</button><button className={tab==="homepage"?"active":""} onClick={()=>setTab("homepage")}>Homepage / Hero</button><button className={tab==="system"?"active":""} onClick={()=>setTab("system")}>System / Logs</button></nav>
    {loading?<div className="admin-loading"><Loader2 className="spin"/> Loading dashboard…</div>:tab==="inquiries"?<section className="admin-panel">
      <div className="admin-panel-head"><div><h2>Enquiry inbox</h2><p>Contact and quotation requests submitted from the website.</p></div><label className="admin-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search enquiries"/></label></div>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Customer</th><th>Request</th><th>Project</th><th>Received</th><th>Status</th><th>Action</th></tr></thead><tbody>{filtered.map(item=><tr key={item.id}><td><strong>{item.name}</strong><small>{item.company||"—"}</small><a href={`mailto:${item.email}`}>{item.email}</a><small>{item.phone}</small></td><td><span className="admin-kind">{item.kind}</span><p>{item.message||"No message"}</p></td><td><strong>{item.product||"General"}</strong><small>{item.capacity} {item.location}</small></td><td>{new Date(item.created_at).toLocaleDateString("en-IN",{dateStyle:"medium"})}</td><td><select value={item.status} onChange={e=>void updateStatus(item.id,e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></td><td><button className="icon-button danger" aria-label="Delete inquiry" onClick={()=>void removeInquiry(item.id)}><Trash2 size={16}/></button></td></tr>)}</tbody></table>{!filtered.length&&<div className="admin-empty">No enquiries found.</div>}</div>
    </section>:tab==="products"?<section className="admin-panel"><div className="admin-panel-head"><div><h2>Product catalogue</h2><p>Edit the product information shown across the website.</p></div></div><div className="admin-product-grid">{products.map(product=><article key={product.slug}><img src={product.image} alt=""/><div><span>{product.technology}</span><h3>{product.name}</h3><p>{product.summary}</p><button className="button button-ghost" onClick={()=>setEditing({...product})}>Edit product</button></div></article>)}</div></section>:tab==="resources"?<AdminResources/>:tab==="homepage"?<AdminHeroBanners/>:<AdminLogManagement/>}
    {editing&&<div className="admin-modal-backdrop" role="presentation" onMouseDown={()=>setEditing(null)}><div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="edit-product" onMouseDown={e=>e.stopPropagation()}><h2 id="edit-product">Edit {editing.name}</h2><form onSubmit={saveProduct}><label>Product name<input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} required/></label><label>Technology<input value={editing.technology} onChange={e=>setEditing({...editing,technology:e.target.value})} required/></label><label>Summary<textarea rows={4} value={editing.summary} onChange={e=>setEditing({...editing,summary:e.target.value})} required/></label><label>Applications (one per line)<textarea rows={4} value={editing.applications.join("\n")} onChange={e=>setEditing({...editing,applications:e.target.value.split("\n")})}/></label><label>Features (one per line)<textarea rows={4} value={editing.features.join("\n")} onChange={e=>setEditing({...editing,features:e.target.value.split("\n")})}/></label><label>Image path<input value={editing.image} onChange={e=>setEditing({...editing,image:e.target.value})}/></label><div className="admin-modal-actions"><button type="button" className="button button-ghost" onClick={()=>setEditing(null)}>Cancel</button><button className="button" type="submit"><Save size={16}/> Save changes</button></div></form></div></div>}
  </main>;
}
