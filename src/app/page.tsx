"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, Flame, Leaf, Fish, Beef, ChevronDown, ChevronUp, Loader2, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

export default function RecipeApp() {
  const [recipes, setRecipes] = useState([]); // Inicializado como array vacío
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Todas');

  const categories = [
    { name: 'Todas', icon: <BookOpen size={18}/> },
    { name: 'Sopas', icon: <Search size={18}/> },
    { name: 'Carnes', icon: <Beef size={18}/> },
    { name: 'Pescados', icon: <Fish size={18}/> },
  ];

  useEffect(() => {
    try {
      const q = query(collection(db, "recipes"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        setRecipes(docs);
        setLoading(false);
      }, (error) => {
        console.error("Error en Firebase:", error);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (e) {
      console.error("Error de conexión:", e);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-[#fafafa] pb-24">
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800 p-4">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">ChefAI</h1>
          <button onClick={() => setShowImport(true)} className="bg-amber-500 text-black p-2 rounded-full shadow-lg shadow-amber-500/20"><Plus size={24} /></button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Categorías */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${
                activeCategory === cat.name ? 'bg-amber-500 border-amber-500 text-black font-bold' : 'bg-[#18181b] border-zinc-800 text-zinc-400'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Listado de Recetas */}
        <div className="grid gap-6">
          {recipes?.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl">
              <p className="text-zinc-500">No hay recetas aún. Toca el + para empezar.</p>
            </div>
          ) : (
            recipes?.filter(r => activeCategory === 'Todas' || r.category === activeCategory).map((recipe) => (
              <div key={recipe.id} className="bg-[#18181b] border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="aspect-video w-full bg-zinc-900 relative">
                  <img 
                    src={recipe.imageUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000`} 
                    alt="" 
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">{recipe.title || "Receta sin título"}</h3>
                    <button onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)} className="text-amber-500">
                      {expandedId === recipe.id ? <ChevronUp /> : <ChevronDown />}
                    </button>
                  </div>
                  
                  {expandedId === recipe.id && (
                    <div className="mt-4 pt-4 border-t border-zinc-800 space-y-4 animate-in fade-in">
                      <div>
                        <p className="text-amber-500 text-xs font-bold uppercase mb-2">Ingredientes</p>
                        <ul className="list-disc pl-5 text-zinc-400 text-sm">
                          {recipe.ingredients?.map((ing, i) => <li key={i}>{ing}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Importar */}
      {showImport && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-zinc-800 w-full max-w-md rounded-3xl p-8 relative">
            <button onClick={() => setShowImport(false)} className="absolute top-4 right-4 text-zinc-500"><X/></button>
            <h2 className="text-2xl font-bold mb-6">Nueva Receta</h2>
            <input type="text" placeholder="Pega link de Instagram..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 px-4 mb-4" />
            <button className="w-full bg-amber-500 text-black font-bold py-4 rounded-xl shadow-lg shadow-amber-500/20">PROCESAR CON IA</button>
          </div>
        </div>
      )}
    </main>
  );
}