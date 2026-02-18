import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // 1. Hanya terima request method POST (kirim data)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, context } = req.body;

  try {
    // 2. Ambil API Key dari file .env.local
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('API Key belum disetting di .env.local');
    }

    // 3. Siapkan koneksi ke Google AI
    const genAI = new GoogleGenerativeAI(apiKey);

    // PENTING: Gunakan model 'gemini-pro' (Versi Stabil & Gratis)
    // Jangan pakai 'gemini-1.5-flash' dulu karena kadang belum available di semua akun baru
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // 4. Instruksi kepribadian AI (System Prompt)
    const systemPrompt = `
      Kamu adalah "Ramatalk", asisten virtual Ramadhan.

      DATA SAAT INI:
      - Jam: ${context.timeString} (${context.greeting})
      - Hari ke-${context.day} Ramadhan

      TUGASMU:
      - Jawab pertanyaan user: "${message}"
      - Jadilah sahabat yang hangat, islami, dan suportif (bukan kaku seperti robot).
      - Gunakan bahasa Indonesia santai ("aku", "kamu") dan boleh pakai emoji (😊, 🙏).
      - Jika user curhat sedih, berikan empati dulu, baru saran.
      - Jawab ringkas saja (maksimal 3 paragraf pendek).
    `;

    // 5. Kirim ke Gemini dan tunggu jawaban
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // 6. Kirim jawaban balik ke Frontend
    res.status(200).json({ reply: text });
  } catch (error) {
    console.error('❌ ERROR BACKEND:', error);
    res.status(500).json({
      reply:
        'Maaf, Ramatalk sedang gangguan koneksi. Coba lagi sebentar lagi ya! 🙏',
    });
  }
}
