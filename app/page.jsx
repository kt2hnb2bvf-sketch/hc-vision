"use client";

import { useState, useEffect } from "react";

export default function App() {
  const [images, setImages] = useState([]);
  const [resultado, setResultado] = useState([]);
  const [ratio, setRatio] = useState(10);
  const [meal, setMeal] = useState("comida");

  const calcularHC = (nombre, gramos) => {
    const n = nombre.toLowerCase();

    if (n.includes("arroz") || n.includes("sushi")) return gramos * 0.30;
    if (n.includes("pan")) return gramos * 0.50;
    if (n.includes("pasta")) return gramos * 0.25;

    return gramos * 0.15;
  };

  const semaforo = (hc) => {
    if (hc < 10) return "#34C759"; // verde iOS
    if (hc < 30) return "#FF9F0A"; // naranja iOS
    return "#FF3B30"; // rojo iOS
  };

  const consejo = (nombre) => {
    const n = nombre.toLowerCase();

    if (n.includes("sushi") || n.includes("arroz")) {
      return "⚠️ Pre-bolo recomendado (IG alto)";
    }

    if (n.includes("pizza") || n.includes("pasta")) {
      return "🍕 Bolo extendido recomendado";
    }

    return "🟢 Impacto bajo";
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);

    const base64Images = await Promise.all(
      files.map(file => {
        return new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      })
    );

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ images: base64Images })
    });

    const data = await res.json();
    setResultado(data);
  };

  const ajustar = (i, val) => {
    const copia = [...resultado];
    copia[i].cantidad = Number(val);
    setResultado(copia);
  };

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont",
      background: "#F2F2F7",
      minHeight: "100vh",
      padding: 20
    }}>

      <h1 style={{ fontSize: 30, fontWeight: 700 }}>🍽️ HC Vision</h1>

      {/* selector comidas */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {["desayuno","comida","merienda","cena"].map(t => (
          <button
            key={t}
            onClick={() => setMeal(t)}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 20,
              border: "none",
              background: meal === t ? "#007AFF" : "#E5E5EA",
              color: meal === t ? "white" : "black",
              fontWeight: 500
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* botón cámara estilo iPhone */}
      <label style={{
        display: "block",
        marginTop: 20,
        padding: 18,
        borderRadius: 20,
        background: "linear-gradient(135deg,#007AFF,#5AC8FA)",
        color: "white",
        textAlign: "center",
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 6px 15px rgba(0,0,0,0.2)"
      }}>
        📷 Subir o hacer foto
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          hidden
          onChange={handleUpload}
        />
      </label>

      {/* resultados */}
      <div style={{ marginTop: 20 }}>
        {resultado.map((item, i) => {
          const hc = calcularHC(item.nombre, item.cantidad);
          const insulina = hc / ratio;

          return (
            <div key={i} style={{
              background: "white",
              borderRadius: 20,
              padding: 15,
              marginBottom: 15,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              <h3 style={{ marginBottom: 10 }}>{item.nombre}</h3>

              <input
                type="range"
                min="0"
                max="400"
                value={item.cantidad}
                onChange={(e) => ajustar(i, e.target.value)}
                style={{ width: "100%" }}
              />

              <p>{item.cantidad} g</p>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: semaforo(hc)
                }}></div>

                <p>HC: {hc.toFixed(1)} g</p>
              </div>

              <p>💉 {insulina.toFixed(1)} u</p>

              <p style={{ fontSize: 12, color: "#666" }}>
                {consejo(item.nombre)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}