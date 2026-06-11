"use client";

import { useState, useEffect } from "react";

export default function App() {

  const [data, setData] = useState([]);
  const [ratio, setRatio] = useState(10);
  const [history, setHistory] = useState({});
  const [learning, setLearning] = useState({});
  const [meal, setMeal] = useState("cena");

  const [tab, setTab] = useState("home");
  const [showSidebar, setShowSidebar] = useState(false);
  const [touchStart, setTouchStart] = useState(0);

  // 📷 MULTI FOTO
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);

    const base64Images = await Promise.all(
      files.map(file => new Promise(res => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result);
        reader.readAsDataURL(file);
      }))
    );

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ images: base64Images }),
    });

    const result = await res.json();

    const enriched = result.map(item => {
      const learned = learning[item.nombre];

      let gramos = 0;

      if (item.piezas) {
        gramos = item.piezas * (learned || item.gramos_por_pieza);
      } else {
        gramos = item.cantidad || 0;
      }

      return { ...item, gramos };
    });

    setData(enriched);
  };

  const hc = g => g * 0.3;

  // 💾 GUARDAR
  const guardar = () => {
    const fecha = new Date().toLocaleDateString();

    const entry = {
      meal,
      items: data,
      totalHC: data.reduce((a, i) => a + hc(i.gramos), 0)
    };

    const updated = { ...history };

    if (!updated[fecha]) updated[fecha] = [];
    updated[fecha].push(entry);

    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));

    // 🧠 APRENDIZAJE
    const newLearning = { ...learning };

    data.forEach(i => {
      if (i.piezas > 0) {
        newLearning[i.nombre] = i.gramos / i.piezas;
      }
    });

    setLearning(newLearning);
    localStorage.setItem("learning", JSON.stringify(newLearning));
  };

  useEffect(() => {
    const h = localStorage.getItem("history");
    if (h) setHistory(JSON.parse(h));

    const l = localStorage.getItem("learning");
    if (l) setLearning(JSON.parse(l));
  }, []);

  // 👉 SWIPE
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    const touchEnd = e.touches[0].clientX;

    if (touchStart < 50 && touchEnd > 100) {
      setShowSidebar(true);
    }

    if (touchStart > 200 && touchEnd < 100) {
      setShowSidebar(false);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={{
        background: "#F2F2F7",
        minHeight: "100vh",
        fontFamily: "-apple-system"
      }}
    >

      {/* ☰ BOTÓN */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        style={{
          position: "fixed",
          top: 15,
          left: 15,
          zIndex: 1000,
          background: "#007AFF",
          color: "white",
          borderRadius: 10,
          padding: "8px 12px",
          border: "none"
        }}
      >
        ☰
      </button>

      {/* 🔥 SIDEBAR */}
      <div style={{
        position: "fixed",
        top: 0,
        left: showSidebar ? 0 : "-260px",
        width: 260,
        height: "100vh",
        background: "#111",
        color: "white",
        padding: 15,
        transition: "0.3s",
        zIndex: 999
      }}>
        <h3>📅 Historial</h3>

        {Object.keys(history).map((day, i) => (
          <div key={i}>
            <strong>{day}</strong>

            {history[day].map((m, j) => (
              <div key={j} style={{
                marginTop: 10,
                padding: 10,
                background: "#222",
                borderRadius: 10
              }}>
                🍽 {m.meal}
                <br />
                HC: {m.totalHC.toFixed(1)} g
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* APP */}
      <div style={{
        padding: 20,
        paddingBottom: 80,
        maxWidth: 400,
        margin: "auto"
      }}>

        {tab === "home" && (
          <>
            <h2>💉 GlucoMate</h2>

            <input
              value={ratio}
              onChange={(e) => setRatio(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                marginBottom: 15
              }}
            />

            {/* COMIDAS */}
            <div style={{ display: "flex", gap: 8, marginBottom: 15 }}>
              {["desayuno","comida","merienda","cena","snack"].map(m => (
                <button
                  key={m}
                  onClick={() => setMeal(m)}
                  style={{
                    flex: 1,
                    padding: 8,
                    borderRadius: 10,
                    background: meal === m ? "#007AFF" : "#ddd"
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* FOTO */}
            <label style={{
              background: "linear-gradient(135deg,#0A84FF,#5AC8FA)",
              color: "white",
              padding: 15,
              borderRadius: 20,
              display: "block",
              textAlign: "center",
              marginBottom: 20
            }}>
              📷 Subir varias fotos
              <input type="file" multiple hidden onChange={handleUpload} />
            </label>

            {/* RESULTADOS */}
            {data.map((item, i) => {
              const hidratos = hc(item.gramos);
              const insulina = hidratos / ratio;

              return (
                <div key={i} style={{
                  background: "white",
                  padding: 15,
                  borderRadius: 20,
                  marginBottom: 15,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
                }}>
                  <input
                    value={item.nombre}
                    onChange={(e) => {
                      const copy = [...data];
                      copy[i].nombre = e.target.value;
                      setData(copy);
                    }}
                    style={{ width: "100%" }}
                  />

                  <p>🍣 piezas:
                    <input
                      type="number"
                      value={item.piezas}
                      onChange={(e) => {
                        const copy = [...data];
                        copy[i].piezas = Number(e.target.value);
                        copy[i].gramos =
                          copy[i].piezas *
                          (learning[item.nombre] || item.gramos_por_pieza);
                        setData(copy);
                      }}
                      style={{ width: 60 }}
                    />
                  </p>

                  <p>{item.gramos} g</p>
                  <p>HC: {hidratos.toFixed(1)} g</p>
                  <p>💉 {insulina.toFixed(1)} u</p>
                </div>
              );
            })}

            <button onClick={guardar} style={{
              width: "100%",
              padding: 15,
              background: "linear-gradient(135deg,#34C759,#30D158)",
              color: "white",
              borderRadius: 20
            }}>
              Guardar comida
            </button>
          </>
        )}

      </div>

      {/* 🔥 TABS */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        background: "white",
        display: "flex",
        borderTop: "1px solid #ccc"
      }}>
        <button
          onClick={() => setTab("home")}
          style={{
            flex: 1,
            padding: 10,
            background: tab === "home" ? "#007AFF" : "white"
          }}
        >
          🏠
        </button>

        <button
          onClick={() => setShowSidebar(true)}
          style={{ flex: 1, padding: 10 }}
        >
          📊
        </button>
      </div>

    </div>
  );
}