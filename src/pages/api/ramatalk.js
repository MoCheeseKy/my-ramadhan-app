import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, context } = req.body;

  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('API Key belum disetting di .env.local');
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // SOLUSI: Cukup gunakan "gemini-1.5-flash".
    // SDK terbaru akan otomatis mencarikan jalur (endpoint) yang tepat.
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `
      Kamu adalah "Ramatalk", asisten virtual Ramadhan yang hangat.
      Waktu: ${context.timeString} (${context.greeting}).
      Hari ke-${context.day} Ramadhan.
      User bertanya: "${message}"
      Jawablah dengan empati, islami, dan ringkas.
    `;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });
  } catch (error) {
    console.error('❌ ERROR BACKEND:', error);
    // Kembalikan pesan error asli agar kita bisa melihat jika ada masalah lain
    res.status(500).json({
      reply: `Maaf, ada kendala teknis: ${error.message}`,
    });
  }
}
