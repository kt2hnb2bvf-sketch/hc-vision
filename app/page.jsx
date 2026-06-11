"use client";

import { useState, useEffect } from "react";

export default function App() {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modoNoche, setModoNoche] = useState(false);
  const [historial, setHistorial] = useState([]);

  // 🔥 Cargar historial guardado
  useEffect(() => {
    const saved = localStorage.getItem("historial");
    if (saved) setHistorial(JSON.parse(saved));
  }, []);

  // 🔥 Guardar historial
  const guardarComida = (data) => {
    const nuevo = [...historial, { fecha: new Date(), data }];
    setHistorial(nuevo);
    localStorage.setItem("historial", JSON.stringify(nuevo));
  };

  // 🔥 SEMÁFORO
  const getColor = (hc) => {
    if (hc < 20) return "green";
    if (hc < 50) return "orange";
    return "red";
  };

  // 🔥 SUBIR IMÁGENES
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

    // 🔥 AÑADIMOS HC + INSULINA
    const enriquecido = data.map(item => {
      const hc = item.cantidad * 0.3; // estimación simple
      const insulina = hc / 10;

      return {
        ...item,
        hc,
        insulina
      };
    });

    setResultado(enriquecido);
    guardarComida(enriquecido);
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: modoNoche ? "#1a1a1a" : "#f5f7fb",
      color: modoNoche ? "white" : "black",
      padding: 30,
      fontFamily: "system-ui"
    }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>🍽️ HC Vision</h1>

        <button onClick={() => setModoNoche(!modoNoche)}>
          {modoNoche ? "☀️ Día" : "🌙 Noche"}
        </button>
      </div>

      {/* BOTÓN */}
      <label style={{
        display: "inline-block",
        padding: "14px 20px",
        background: "#0070f3",
        color: "white",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "bold",
        marginTop: 20
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

      {loading && <p>🔍 Analizando...</p>}

      {/* RESULTADOS */}
      {resultado && (
        <div style={{ marginTop: 30 }}>
          <h2>Resultados:</h2>

          {resultado.map((item, i) => (
            <div key={i} style={{
              background: modoNoche ? "#2a2a2a" : "white",
              padding: 15,
              marginTop: 10,
              borderRadius: 12,
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
            }}>
              <strong>{item.nombre}</strong>

              <p>{item.cantidad} {item.unidad}</p>

              <p>HC: {item.hc.toFixed(1)} g</p>

              {/* 🔴🟡🟢 SEMÁFORO */}
              <div style={{
                width: 15,
                height: 15,
                borderRadius: "50%",
                background: getColor(item.hc)
              }} />

              <p>💉 Insulina estimada: {item.insulina.toFixed(1)} u</p>

              {/* 🔁 BOTÓN REANALIZAR */}
              <button
                style={{ marginTop: 10 }}
                onClick={() => alert("Reanaliza subiendo otra foto")}
              >
                🔄 Verificar alimento
              </button>
            </div>
          ))}
        </div>
      )}

      {/* HISTORIAL */}
      <div style={{ marginTop: 40 }}>
        <h2>📊 Historial</h2>

        {historial.map((item, i) => (
          <div key={i} style={{
            marginTop: 10,
            padding: 10,
            background: modoNoche ? "#2a2a2a" : "#eee",
            borderRadius: 10
          }}>
            {new Date(item.fecha).toLocaleString()}
          </div>
        ))}
      </div>
    </div>
  );
}