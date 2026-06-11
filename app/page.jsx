"use client";

import { useState, useEffect } from "react";

export default function App() {

  const [data, setData] = useState([]);
  const [ratio, setRatio] = useState(10);
  const [history, setHistory] = useState({});
  const [selectedMeal, setSelectedMeal] = useState("cena");

  // 🔥 SUBIR FOTO
  const handleUpload = async (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();

    reader.onloadend = async () => {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ images: [reader.result] }),
      });

      const result = await res.json();

      const enriched = result.map(item => {
        let gramos = 0;

        if (item.piezas && item.gramos_por_pieza) {
          gramos = item.piezas * item.gramos_por_pieza;
        } else if (item.cantidad) {
          gramos = item.cantidad;
        }

        return {
          ...item,
          gramos,
          piezas: item.piezas || 0
        };
      });

      setData(enriched);
    };

    reader.readAsDataURL(file);
  };

  const hc = (g) => g * 0.3;

  // 🔥 GUARDAR POR DÍAS Y COMIDAS
  const guardar = () => {
    const fecha = new Date().toLocaleDateString();

    const newEntry = {
      meal: selectedMeal,
      items: data,
      totalHC: data.reduce((acc, i) => acc + hc(i.gramos), 0)
    };

    const updated = { ...history };

    if (!updated[fecha]) updated[fecha] = [];

    updated[fecha].push(newEntry);

    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));
  };

  useEffect(() => {
    const saved = localStorage.getItem("history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  return (
    <div style={{ display: "flex", fontFamily: "-apple-system" }}>

      {/* 🔥 PANEL IZQUIERDO */}
      <div style={{
        width: 260,
        background: "#111",
        color: "white",
        padding: 15,
        height: "100vh",
        overflow: "auto"
      }}>
        <h3>📅 Historial</h3>

        {Object.keys(history).map((day, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <strong>{day}</strong>

            {history[day].map((meal, j) => (
              <div key={j} style={{
                marginTop: 10,
                padding: 10,
                background: "#222",
                borderRadius: 10
              }}>
                🍽 {meal.meal}
                <br />
                HC: {meal.totalHC.toFixed(1)} g
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 🔥 APP */}
      <div style={{
        flex: 1,
        background: "#F2F2F7",
        padding: 20,
        display: "flex",
        justifyContent: "center"
      }}>

        <div style={{ width: 380 }}>

          <h2>💉 GlucoMate</h2>

          <input
            value={ratio}
            onChange={(e) => setRatio(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 12,
              marginBottom: 20
            }}
          />

          {/* 🔥 COMIDAS */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {["desayuno","comida","merienda","cena","snack"].map(m => (
              <button
                key={m}
                onClick={() => setSelectedMeal(m)}
                style={{
                  padding: 8,
                  borderRadius: 10,
                  background: selectedMeal === m ? "#007AFF" : "#ddd"
                }}
              >
                {m}
              </button>
            ))}
          </div>

          {/* 🔥 FOTO */}
          <label style={{
            background: "#007AFF",
            color: "white",
            padding: 15,
            borderRadius: 20,
            display: "block",
            textAlign: "center",
            marginBottom: 20
          }}>
            📷 Analizar comida
            <input type="file" hidden onChange={handleUpload} />
          </label>

          {/* 🔥 RESULTADOS */}
          {data.map((item, i) => {
            const gramos = item.gramos;
            const hidratos = hc(gramos);
            const insulina = hidratos / ratio;

            return (
              <div key={i} style={{
                background: "white",
                padding: 15,
                borderRadius: 20,
                marginBottom: 15
              }}>
                <input
                  value={item.nombre}
                  onChange={(e) => {
                    const copy = [...data];
                    copy[i].nombre = e.target.value;
                    setData(copy);
                  }}
                  style={{ width: "100%", marginBottom: 10 }}
                />

                {/* 🔥 PIEZAS EDITABLE */}
                <div>
                  🍣 piezas:
                  <input
                    type="number"
                    value={item.piezas}
                    onChange={(e) => {
                      const copy = [...data];
                      copy[i].piezas = Number(e.target.value);
                      copy[i].gramos =
                        copy[i].piezas * (item.gramos_por_pieza || 30);
                      setData(copy);
                    }}
                    style={{ width: 60, marginLeft: 10 }}
                  />
                </div>

                <p>{gramos} g</p>
                <p>HC: {hidratos.toFixed(1)} g</p>
                <p>💉 {insulina.toFixed(1)} u</p>

                <input
                  type="range"
                  min="0"
                  max="400"
                  value={gramos}
                  onChange={(e) => {
                    const copy = [...data];
                    copy[i].gramos = Number(e.target.value);
                    setData(copy);
                  }}
                  style={{ width: "100%" }}
                />
              </div>
            );
          })}

          <button onClick={guardar} style={{
            width: "100%",
            padding: 15,
            background: "green",
            color: "white",
            borderRadius: 20
          }}>
            Guardar comida
          </button>

        </div>
      </div>
    </div>
  );
}