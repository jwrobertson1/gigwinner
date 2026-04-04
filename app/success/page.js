'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Success() {
  const router = useRouter();

  useEffect(() => {
    document.cookie = 'gigwinner_pro=true; max-age=2592000; path=/';
    setTimeout(() => router.push('/'), 3000);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '48px' }}>⚡</div>
      <h1 style={{ color: '#00ff88', fontSize: '28px', fontWeight: 'bold' }}>You're Pro!</h1>
      <p style={{ color: '#888', fontSize: '16px' }}>Redirecting you back to GigWinner...</p>
    </div>
  );
}