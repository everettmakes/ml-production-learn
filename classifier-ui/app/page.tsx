'use client';

import { useState } from 'react';

type Prediction = { label: string; confidence: number };

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setResults([]);
    setError(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setResults(data.predictions);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Image Classifier</h1>
      <p className="mt-2 text-sm text-neutral-500">
        MobileNetV2 · ImageNet · served from FastAPI
      </p>

      <label
        className="mt-8 flex h-48 cursor-pointer items-center justify-center
                   rounded-xl border-2 border-dashed border-neutral-300
                   text-neutral-500 transition hover:border-neutral-400
                   hover:bg-neutral-50"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        Drop an image here, or click to choose
      </label>

      {preview && (
        <img
          src={preview}
          alt="Uploaded preview"
          className="mt-8 w-full rounded-xl border border-neutral-200"
        />
      )}

      {loading && (
        <p className="mt-6 text-sm text-neutral-500">Classifying…</p>
      )}

      {error && (
        <p className="mt-6 text-sm text-red-600">{error}</p>
      )}

      {results.length > 0 && (
        <ul className="mt-8 space-y-3">
          {results.map((p) => (
            <li key={p.label}>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{p.label}</span>
                <span className="tabular-nums text-neutral-500">
                  {(p.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-neutral-100">
                <div
                  className="h-2 rounded-full bg-neutral-900"
                  style={{ width: `${p.confidence * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}