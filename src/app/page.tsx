"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, Flame, Leaf, Fish, Beef, ChevronDown, ChevronUp, Image as ImageIcon, Loader2, X, Check } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, onSnapshot } from 'firebase/firestore';

export default function RecipeApp() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Todas');

  // Categorías y Etiquetas de Dieta
  const categories = [
    { name: 'Todas', icon: <BookOpen size={18}/> },
    { name: 'Sopas', icon: <Search size={18}/> },
    { name: 'Carnes', icon: <Beef size={18}/> },
    { name: 'Pescados', icon: <Fish size={18}/> },
  ];

  // Cargar recetas de Firebase en tiempo real
  useEffect(() => {
    const q = query(collection(db, "recipes"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => docs.push({ id: doc.id, ...doc.data() }));
      setRecipes(docs);
    });
    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-[#09090b] text-[#fafafa] pb-24 font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800 p-4">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            ChefAI
          </h1>
          <button 
            onClick={() => setShowImport(true)}
            className="bg-amber-500 hover:bg-amber-600 text-black p-2 rounded-full transition-all active:scale-95 shadow-lg shadow-amber-500/20"
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* BUSCADOR */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar recetas, keto, carne..." 
            className="w-full bg-[#18181b] border border-zinc-800 rounded-2xl py-4 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
          />
        </div>

        {/* CATEGORÍAS */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap border transition-all ${
                activeCategory === cat.name 
                ? 'bg-amber-500 border-amber-500 text-black font-bold' 
                : 'bg-[#18181b] border-zinc-800 text-zinc-400'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* FEED DE RECETAS */}
        <div className="grid gap-6">
          {recipes.length === 0 && (
            <div className="text-center py-20 text-zinc-600">
              <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
              <p>Aún no tienes recetas. ¡Añade la primera!</p>
            </div>
          )}
          
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-[#18181b] border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
              {/* IMAGEN */}
              <div className="aspect-video w-full bg-zinc-900 relative">
                <img 
                  src={recipe.imageUrl || `https://source.unsplash.com/1600x900/?food,${recipe.category}`} 
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  {recipe.diets?.map(diet => (
                    <span key={diet} className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-amber-500 border border-amber-500/30 uppercase tracking-widest">
                      {diet}
                    </span>
                  ))}
                </div>
              </div>

              {/* CONTENIDO REDUCIDO */}
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-amber-500 text-[10px] font-bold uppercase tracking-tighter">{recipe.category}</span>
                    <h3 className="text-xl font-bold mt-1">{recipe.title}</h3>
                  </div>
                  <button 
                    onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
                    className="p-2 bg-zinc-800 rounded-full text-amber-500"
                  >
                    {expandedId === recipe.id ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                  </button>
                </div>

                {/* ACORDEÓN (MODO COCINA) */}
                {expandedId === recipe.id && (
                  <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="border-t border-zinc-800 pt-4">
                      <h4 className="font-bold text-amber-500 flex items-center gap-2 mb-3 text-sm tracking-widest uppercase">
                        Ingredientes
                      </h4>
                      <ul className="space-y-2">
                        {recipe.ingredients?.map((ing, i) => (
                          <li key={i} className="flex items-center gap-3 text-zinc-300 bg-zinc-900/50 p-2 rounded-lg text-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {ing}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-amber-500 flex items-center gap-2 mb-3 text-sm tracking-widest uppercase">
                        Preparación
                      </h4>
                      <div className="space-y-4">
                        {recipe.instructions?.map((step, i) => (
                          <div key={i} className="flex gap-4">
                            <span className="text-zinc-600 font-black text-2xl italic leading-none">{i+1}</span>
                            <p className="text-zinc-300 text-sm">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE IMPORTACIÓN */}
      {showImport && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-zinc-800 w-full max-w-md rounded-[2.5rem] p-8 relative">
            <button onClick={() => setShowImport(false)} className="absolute top-6 right-6 text-zinc-500"><X/></button>
            <h2 className="text-2xl font-bold mb-2">Importar Receta</h2>
            <p className="text-zinc-500 text-sm mb-6">Pega un link de Instagram o sube tu PDF de recetas.</p>
            
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="https://instagram.com/p/..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button className="w-full bg-zinc-800 border-2 border-dashed border-zinc-700 py-10 rounded-xl text-zinc-500 font-medium hover:border-amber-500 transition-colors">
                Arrastrar PDF aquí
              </button>
              <button 
                onClick={() => setShowImport(false)}
                className="w-full bg-amber-500 text-black font-black py-4 rounded-xl shadow-lg shadow-amber-500/20"
              >
                GENERAR CON IA
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}