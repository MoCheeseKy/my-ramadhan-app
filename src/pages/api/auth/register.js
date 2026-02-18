import { supabase } from '@/lib/supabase';
import { customAlphabet } from 'nanoid';

const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Menghindari karakter ambigu
const generateCode = customAlphabet(alphabet, 6);

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method not allowed' });

  const { username } = req.body;
  const personalCode = `RM-${generateCode()}`;

  const { data, error } = await supabase
    .from('users')
    .insert([{ username, personal_code: personalCode }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.status(200).json(data);
}
