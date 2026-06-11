"use client";

import { useState } from "react";

export default function App() {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    setLoading(true);

    // Convertir todas las imágenes a base64
    const base64Images = await Promise.all(
      files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      })
    );

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ images: base64Images }),
    });

    const data = await res.json();

    setResultado(data);
    setLoading(false);
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>🍽️ HC Vision</h1>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleUpload}
      />

      {loading && <p>Analizando...</p>}

      {resultado && (
        <pre style={{ marginTop: 20 }}>
          {JSON.stringify(resultado, null, 2)}
        </pre>
      )}
    </div>
  );
}