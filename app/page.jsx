"use client";

import { useState } from "react";

export default function App() {

  const [resultado, setResultado] = useState([]);
  const [meal, setMeal] = useState("cena");
  const [ratio, setRatio] = useState(10);

  // ICONOS REALES
  const meals = {
    desayuno: "🥐",
    comida: "🍽️",
    merienda: "☕",
    cena: "🌙"
  };

  const calcularHC = (nombre, gramos) => {
    const n = nombre.toLowerCase();

    if (n.includes("arroz") || n.includes("sushi")) return gramos * 0.30;
    if (n.includes("pan")) return gramos * 0.50;
    if (n.includes("pasta")) return gramos * 0.25;

    return gramos * 0.15;
  };

  const consejo = (nombre) => {
    const n = nombre.toLowerCase();

    if (n.includes("sushi") || n.includes("arroz"))
      return "⚠️ IG alto → prebolo 10-15 min";

    if (n.includes("pizza") || n.includes("pasta"))
      return "🍕 absorción lenta → bolo extendido";

    return "🟢 impacto bajo";
  };

  // 📷 SUBIR / CÁMARA
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);

    const base64Images = await Promise.all(
      files.map(file => new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      }))
    );

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ images: base64Images })
    });

    const data = await res.json();
    setResultado(data);
  };

  // 🔥 EDITAR NOMBRE
  const cambiarNombre = (i, val) => {
    const copia = [...resultado];
    copia[i].nombre = val;
    setResultado(copia);
  };

  // 🔥 EDITAR GRAMOS
  const cambiarGramos = (i, val) => {
    const copia = [...resultado];
    copia[i].cantidad = Number(val);
    setResultado(copia);
  };

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont",
      background: "#F2F2F7",
      minHeight: "100vh",
      padding: 20,
      display: "flex",
      justifyContent: "center"
    }}>

      <div style={{ width: 420 }}>

        {/* HEADER */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20
        }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: 16,
            background: "linear-gradient(135deg,#007AFF,#5AC8FA)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24
          }}>
            💉
          </div>

          <h1 style={{ margin: 0 }}>GlucoMate</h1>
        </div>

        {/* RATIO */}
        <input
          value={ratio}
          onChange={(e) => setRatio(e.target.value)}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 14,
            border: "none",
            marginBottom: 20,
            fontSize: 16
          }}
        />

        {/* COMIDAS CON ICONOS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {Object.keys(meals).map(t => (
            <button
              key={t}
              onClick={() => setMeal(t)}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 20,
                border: "none",
                background: meal === t ? "#007AFF" : "#E5E5EA",
                color: meal === t ? "white" : "black",
                fontWeight: 600
              }}
            >
              {meals[t]} {t}
            </button>
          ))}
        </div>

        {/* BOTÓN CÁMARA */}
        <label style={{
          display: "block",
          background: "linear-gradient(135deg,#007AFF,#5AC8FA)",
          padding: 18,
          borderRadius: 20,
          textAlign: "center",
          color: "white",
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 20
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

        {/* RESULTADOS */}
        {resultado.map((item, i) => {
          const hc = calcularHC(item.nombre, item.cantidad);
          const insulina = hc / ratio;

          return (
            <div key={i} style={{
              background: "white",
              padding: 16,
              borderRadius: 20,
              marginBottom: 16,
              boxShadow: "0 6px 16px rgba(0,0,0,0.1)"
            }}>

              {/* 🔥 EDITAR NOMBRE */}
              <input
                value={item.nombre}
                onChange={(e) => cambiarNombre(i, e.target.value)}
                style={{
                  width: "100%",
                  fontSize: 16,
                  fontWeight: 600,
                  border: "none",
                  marginBottom: 10
                }}
              />

              {/* SLIDER */}
              <input
                type="range"
                min="0"
                max="400"
                value={item.cantidad}
                onChange={(e) => cambiarGramos(i, e.target.value)}
                style={{ width: "100%" }}
              />

              <p>{item.cantidad} g</p>

              <p>HC: {hc.toFixed(1)} g</p>

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