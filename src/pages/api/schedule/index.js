import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Plugin ini wajib agar bisa membaca format tanggal DD-MM-YYYY dari API Aladhan
dayjs.extend(customParseFormat);

export default async function handler(req, res) {
  const city = req.query.city || 'Jakarta';
  const country = 'Indonesia';

  // --- KONFIGURASI TAHUN 2026 ---
  const currentYear = 2026;

  // Mulai tanggal 19 Februari 2026
  const startDate = dayjs(`${currentYear}-02-19`);
  const daysTarget = 30;

  try {
    // Kita mengambil data 2 bulan (Februari & Maret 2026)
    // agar saat looping 30 hari tidak terputus di akhir Februari.
    const month1 = 2; // Februari
    const month2 = 3; // Maret

    // 1. Fetch Data Bulan Februari 2026
    const res1 = await fetch(
      `http://api.aladhan.com/v1/calendarByCity/${currentYear}/${month1}?city=${city}&country=${country}&method=20`,
    );

    // 2. Fetch Data Bulan Maret 2026
    const res2 = await fetch(
      `http://api.aladhan.com/v1/calendarByCity/${currentYear}/${month2}?city=${city}&country=${country}&method=20`,
    );

    if (!res1.ok || !res2.ok)
      throw new Error('Gagal mengambil data dari API Aladhan');

    const data1 = await res1.json();
    const data2 = await res2.json();

    // 3. Gabungkan Data Mentah
    const rawData = [...data1.data, ...data2.data];

    // 4. Filtering Logic: Ambil mulai 19 Feb 2026 sebanyak 30 hari
    const schedule = [];
    let count = 0;

    for (const item of rawData) {
      if (count >= daysTarget) break;

      // Parse tanggal item (Format API: DD-MM-YYYY)
      const itemDate = dayjs(item.date.gregorian.date, 'DD-MM-YYYY');

      // Ambil jika tanggal item SAMA DENGAN atau SETELAH startDate
      if (
        itemDate.isSame(startDate, 'day') ||
        itemDate.isAfter(startDate, 'day')
      ) {
        schedule.push({
          date: item.date.readable, // Contoh: "19 Feb 2026"
          isoDate: itemDate.toISOString(),
          hijri: `${item.date.hijri.day} ${item.date.hijri.month.en} ${item.date.hijri.year}`,
          timings: {
            Imsak: item.timings.Imsak.replace(' (WIB)', ''),
            Subuh: item.timings.Fajr.replace(' (WIB)', ''),
            Dzuhur: item.timings.Dhuhr.replace(' (WIB)', ''),
            Ashar: item.timings.Asr.replace(' (WIB)', ''),
            Maghrib: item.timings.Maghrib.replace(' (WIB)', ''),
            Isya: item.timings.Isha.replace(' (WIB)', ''),
          },
        });
        count++;
      }
    }

    // 5. Kirim Response
    res.status(200).json({
      location: city,
      year: currentYear,
      info: 'Jadwal Ramadhan 2026 (Mulai 19 Feb)',
      schedule,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal memuat jadwal sholat' });
  }
}
