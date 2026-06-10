"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Trash2, Edit2, LogOut, Store, Home, Package, 
  Calendar, LayoutDashboard, Settings, Plus, Image as ImageIcon,
  Tag, DollarSign, AlignLeft, Search, CheckCircle2, Clock, Palette
} from "lucide-react";

interface Drop { id: string; name: string; launch_date: string | null; is_active: boolean; }
interface Product { id: string; title: string; price: number; category: string; drop_id: string | null; image_url: string; gallery: string[]; description: string; drops?: { name: string }; }

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); 

  const [products, setProducts] = useState<Product[]>([]);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDropFilter, setSelectedDropFilter] = useState<string>("all");
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ title: "", price: "", category: "", drop_id: "", description: "" });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]); 
  const [isUploading, setIsUploading] = useState(false);

  const [newDrop, setNewDrop] = useState({ name: "", launch_date: "" });
  const [editingDropId, setEditingDropId] = useState<string | null>(null);
  const [isSavingDrop, setIsSavingDrop] = useState(false);

  const [homeSettings, setHomeSettings] = useState({
    marquee_text: "Envío gratis superando los $150.000 • 10% OFF pagando por transferencia",
    hero_image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2000&auto=format&fit=crop",
    hero_subtitle: "NUEVA TEMPORADA",
    b1_img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
    b1_title: "Heavyweight", b1_btn: "Shop Buzos",
    b2_img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop",
    b2_title: "Boxy Tees", b2_btn: "Shop Remeras",
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    const inicializarPanel = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      if (profile?.role === 'admin') {
        setIsAdmin(true);
        await cargarDrops();
        await cargarProductos();
        await cargarConfiguracion();
        setLoading(false);
      } else {
        router.push("/"); 
      }
    };
    inicializarPanel();
  }, [router]);

  const cargarDrops = async () => {
    const { data } = await supabase.from("drops").select("*").order("created_at", { ascending: false });
    if (data) setDrops(data);
  };

  const cargarProductos = async () => {
    const { data, error } = await supabase.from("products").select("*, drops(name)").order("created_at", { ascending: false });
    if (error) {
      const { data: fallback } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (fallback) setProducts(fallback);
    } else if (data) {
      setProducts(data);
    }
  };

  const cargarConfiguracion = async () => {
    const { data } = await supabase.from("settings").select("*");
    if (data) {
      const settingsMap: any = { ...homeSettings };
      data.forEach(item => { if (settingsMap[item.key] !== undefined) settingsMap[item.key] = item.value; });
      setHomeSettings(settingsMap);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSavingSettings(true);
    try {
      for (const key of Object.keys(homeSettings)) {
        const value = (homeSettings as any)[key];
        const { data } = await supabase.from("settings").select("key").eq("key", key).maybeSingle();
        if (data) await supabase.from("settings").update({ value }).eq("key", key);
        else await supabase.from("settings").insert([{ key, value }]);
      }
      alert("¡Diseño actualizado!");
    } catch (error: any) { alert("Error: " + error.message); } finally { setIsSavingSettings(false); }
  };

  const handleSaveDrop = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSavingDrop(true);
    try {
      const payload = { name: newDrop.name.trim().toUpperCase(), launch_date: newDrop.launch_date || null };
      if (editingDropId) await supabase.from("drops").update(payload).eq("id", editingDropId);
      else await supabase.from("drops").insert([payload]);
      setNewDrop({ name: "", launch_date: "" }); setEditingDropId(null); await cargarDrops();
    } catch (error: any) { alert("Error: " + error.message); } finally { setIsSavingDrop(false); }
  };

  const handleSetDropActive = async (dropId: string) => {
    await supabase.from("drops").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("drops").update({ is_active: true }).eq("id", dropId);
    await cargarDrops();
  };

  const handleDeleteDrop = async (id: string) => {
    if (!confirm("¿Eliminar Drop? Los productos quedarán sin drop asignado.")) return;
    await supabase.from("drops").delete().eq("id", id); await cargarDrops(); await cargarProductos();
  };

  const startEditDrop = (drop: Drop) => {
    setEditingDropId(drop.id); setNewDrop({ name: drop.name, launch_date: drop.launch_date ? drop.launch_date.substring(0, 16) : "" });
  };

  const startEditProduct = (product: Product) => {
    setEditingId(product.id); setIsAddingNew(true);
    setNewProduct({ title: product.title, price: product.price.toString(), category: product.category || "", drop_id: product.drop_id || "", description: product.description || "" });
    setExistingImages([product.image_url, ...(product.gallery || [])].filter(Boolean)); setImageFiles([]); setPreviewUrls([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditProduct = () => {
    setEditingId(null); setIsAddingNew(false);
    setNewProduct({ title: "", price: "", category: "", drop_id: "", description: "" });
    setExistingImages([]); setImageFiles([]); setPreviewUrls([]);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newProduct.title || !newProduct.price) return;
    setIsUploading(true); let finalImages = [...existingImages];
    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]; const fileName = `${Date.now()}-${i}.${file.name.split('.').pop()}`;
        await supabase.storage.from('productos').upload(fileName, file);
        finalImages.push(supabase.storage.from('productos').getPublicUrl(fileName).data.publicUrl);
      }
      const payload = { title: newProduct.title.trim(), price: Number(newProduct.price), category: newProduct.category.trim().toUpperCase(), drop_id: newProduct.drop_id === "" ? null : newProduct.drop_id, image_url: finalImages[0] || "", gallery: finalImages.slice(1), description: newProduct.description.trim() };
      if (editingId) await supabase.from("products").update(payload).eq("id", editingId);
      else await supabase.from("products").insert([payload]);
      cancelEditProduct(); await cargarProductos();
    } catch (error: any) { alert("Error: " + error.message); } finally { setIsUploading(false); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Eliminar producto?")) return;
    await supabase.from("products").delete().eq("id", id); await cargarProductos();
  };

  const filteredProducts = products.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = p.title ? p.title.toLowerCase().includes(searchLower) : false;
    const categoryMatch = p.category ? p.category.toLowerCase().includes(searchLower) : false;
    const dropMatch = selectedDropFilter === "all" ? true : selectedDropFilter === "none" ? p.drop_id === null : p.drop_id === selectedDropFilter;
    return (titleMatch || categoryMatch) && dropMatch;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold uppercase animate-pulse">Cargando...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col md:flex-row font-sans text-gray-900">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col shrink-0 shadow-sm z-10">
        <div className="mb-12">
          <h1 className="font-serif text-2xl text-black uppercase tracking-widest font-bold">Style Season</h1>
        </div>
        <nav className="flex flex-col gap-1 mb-10">
          <button onClick={() => {setActiveTab("dashboard"); setIsAddingNew(false);}} className={`flex items-center gap-3 px-4 py-3 text-xs tracking-wider rounded-lg transition-all ${activeTab === "dashboard" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-50"}`}><LayoutDashboard size={16} /> Dashboard</button>
          <button onClick={() => {setActiveTab("drops"); setIsAddingNew(false);}} className={`flex items-center gap-3 px-4 py-3 text-xs tracking-wider rounded-lg transition-all ${activeTab === "drops" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-50"}`}><Calendar size={16} /> Drops</button>
          <button onClick={() => {setActiveTab("products"); setIsAddingNew(false);}} className={`flex items-center gap-3 px-4 py-3 text-xs tracking-wider rounded-lg transition-all ${activeTab === "products" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-50"}`}><Package size={16} /> Inventario</button>
          <button onClick={() => {setActiveTab("settings"); setIsAddingNew(false);}} className={`flex items-center gap-3 px-4 py-3 text-xs tracking-wider rounded-lg transition-all ${activeTab === "settings" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-50"}`}><Palette size={16} /> Diseño Web</button>
        </nav>
        <nav className="flex flex-col gap-1 border-t border-gray-100 pt-8">
          <Link href="/" target="_blank" className="flex items-center gap-3 px-4 py-2 text-xs tracking-wider text-gray-600 hover:text-black transition-colors"><Home size={14} /> Tienda Online</Link>
        </nav>
        <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="mt-auto flex items-center justify-center gap-2 w-full py-3 text-[10px] tracking-widest uppercase font-bold bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><LogOut size={14} /> Cerrar Sesión</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        
        {/* PESTAÑA: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="max-w-6xl mx-auto animate-in fade-in">
            <header className="mb-8"><h2 className="text-2xl font-bold uppercase text-black">Resumen Operativo</h2></header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
                <div><p className="text-xs text-gray-500 font-bold uppercase mb-1">Drops Creados</p><h3 className="text-3xl font-bold">{drops.length}</h3></div>
                <div className="p-3 bg-gray-50 rounded-lg"><Calendar size={20} className="text-gray-700"/></div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
                <div><p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Productos</p><h3 className="text-3xl font-bold">{products.length}</h3></div>
                <div className="p-3 bg-gray-50 rounded-lg"><Package size={20} className="text-gray-700"/></div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
                <div><p className="text-xs text-gray-500 font-bold uppercase mb-1">Drop Activo</p><h3 className="text-lg font-bold mt-1 line-clamp-1">{drops.find(d => d.is_active)?.name || "Ninguno"}</h3></div>
                <div className="p-3 bg-green-50 rounded-lg"><CheckCircle2 size={20} className="text-green-600"/></div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: DROPS */}
        {activeTab === "drops" && (
          <div className="max-w-5xl mx-auto animate-in fade-in">
             <header className="mb-8"><h2 className="text-2xl font-bold uppercase text-black">Gestión de Drops</h2></header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <form onSubmit={handleSaveDrop} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-10">
                  <h3 className="text-sm font-bold uppercase mb-6 flex justify-between">
                    {editingDropId ? "Editar Drop" : "Nuevo Drop"}
                    {editingDropId && <button type="button" onClick={() => {setEditingDropId(null); setNewDrop({name:"", launch_date:""})}} className="text-[9px] text-red-500 underline">Cancelar</button>}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-2">Nombre del Drop *</label>
                      <input type="text" value={newDrop.name} onChange={(e) => setNewDrop({...newDrop, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm uppercase" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-2">Fecha y Hora de Apertura</label>
                      <input type="datetime-local" value={newDrop.launch_date} onChange={(e) => setNewDrop({...newDrop, launch_date: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-mono" />
                    </div>
                    <button type="submit" disabled={isSavingDrop} className="w-full py-4 mt-2 bg-black text-white rounded-lg uppercase text-xs font-bold disabled:opacity-50">
                      {isSavingDrop ? "Guardando..." : editingDropId ? "Actualizar" : "Crear Drop"}
                    </button>
                  </div>
                </form>
              </div>
              <div className="lg:col-span-2 space-y-4">
                {drops.map(drop => (
                  <div key={drop.id} className={`bg-white p-6 rounded-xl border ${drop.is_active ? 'border-green-500 ring-1 ring-green-500/20' : 'border-gray-200'} flex justify-between items-center gap-4`}>
                    <div>
                      <div className="flex items-center gap-3 mb-1"><h4 className="font-bold text-lg uppercase">{drop.name}</h4>{drop.is_active && <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Activo</span>}</div>
                      <div className="text-xs font-mono text-gray-500">{drop.launch_date ? new Date(drop.launch_date).toLocaleString('es-AR') : "Sin contador"}</div>
                    </div>
                    <div className="flex gap-2">
                      {!drop.is_active && <button onClick={() => handleSetDropActive(drop.id)} className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-[10px] font-bold uppercase">Activar</button>}
                      <button onClick={() => startEditDrop(drop)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteDrop(drop.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: INVENTARIO */}
        {activeTab === "products" && (
          <div className="max-w-6xl mx-auto animate-in fade-in">
            {!isAddingNew ? (
              <>
                <header className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold uppercase text-black">Inventario</h2>
                  <button onClick={() => setIsAddingNew(true)} className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg text-xs font-bold uppercase"><Plus size={16} /> Añadir Producto</button>
                </header>
                <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex gap-4">
                  <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" />
                  <select value={selectedDropFilter} onChange={(e) => setSelectedDropFilter(e.target.value)} className="w-64 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold uppercase">
                    <option value="all">TODOS LOS DROPS</option><option value="none">SIN DROP</option>
                    {drops.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="bg-white border border-gray-200 rounded-b-xl shadow-sm overflow-hidden">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 text-[10px] uppercase font-bold">
                      <tr><th className="px-6 py-4">Producto</th><th className="px-6 py-4">Drop</th><th className="px-6 py-4">Categoría</th><th className="px-6 py-4">Precio</th><th className="px-6 py-4 text-right">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 flex items-center gap-4">
                            <div className="w-10 h-12 bg-gray-100 rounded border border-gray-200 overflow-hidden">{p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="p-2 text-gray-300" />}</div>
                            <span className="font-bold uppercase">{p.title}</span>
                          </td>
                          <td className="px-6 py-4">{p.drops ? <span className="text-[10px] font-bold uppercase bg-gray-100 px-3 py-1 rounded-sm border">{p.drops.name}</span> : <span className="text-[10px] font-bold uppercase text-gray-400">Inventario Base</span>}</td>
                          <td className="px-6 py-4 text-[10px] font-bold uppercase text-gray-500">{p.category}</td>
                          <td className="px-6 py-4 font-mono">${p.price.toLocaleString('es-AR')}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => startEditProduct(p)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg mr-2"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="max-w-4xl mx-auto animate-in fade-in">
                <header className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold uppercase text-black">{editingId ? "Editar Producto" : "Nuevo Producto"}</h2>
                  <button onClick={cancelEditProduct} className="text-xs font-bold uppercase text-gray-500 hover:text-black">Volver</button>
                </header>
                <form onSubmit={handleSaveProduct} className="space-y-6">
                  <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
                    <h3 className="text-sm font-bold uppercase border-b pb-4"><AlignLeft size={16} className="inline mr-2"/> Info</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2"><label className="block text-[11px] font-bold uppercase mb-2">Nombre *</label><input type="text" value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm" required /></div>
                      <div><label className="block text-[11px] font-bold uppercase mb-2">Precio *</label><input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono" required /></div>
                      <div><label className="block text-[11px] font-bold uppercase mb-2">Categoría *</label><input type="text" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm uppercase" required /></div>
                      <div className="col-span-2">
                        <label className="block text-[11px] font-bold uppercase mb-2">Drop</label>
                        <select value={newProduct.drop_id} onChange={e => setNewProduct({...newProduct, drop_id: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold uppercase">
                          <option value="">SIN DROP</option>{drops.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2"><label className="block text-[11px] font-bold uppercase mb-2">Descripción</label><textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm h-24" /></div>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
                    <h3 className="text-sm font-bold uppercase border-b pb-4"><ImageIcon size={16} className="inline mr-2"/> Imágenes</h3>
                    <div className="grid grid-cols-4 gap-4">
                      {existingImages.map((url, i) => <div key={i} className="relative aspect-[4/5] bg-gray-100 rounded-lg border overflow-hidden"><img src={url} className="w-full h-full object-cover" /><button type="button" onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 rounded uppercase font-bold">Quitar</button></div>)}
                      {previewUrls.map((url, i) => <div key={i} className="relative aspect-[4/5] bg-gray-100 rounded-lg border border-dashed overflow-hidden"><img src={url} className="w-full h-full object-cover opacity-80" /><button type="button" onClick={() => {setImageFiles(prev => prev.filter((_, idx) => idx !== i)); setPreviewUrls(prev => prev.filter((_, idx) => idx !== i));}} className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 rounded uppercase font-bold">Quitar</button></div>)}
                      <label className="aspect-[4/5] rounded-lg border-2 border-dashed bg-gray-50 flex flex-col items-center justify-center cursor-pointer"><Plus size={20} className="mb-2 text-gray-400" /><span className="text-[10px] font-bold uppercase text-gray-500">Foto</span><input type="file" multiple accept="image/*" onChange={(e) => {if (e.target.files) {const newFiles = Array.from(e.target.files); setImageFiles(prev => [...prev, ...newFiles]); setPreviewUrls(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);}}} className="hidden" /></label>
                    </div>
                  </div>
                  <button type="submit" disabled={isUploading} className="w-full py-4 bg-black text-white rounded-lg font-bold uppercase text-xs disabled:opacity-50">{isUploading ? "Guardando..." : "Publicar Producto"}</button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: DISEÑO WEB */}
        {activeTab === "settings" && (
          <div className="max-w-4xl mx-auto animate-in fade-in">
             <header className="mb-8"><h2 className="text-2xl font-bold uppercase text-black">Diseño de Portada</h2></header>
            <form onSubmit={handleSaveSettings} className="space-y-8">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold uppercase mb-6">Cinta de Anuncios (Marquee)</h3>
                <input type="text" value={homeSettings.marquee_text} onChange={e => setHomeSettings({...homeSettings, marquee_text: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold uppercase mb-6">Banner Principal</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2"><label className="block text-[10px] font-bold uppercase mb-2">Imagen (URL)</label><input type="text" value={homeSettings.hero_image} onChange={e => setHomeSettings({...homeSettings, hero_image: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm" /></div>
                  <div className="col-span-2"><label className="block text-[10px] font-bold uppercase mb-2">Subtítulo</label><input type="text" value={homeSettings.hero_subtitle} onChange={e => setHomeSettings({...homeSettings, hero_subtitle: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm" /></div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold uppercase mb-6">Banners Mitad de Página</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4 border p-4 rounded-lg bg-gray-50"><h4 className="font-bold text-xs uppercase text-gray-500">Izquierdo</h4><input type="text" placeholder="URL imagen" value={homeSettings.b1_img} onChange={e => setHomeSettings({...homeSettings, b1_img: e.target.value})} className="w-full p-2 border rounded text-sm" /><input type="text" placeholder="Título" value={homeSettings.b1_title} onChange={e => setHomeSettings({...homeSettings, b1_title: e.target.value})} className="w-full p-2 border rounded text-sm" /><input type="text" placeholder="Botón" value={homeSettings.b1_btn} onChange={e => setHomeSettings({...homeSettings, b1_btn: e.target.value})} className="w-full p-2 border rounded text-sm" /></div>
                  <div className="space-y-4 border p-4 rounded-lg bg-gray-50"><h4 className="font-bold text-xs uppercase text-gray-500">Derecho</h4><input type="text" placeholder="URL imagen" value={homeSettings.b2_img} onChange={e => setHomeSettings({...homeSettings, b2_img: e.target.value})} className="w-full p-2 border rounded text-sm" /><input type="text" placeholder="Título" value={homeSettings.b2_title} onChange={e => setHomeSettings({...homeSettings, b2_title: e.target.value})} className="w-full p-2 border rounded text-sm" /><input type="text" placeholder="Botón" value={homeSettings.b2_btn} onChange={e => setHomeSettings({...homeSettings, b2_btn: e.target.value})} className="w-full p-2 border rounded text-sm" /></div>
                </div>
              </div>
              <button type="submit" disabled={isSavingSettings} className="w-full py-4 bg-black text-white rounded-lg uppercase text-xs font-bold">{isSavingSettings ? "Guardando..." : "Publicar Diseño"}</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}