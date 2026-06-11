"use client";

import { useState } from "react";

export default function App() {
  const [resultado, setResultado] = useState([]);
  const [comidaSeleccionada, setComidaSeleccionada] = useState("comida");

  const ratioInsulina = 10;

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);

    const base64Images = await Promise.all(
      files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      })
    );

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ images: base64Images }),
    });

    const data = await res.json();

    // 🔥 añadimos estado editable
    const enriched = data.map((item) => ({
      ...item,
      gramos: item.unidad === "gramos" ? item.cantidad : 0,
      piezas: item.unidad === "unidades" ? item.cantidad : 0,
    }));

    setResultado(enriched);
  };

  const calcularHC = (nombre, gramos) => {
    if (nombre.includes("arroz")) return gramos * 0.3;
    if (nombre.includes("pan")) return gramos * 0.5;
    if (nombre.includes("pasta")) return gramos * 0.25;
    return gramos * 0.15;
  };

  const getColor = (hc) => {
    if (hc < 10) return "green";
    if (hc < 30) return "orange";
    return "red";
  };

  const actualizarGramos = (index, gramos) => {
    const nuevo = [...resultado];
    nuevo[index].gramos = gramos;
    setResultado(nuevo);
  };

  const actualizarPiezas = (index, piezas) => {
    const nuevo = [...resultado];
    nuevo[index].piezas = piezas;

    // 🍣 conversión automática
    nuevo[index].gramos = piezas * 35;

    setResultado(nuevo);
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>🍽️ HC Vision PRO</h1>

      <input
        type="file"
        multiple
        accept="image/*"
        capture="environment"
        onChange={handleUpload}
      />

      <h2 style={{ marginTop: 20 }}>Resultados:</h2>

      {resultado.map((item, i) => {
        const hc = calcularHC(item.nombre, item.gramos);
        const insulina = (hc / ratioInsulina).toFixed(1);

        const esMaki = item.nombre.toLowerCase().includes("maki");

        return (
          <div key={i} style={{
            background: "#fff",
            padding: 15,
            marginTop: 10,
            borderRadius: 10,
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
          }}>
            <strong>{item.nombre}</strong>

            {/* 🍣 MODO PIEZAS */}
            {esMaki && (
              <div>
                <p>🍣 Piezas:</p>
                <input
                  type="number"
                  value={item.piezas}
                  onChange={(e) =>
                    actualizarPiezas(i, Number(e.target.value))
                  }
                />
              </div>
            )}

            {/* ✏️ SLIDER GRAMOS */}
            <p>Gramos: {item.gramos}</p>
            <input
              type="range"
              min="0"
              max="400"
              value={item.gramos}
              onChange={(e) =>
                actualizarGramos(i, Number(e.target.value))
              }
              style={{ width: "100%" }}
            />

            <p>HC: {hc.toFixed(1)} g</p>

            <div style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: getColor(hc)
            }} />

            <p>💉 Insulina: {insulina} u</p>
          </div>
        );
      })}
    </div>
  );
}