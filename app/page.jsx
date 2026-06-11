"use client";

import { useState, useEffect } from "react";

const TIPOS = {
  desayuno: "🍳 Desayuno",
  comida: "🍽️ Comida",
  merienda: "☕ Merienda",
  cena: "🌙 Cena"
};

export default function App() {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modoNoche, setModoNoche] = useState(false);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("historial");
    if (saved) setHistorial(JSON.parse(saved));
  }, []);

  const guardarComida = (tipo, data) => {
    const nueva = { tipo, fecha: new Date(), data };
    const nuevoHistorial = [nueva, ...historial];
    setHistorial(nuevoHistorial);
    localStorage.setItem("historial", JSON.stringify(nuevoHistorial));
  };

  // 🔥 SEMÁFORO
  const getColor = (hc) => {
    if (hc < 20) return "#4CAF50";
    if (hc < 50) return "#FFC107";
    return "#F44336";
  };

  // 🔥 DETECTAR TIPO COMIDA
  const detectarTipoComida = () => {
    const hora = new Date().getHours();
    if (hora < 11) return "desayuno";
    if (hora < 16) return "comida";
    if (hora < 20) return "merienda";
    return "cena";
  };

  // 🔥 AJUSTE DE CANTIDADES (MEJORA REAL)
  const ajustarCantidad = (item) => {
    const nombre = item.nombre.toLowerCase();

    if (nombre.includes("arroz") || nombre.includes("sushi")) {
      return item.cantidad * 1.3;
    }

    return item.cantidad;
  };

  // 🔥 HC REAL POR ALIMENTO
  const calcularHC = (item) => {
    const nombre = item.nombre.toLowerCase();

    if (nombre.includes("arroz")) return item.cantidad * 0.28;
    if (nombre.includes("pan")) return item.cantidad * 0.5;
    if (nombre.includes("pasta")) return item.cantidad * 0.25;
    if (nombre.includes("patata")) return item.cantidad * 0.17;
    if (nombre.includes("fruta")) return item.cantidad * 0.12;

    return item.cantidad * 0.1;
  };

  // 🔥 SUBIDA DE IMÁGENES
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: base64Images }),
    });

    const data = await res.json();

    const enriquecido = data.map(item => {
      const cantidadAjustada = ajustarCantidad(item);
      const hc = calcularHC({ ...item, cantidad: cantidadAjustada });
      const insulina = hc / 10;

      return {
        ...item,
        cantidad: cantidadAjustada,
        hc,
        insulina
      };
    });

    const tipo = detectarTipoComida();

    setResultado({ tipo, alimentos: enriquecido });
    guardarComida(tipo, enriquecido);

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: modoNoche ? "#121212" : "#f5f7fb",
      color: modoNoche ? "white" : "black",
      padding: 25,
      fontFamily: "system-ui"
    }}>
      
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>🍽️ HC Vision</h1>
        <button onClick={() => setModoNoche(!modoNoche)}>
          {modoNoche ? "☀️" : "🌙"}
        </button>
      </div>

      <label style={{
        display: "inline-block",
        padding: "14px 20px",
        background: "#0070f3",
        color: "white",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: "bold",
        marginTop: 20
      }}>
        📸 Añadir comida

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

      {resultado && (
        <div style={{ marginTop: 30 }}>
          <h2>{TIPOS[resultado.tipo]}</h2>

          {resultado.alimentos.map((item, i) => (
            <div key={i} style={{
              background: modoNoche ? "#1e1e1e" : "white",
              padding: 15,
              marginTop: 10,
              borderRadius: 12
            }}>
              <strong>{item.nombre}</strong>

              <p>{item.cantidad.toFixed(0)} {item.unidad}</p>

              <p>HC: {item.hc.toFixed(1)} g</p>

              <div style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: getColor(item.hc)
              }} />

              <p>💉 {item.insulina.toFixed(1)} u</p>

              <button onClick={() => window.location.reload()}>
                🔄 Verificar alimento
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 40 }}>
        <h2>📊 Diario de comidas</h2>

        {["desayuno", "comida", "merienda", "cena"].map(tipo => (
          <div key={tipo} style={{ marginTop: 20 }}>
            <h3>{TIPOS[tipo]}</h3>

            {historial
              .filter(h => h.tipo === tipo)
              .map((item, i) => (
                <div key={i} style={{
                  padding: 10,
                  marginTop: 5,
                  background: modoNoche ? "#1e1e1e" : "#eee",
                  borderRadius: 10
                }}>
                  {new Date(item.fecha).toLocaleString()}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}