"use client";

import { useState } from "react";

export default function App() {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setLoading(true);

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
    <div style={{
      minHeight: "100vh",
      background: "#f5f7fb",
      padding: "30px",
      fontFamily: "system-ui"
    }}>
      
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
        🍽️ HC Vision
      </h1>

      {/* BOTÓN BONITO */}
      <label style={{
        display: "inline-block",
        padding: "14px 20px",
        background: "#0070f3",
        color: "white",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "bold"
      }}>
        📸 Subir o hacer foto

        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleUpload}
          style={{ display: "none" }}
        />
      </label>

      {/* LOADING */}
      {loading && (
        <p style={{ marginTop: 20 }}>🔍 Analizando plato...</p>
      )}

      {/* RESULTADOS BONITOS */}
      {resultado && (
        <div style={{ marginTop: 30 }}>
          <h2>Resultados:</h2>

          {resultado.map((item, i) => (
            <div key={i} style={{
              background: "white",
              padding: "15px",
              marginTop: "10px",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
            }}>
              <strong>{item.nombre}</strong>

              <p>
                {item.cantidad} {item.unidad}
              </p>

              <p>
                Confianza: {Math.round(item.confianza * 100)}%
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}