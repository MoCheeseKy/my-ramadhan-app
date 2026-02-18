import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method not allowed' });

  const { personalCode } = req.body;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('personal_code', personalCode)
    .single();

  if (error || !data)
    return res.status(404).json({ message: 'Kode tidak valid.' });
  return res.status(200).json(data);
}
