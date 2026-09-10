'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [okrs, setOkrs] = useState<any[]>([]);

  // Carica gli OKR salvati da Supabase
  useEffect(() => {
    fetchOkrs();
  }, []);

  const fetchOkrs = async () => {
    const { data } = await supabase.from('okrs').select('*').order('created_at', { ascending: false });
    if (data) setOkrs(data);
  };

  const handleGenerate = async () => {
    if (!goal) return;
    setLoading(true);

    try {
      // 1. Chiamata all'API di Gemini
      const res = await fetch('/api/generate-okr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal }),
      });
      const generated = await res.json();

      // 2. Salvataggio su Supabase
      if (generated.objective) {
        await supabase.from('okrs').insert([
          { objective: generated.objective, key_results: generated.key_results }
        ]);
        setGoal('');
        fetchOkrs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1>🎯 AI OKR Tracker</h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Es: Aumentare le vendite del mio e-commerce..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button 
          onClick={handleGenerate} 
          disabled={loading}
          style={{ padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {loading ? 'Generazione...' : 'Crea OKR'}
        </button>
      </div>

      <h2>I tuoi OKR</h2>
      {okrs.map((item) => (
        <div key={item.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>{item.objective}</h3>
          <ul>
            {item.key_results?.map((kr: string, idx: number) => (
              <li key={idx}>{kr}</li>
            ))}
          </ul>
        </div>
      ))}
    </main>
  );
}
