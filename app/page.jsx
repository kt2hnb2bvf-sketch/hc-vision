"use client";

import { useState, useEffect } from "react";

export default function App() {

  const [resultado, setResultado] = useState([]);
  const [meal, setMeal] = useState("comida");
  const [ratio, setRatio] = useState(10);
  const [history, setHistory] = useState([]);

  // ICONOS PRO
  const meals = [
    { key: "desayuno", icon: "🥐" },
    { key: "media-mañana", icon: "🧃" },
    { key: "comida", icon: "🍽️" },
    { key: "merienda", icon: "☕" },
    { key: "cena", icon: "🌙" },
    { key: "snack", icon: "🍎" }
  ];

  // 📷 SUBIR FOTO
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

    // 🔥 CONVERSIÓN INTELIGENTE A UNIDADES
    const enriched = data.map(item => {
      let unidades = "";

      if (item.nombre.toLowerCase().includes("sushi")) {
        unidades = Math.round(item.cantidad / 35) + " piezas";
      }

      if (item.nombre.toLowerCase().includes("pan")) {
        unidades = Math.round(item.cantidad / 10) + " picos";
      }

      return { ...item, unidades };
    });

    setResultado(enriched);
  };

  // HC
  const calcularHC = (nombre, gramos) => {
    const n = nombre.toLowerCase();

    if (n.includes("arroz") || n.includes("sushi")) return gramos * 0.30;
    if (n.includes("pan")) return gramos * 0.50;
    if (n.includes("pasta")) return gramos * 0.25;

    return gramos * 0.15;
  };

  // CONSEJO
  const consejo = (nombre) => {
    const n = nombre.toLowerCase();

    if (n.includes("sushi") || n.includes("arroz"))
      return "⚠️ IG alto · prebolo recomendado";

    if (n.includes("pizza"))
      return "🍕 absorción lenta · bolo extendido";

    return "🟢 impacto bajo";
  };

  // EDITAR
  const updateItem = (i, field, value) => {
    const copy = [...resultado];
    copy[i][field] = field === "cantidad" ? Number(value) : value;
    setResultado(copy);
  };

  // GUARDAR COMIDA
  const guardarComida = () => {
    const today = new Date().toLocaleDateString();

    const entry = {
      date: today,
      meal,
      items: resultado
    };

    const newHistory = [...history, entry];
    setHistory(newHistory);

    localStorage.setItem("gluco_history", JSON.stringify(newHistory));
  };

  // CARGAR HISTORIAL
  useEffect(() => {
    const saved = localStorage.getItem("gluco_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  return (
    <div style={{
      background: "#F2F2F7",
      minHeight: "100vh",
      fontFamily: "-apple-system",
      display: "flex",
      justifyContent: "center",
      padding: 20
    }}>

      <div style={{ width: 390 }}>

        <h2>💉 GlucoMate</h2>

        {/* RATIO */}
        <input
          value={ratio}
          onChange={(e) => setRatio(e.target.value)}
          style={{ width: "100%", marginBottom: 20 }}
        />

        {/* MEALS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {meals.map(m => (
            <button
              key={m.key}
              onClick={() => setMeal(m.key)}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 20,
                background: meal === m.key ? "#007AFF" : "#ddd",
                color: meal === m.key ? "white" : "black"
              }}
            >
              {m.icon}
            </button>
          ))}
        </div>

        {/* BOTÓN */}
        <label style={{
          display: "block",
          background: "#007AFF",
          padding: 16,
          borderRadius: 20,
          color: "white",
          textAlign: "center",
          marginBottom: 20
        }}>
          📷 Analizar comida
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
              padding: 15,
              borderRadius: 20,
              marginBottom: 10
            }}>
              <input
                value={item.nombre}
                onChange={(e) => updateItem(i, "nombre", e.target.value)}
                style={{ width: "100%" }}
              />

              <input
                type="range"
                min="0"
                max="400"
                value={item.cantidad}
                onChange={(e) => updateItem(i, "cantidad", e.target.value)}
              />

              <p>{item.cantidad} g · {item.unidades}</p>

              <p>HC: {hc.toFixed(1)} g</p>
              <p>💉 {insulina.toFixed(1)} u</p>

              <p>{consejo(item.nombre)}</p>
            </div>
          );
        })}

        {/* GUARDAR */}
        <button
          onClick={guardarComida}
          style={{
            width: "100%",
            padding: 16,
            background: "green",
            color: "white",
            borderRadius: 20
          }}
        >
          Guardar comida
        </button>

        {/* HISTORIAL */}
        <h3>📊 Historial</h3>

        {history.map((h, i) => (
          <div key={i} style={{
            background: "white",
            padding: 10,
            borderRadius: 15,
            marginBottom: 10
          }}>
            <p>{h.date} · {h.meal}</p>
          </div>
        ))}

      </div>
    </div>
  );
}