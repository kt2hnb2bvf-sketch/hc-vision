"use client";

import { useState } from "react";

export default function App() {
  const [resultado, setResultado] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result;

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const data = await res.json();
      setResultado(data);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif"
    }}>
      
      <h1 style={{ fontSize: 40, marginBottom: 20 }}>
        🧠 HC Vision
      </h1>

      <label style={{
        background: "#3b82f6",
        padding: "12px 20px",
        borderRadius: 10,
        cursor: "pointer"
      }}>
        📸 Subir comida
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleUpload}
          style={{ display: "none" }}
        />
      </label>

      {resultado && (
        <div style={{
          marginTop: 30,
          background: "#1e293b",
          padding: 20,
          borderRadius: 10,
          width: 300
        }}>
          <h3>Resultado:</h3>
          <pre style={{ fontSize: 12 }}>
            {JSON.stringify(resultado, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}