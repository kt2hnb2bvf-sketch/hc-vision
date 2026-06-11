"use client";

import { useState, useEffect } from "react";

export default function App() {

  const [resultado, setResultado] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [meal, setMeal] = useState("comida");
  const [ratio, setRatio] = useState(10);

  useEffect(() => {
    const saved = localStorage.getItem("historial");
    if (saved) setHistorial(JSON.parse(saved));
  }, []);

  const calcularHC = (nombre, gramos) => {
    const n = nombre.toLowerCase();

    if (n.includes("arroz") || n.includes("sushi")) return gramos * 0.30;
    if (n.includes("pan")) return gramos * 0.50;
    if (n.includes("pasta")) return gramos * 0.25;

    return gramos * 0.15;
  };

  const semaforo = (hc) => {
    if (hc < 10) return "#34C759";
    if (hc < 30) return "#FF9F0A";
    return "#FF3B30";
  };

  const consejo = (nombre) => {
    const n = nombre.toLowerCase();

    if (n.includes("sushi") || n.includes("arroz"))
      return "⚠️ Prebolo 10-15 min";

    if (n.includes("pizza") || n.includes("pasta"))
      return "🍕 Bolo extendido";

    return "🟢 Bajo impacto";
  };

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

  const ajustar = (i, val) => {
    const copia = [...resultado];
    copia[i].cantidad = Number(val);
    setResultado(copia);
  };

  const guardar = () => {
    const nueva = {
      tipo: meal,
      fecha: new Date().toLocaleString(),
      data: resultado
    };

    const nuevo = [nueva, ...historial];
    setHistorial(nuevo);

    localStorage.setItem("historial", JSON.stringify(nuevo));

    alert("Guardado ✔️");
  };

  return (
    <div style={{
      fontFamily: "-apple-system",
      background: "#F2F2F7",
      minHeight: "100vh",
      padding: 20,
      maxWidth: 500,
      margin: "auto"
    }}>

      {/* HEADER */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{
          width: 45,
          height: 45,
          borderRadius: 14,
          background: "linear-gradient(135deg,#007AFF,#5AC8FA)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 22
        }}>
          💉
        </div>

        <h1 style={{ fontSize: 28 }}>GlucoMate</h1>
      </div>

      {/* RATIO */}
      <div style={{ marginTop: 20 }}>
        <p>Ratio insulina</p>
        <input
          value={ratio}
          onChange={e => setRatio(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 12,
            border: "none",
            width: "100%"
          }}
        />
      </div>

      {/* SELECTOR */}
      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
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
              color: meal === t ? "white" : "black"
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* CÁMARA */}
      <label style={{
        display: "block",
        marginTop: 20,
        padding: 18,
        borderRadius: 20,
        background: "linear-gradient(135deg,#007AFF,#5AC8FA)",
        color: "white",
        textAlign: "center",
        fontWeight: 600,
        cursor: "pointer"
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
      <div style={{ marginTop: 20 }}>
        {resultado.map((item, i) => {
          const hc = calcularHC(item.nombre, item.cantidad);
          const insulina = hc / ratio;

          return (
            <div key={i} style={{
              background: "white",
              padding: 15,
              borderRadius: 20,
              marginBottom: 15,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              <h3>{item.nombre}</h3>

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

      {/* BOTÓN GUARDAR */}
      {resultado.length > 0 && (
        <button
          onClick={guardar}
          style={{
            width: "100%",
            padding: 15,
            borderRadius: 20,
            background: "green",
            color: "white",
            border: "none"
          }}
        >
          Guardar comida
        </button>
      )}

      {/* HISTORIAL */}
      <h3 style={{ marginTop: 30 }}>📊 Historial</h3>

      {historial.map((h, i) => (
        <div key={i} style={{ fontSize: 12 }}>
          {h.tipo} - {h.fecha}
        </div>
      ))}

    </div>
  );
}