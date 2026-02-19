import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method not allowed' });

  const { personalCode, city } = req.body;

  const { data, error } = await supabase
    .from('users')
    .update({ location_city: city })
    .eq('personal_code', personalCode)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
}
