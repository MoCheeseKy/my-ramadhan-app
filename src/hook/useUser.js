import { useEffect, useState } from 'react';
import { getStoredUser } from '@/lib/auth';

export default function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getStoredUser();
    setUser(u);
    setLoading(false);
  }, []);

  return { user, loading };
}
