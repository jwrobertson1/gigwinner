'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tier = searchParams.get('tier') || 'starter';
    document.cookie = `gigwinner_tier=${tier}; max-age=2592000; path=/`;
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

export default function Success() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}