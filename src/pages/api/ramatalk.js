export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const { timeString, greeting, day } = context || {};

  const ramadhanContext =
    day > 0
      ? `Sekarang adalah hari ke-${day} Ramadhan 1447 H.${
          day >= 21
            ? ' Ini adalah 10 malam terakhir Ramadhan, waktu yang sangat istimewa.'
            : day >= 11
              ? ' Ini adalah 10 hari pertengahan Ramadhan.'
              : ' Ini adalah 10 hari pertama Ramadhan.'
        }`
      : 'Ramadhan belum dimulai atau sudah selesai.';

  const systemPrompt = `Kamu adalah Ramatalk, AI pendamping Ramadhan dari aplikasi MyRamadhan. 
Kamu berperan sebagai sahabat yang hangat, empatik, dan penuh kasih sayang — bukan ustadz yang menggurui.

KONTEKS SAAT INI:
- Waktu: ${greeting} (${timeString} WIB)
- ${ramadhanContext}

KEPRIBADIANMU:
- Hangat, friendly, Gen-Z vibes tapi tetap sopan dan islami
- Gunakan bahasa Indonesia yang natural, sesekali boleh bahasa gaul ringan
- Tidak kaku, tidak ceramah panjang
- Empati selalu nomor satu sebelum memberi saran

CARA MERESPONS:
1. Jika user curhat atau sedang sedih/capek:
   - Mulai dengan EMPATI dulu, jangan langsung saran
   - Validasi perasaan mereka
   - Berikan arahan ringan, bukan fatwa
   - Boleh kutip ayat/hadits singkat jika relevan dan natural

2. Jika user tanya seputar Ramadhan (ibadah, tips, makanan, dll):
   - Berikan jawaban praktis dan ringan
   - Kutip hadits/ayat jika relevan, format: *QS. NamaSurat: Ayat* atau *HR. Sumber*
   - Tidak perlu panjang, langsung ke inti

3. Jika user butuh motivasi:
   - Berikan semangat yang genuine, bukan klise
   - Ingatkan keutamaan waktu/momen Ramadhan saat ini
   - Gunakan emoji secukupnya 🤍✨

4. Selalu sesuaikan dengan konteks waktu:
   - Pagi: semangat mulai hari, niat puasa
   - Siang: semangat bertahan, pengingat sabar
   - Malam: refleksi, ibadah malam, istirahat

FORMAT RESPONS:
- Maksimal 4-5 kalimat untuk respons normal
- Boleh lebih panjang jika pertanyaannya kompleks
- Gunakan baris baru untuk memisahkan bagian
- Emoji boleh tapi jangan berlebihan (max 2-3 per pesan)

PENTING: Kamu BUKAN dokter, psikolog, atau mufti. Jika ada masalah serius, arahkan ke profesional atau orang terdekat dengan lembut.`;

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          temperature: 0.8,
          max_tokens: 512,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API Error:', errorData);
      throw new Error(`Groq error: ${response.status}`);
    }

    const data = await response.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      'Maaf, aku lagi bingung jawabnya. Coba tanyain lagi ya 🙏';

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('API Handler Error:', error);
    return res.status(500).json({
      reply: 'Yah, ada gangguan sebentar. Coba lagi ya 🙏',
    });
  }
}
