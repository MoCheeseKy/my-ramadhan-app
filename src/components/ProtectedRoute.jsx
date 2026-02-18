import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useUser from '@/hook/useUser';
import { Moon } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className='min-h-screen bg-[#1e3a8a] flex items-center justify-center'>
        <div className='flex flex-col items-center gap-6'>
          {/* Moon spinner */}
          <div className='relative'>
            <div className='absolute inset-0 bg-blue-400/20 blur-xl rounded-full scale-150' />
            <Moon
              size={42}
              className='text-white animate-spin [animation-duration:2.5s]'
            />
          </div>

          <p className='text-blue-200 text-sm tracking-wide'>
            Menyiapkan perjalanan Ramadhanmu...
          </p>
        </div>
      </div>
    );
  }

  return children;
}
