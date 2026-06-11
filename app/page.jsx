"use client";

import { useState, useEffect } from "react";

export default function App() {
  const [images, setImages] = useState([]);
  const [resultado, setResultado] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [aprendizaje, setAprendizaje] = useState({});
  const [mealType, setMealType] = useState("comida");

  const [ratio, setRatio] = useState(10);

  useEffect(() => {
    const saved = localStorage.getItem("historial");
    const learn = localStorage.getItem("aprendizaje");

    if (saved) setHistorial(JSON.parse(saved));
    if (learn) setAprendizaje(JSON.parse(learn));
  }, []);

  // 🧠 HC por alimento
  const calcularHC = (nombre, gramos) => {
    const n = nombre.toLowerCase();

    if (n.includes("arroz") || n.includes("sushi")) return gramos * 0.30;
    if (n.includes("pan")) return gramos * 0.50;
    if (n.includes("pasta")) return gramos * 0.25;

    return gramos * 0.15;
  };

  // 🚦 semáforo
  const semaforo = (hc) => {
    if (hc < 10) return "🟢";
    if (hc < 30) return "🟡";
    return "🔴";
  };

  // 🧠 recomendaciones médicas
  const infoClinica = (nombre) => {
    const n = nombre.toLowerCase();

    if (n.includes("sushi") || n.includes("arroz")) {
      return "⚠️ IG alto → haz prebolo 10-15 min antes";
    }

    if (n.includes("pizza") || n.includes("pasta")) {
      return "🍕 absorción lenta → bolo extendido";
    }

    return "🟢 impacto bajo";
  };

  // 📷 subir imágenes
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

    let data = await res.json();

    // 🧠 aplicar aprendizaje
    data = data.map(item => {
      const key = item.nombre.toLowerCase();
      if (aprendizaje[key]) {
        return { ...item, cantidad: aprendizaje[key] };
      }
      return item;
    });

    setResultado(data);
  };

  // 🔧 slider gramos
  const ajustarGramos = (i, gramos) => {
    const copia = [...resultado];
    copia[i].cantidad = Number(gramos);
    setResultado(copia);
  };

  // 💾 guardar comida + aprendizaje
  const guardar = () => {
    const nueva = {
      tipo: mealType,
      fecha: new Date().toLocaleString(),
      data: resultado
    };

    const nuevoHist = [nueva, ...historial];

    setHistorial(nuevoHist);
    localStorage.setItem("historial", JSON.stringify(nuevoHist));

    const nuevoApr = { ...aprendizaje };

    resultado.forEach(r => {
      nuevoApr[r.nombre.toLowerCase()] = r.cantidad;
    });

    setAprendizaje(nuevoApr);
    localStorage.setItem("aprendizaje", JSON.stringify(nuevoApr));

    alert("✅ guardado y aprendido");
  };

  return (
    <div style={{ fontFamily: "system-ui", padding: 20, maxWidth: 500, margin: "auto" }}>

      <h1 style={{ fontSize: 28 }}>🍽️ HC Vision PRO+</h1>

      {/* ⚙️ ajustes */}
      <div style={{ marginBottom: 20 }}>
        <p>Ratio insulina</p>
        <input value={ratio} onChange={e => setRatio(e.target.value)} />
      </div>

      {/* 🍽️ selector comidas */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["desayuno", "comida", "merienda", "cena"].map(t => (
          <button
            key={t}
            onClick={() => setMealType(t)}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 20,
              border: "none",
              background: mealType === t ? "#007AFF" : "#eee",
              color: mealType === t ? "white" : "black"
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 📷 botón iPhone */}
      <label
        style={{
          display: "block",
          padding: 20,
          borderRadius: 20,
          background: "#007AFF",
          color: "white",
          textAlign: "center",
          marginBottom: 20,
          cursor: "pointer"
        }}
      >
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
      {resultado.map((item, i) => {
        const hc = calcularHC(item.nombre, item.cantidad);
        const insulina = hc / ratio;

        return (
          <div
            key={i}
            style={{
              background: "white",
              padding: 15,
              borderRadius: 20,
              marginBottom: 15,
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
            }}
          >
            <h3>{item.nombre}</h3>

            <input
              type="range"
              min="0"
              max="400"
              value={item.cantidad}
              onChange={(e) => ajustarGramos(i, e.target.value)}
              style={{ width: "100%" }}
            />

            <p>{item.cantidad} g</p>
            <p>{semaforo(hc)} HC: {hc.toFixed(1)} g</p>
            <p>💉 {insulina.toFixed(1)} u</p>
            <p style={{ fontSize: 12 }}>{infoClinica(item.nombre)}</p>
          </div>
        );
      })}

      {resultado.length > 0 && (
        <button
          onClick={guardar}
          style={{
            width: "100%",
            padding: 15,
            borderRadius: 20,
            background: "green",
            color: "white",
            border: "none",
            marginBottom: 20
          }}
        >
          Guardar comida
        </button>
      )}

      {/* historial */}
      <h3>📊 Historial</h3>

      {historial.map((h, i) => (
        <div key={i} style={{ fontSize: 12, marginBottom: 10 }}>
          {h.tipo} - {h.fecha}
        </div>
      ))}

    </div>
  );
}