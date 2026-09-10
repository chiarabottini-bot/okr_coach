import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { goal } = await req.json();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Agisci come un consulente esperto di OKR. L'utente vuole raggiungere questo obiettivo: "${goal}". 
    Genera un OKR ben strutturato in formato JSON valido con questa struttura esatta:
    {
      "objective": "Titolo dell'obiettivo chiaro e motivante",
      "key_results": ["Risultato chiave 1 misurabile", "Risultato chiave 2 misurabile", "Risultato chiave 3 misurabile"]
    }
    Rispondi SOLO ed ESCLUSIVAMENTE con il JSON, senza markdown o testo aggiuntivo.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json|```/g, '').trim();
    
    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella generazione dell\'OKR' }, { status: 500 });
  }
}
