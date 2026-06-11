"use client";

import { useState, useEffect } from "react";

export default function App() {
  const [resultado, setResultado] = useState([]);
  const [diario, setDiario] = useState([]);
  const [comidaSeleccionada, setComidaSeleccionada] = useState("comida");

  const [ratio, setRatio] = useState(10); // g HC por unidad
  const [glucosa, setGlucosa] = useState(100);
  const objetivo = 100;
  const factorSensibilidad = 50;

  // 🔥 CARGAR HISTORIAL
  useEffect(() => {
    const data = localStorage.getItem("diario");
    if (data) setDiario(JSON.parse(data));
  }, []);

  // 🔥 GUARDAR HISTORIAL
  useEffect(() => {
    localStorage.setItem("diario", JSON.stringify(diario));
  }, [diario]);

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

  const calcularInsulina = (hc) => {
    const boloHC = hc / ratio;
    const correccion = (glucosa - objetivo) / factorSensibilidad;
    return Math.max(0, boloHC + correccion).toFixed(1);
  };

  const actualizarGramos = (i, gramos) => {
    const nuevo = [...resultado];
    nuevo[i].gramos = gramos;
    setResultado(nuevo);
  };

  const actualizarPiezas = (i, piezas) => {
    const nuevo = [...resultado];
    nuevo[i].piezas = piezas;
    nuevo[i].gramos = piezas * 35;
    setResultado(nuevo);
  };

  const guardarComida = () => {
    const comida = {
      fecha: new Date().toLocaleString(),
      tipo: comidaSeleccionada,
      items: resultado,
      glucosa,
    };

    setDiario([comida, ...diario]);
    setResultado([]);
  };

  const comidas = [
    { key: "desayuno", label: "🍳 Desayuno" },
    { key: "comida", label: "🍽️ Comida" },
    { key: "merienda", label: "☕ Merienda" },
    { key: "cena", label: "🌙 Cena" },
  ];

  return (
    <div style={{ padding: 20, fontFamily: "Arial", background: "#f5f5f5" }}>
      <h1>🍽️ HC Vision PRO+</h1>

      {/* ⚙️ CONFIGURACIÓN */}
      <div style={{ marginBottom: 20 }}>
        <h3>⚙️ Ajustes</h3>

        <p>Ratio insulina (g HC / unidad):</p>
        <input
          type="number"
          value={ratio}
          onChange={(e) => setRatio(Number(e.target.value))}
        />

        <p>Glucosa actual (mg/dL):</p>
        <input
          type="number"
          value={glucosa}
          onChange={(e) => setGlucosa(Number(e.target.value))}
        />
      </div>

      {/* 🍽️ SELECCIÓN COMIDA */}
      <div style={{ display: "flex", gap: 10 }}>
        {comidas.map((c) => (
          <button
            key={c.key}
            onClick={() => setComidaSeleccionada(c.key)}
            style={{
              padding: 10,
              background: comidaSeleccionada === c.key ? "#0070f3" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: 8,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 📷 FOTO */}
      <input
        type="file"
        multiple
        accept="image/*"
        capture="environment"
        onChange={handleUpload}
        style={{ marginTop: 20 }}
      />

      {/* RESULTADOS */}
      <h2>Resultados</h2>

      {resultado.map((item, i) => {
        const hc = calcularHC(item.nombre, item.gramos);
        const insulina = calcularInsulina(hc);
        const esMaki = item.nombre.includes("maki");

        return (
          <div key={i} style={{
            background: "white",
            padding: 15,
            marginTop: 10,
            borderRadius: 10
          }}>
            <strong>{item.nombre}</strong>

            {esMaki && (
              <>
                <p>Piezas:</p>
                <input
                  type="number"
                  value={item.piezas}
                  onChange={(e) =>
                    actualizarPiezas(i, Number(e.target.value))
                  }
                />
              </>
            )}

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
            <p>💉 Insulina recomendada: {insulina} u</p>
          </div>
        );
      })}

      {resultado.length > 0 && (
        <button
          onClick={guardarComida}
          style={{
            marginTop: 20,
            padding: 15,
            background: "green",
            color: "white",
            border: "none",
            borderRadius: 10,
          }}
        >
          ✅ Guardar comida
        </button>
      )}

      {/* 📅 HISTORIAL */}
      <h2 style={{ marginTop: 30 }}>📅 Historial</h2>

      {diario.map((d, i) => (
        <div key={i} style={{
          background: "#ddd",
          padding: 10,
          marginTop: 10,
          borderRadius: 8
        }}>
          <strong>{d.tipo.toUpperCase()}</strong> — {d.fecha}
          <p>Glucosa: {d.glucosa} mg/dL</p>
        </div>
      ))}
    </div>
  );
}