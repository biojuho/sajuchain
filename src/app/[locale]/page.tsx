'use client';

import React from 'react';
import SajuAppRedesigned from '@/components/SajuAppRedesigned';

export default function Home() {
  return (
    <main>
      <React.Suspense fallback={<div className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center">로딩 중...</div>}>
        <SajuAppRedesigned />
      </React.Suspense>
    </main>
  );
}
