'use client';

import React from 'react';
import { useData } from '@/lib/DataContext';
import { A3Poster } from '@/components/A3Poster';

export default function PosterPage() {
  const { suppliers, summary, lossSharePct, datasetName } = useData();

  return (
    <div className="space-y-6 animate-fadeIn">
      <A3Poster
        suppliers={suppliers}
        summary={summary}
        lossSharePct={lossSharePct}
        datasetName={datasetName}
      />
    </div>
  );
}
