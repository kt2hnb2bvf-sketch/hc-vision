"use client";

import { useState, useEffect } from "react";

export default function App() {

  const [data, setData] = useState([]);
  const [tab, setTab] = useState("analizar");

  const [ratio, setRatio] = useState(10);
  const [target, setTarget] = useState(100);
  const [sensitivity, setSensitivity] = useState(50);

  const [glucose, setGlucose] = useState(null);
  const [showSheet, setShowSheet] = useState(false);

  const [boloTab, setBoloTab] = useState("normal");

  const hc = (g) => g * 0.3;

  const totalHC = data.reduce((a, i) => a + hc(i.gramos || 0), 0);

  const comida = totalHC / ratio;

  const correccion = glucose
    ? Math.max(0, (glucose - target) / sensitivity)
    : 0;

  const totalInsulina = comida + correccion;

  // 🎨 COLOR IG
  const igColor = (ig) => {
    if (ig <= 55) return "green";
    if (ig <= 69) return "orange";
    return "red";
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <h1>GlucoMate</h1>

        <button className="glucose-pill" onClick={() => setShowSheet(true)}>
          {glucose ? `${glucose} mg/dL` : "-- mg/dL"}
        </button>
      </header>

      {/* CONTENIDO */}
      <main>

        {/* RESULTADOS (NO TOCAMOS TU LÓGICA) */}
        {data.map((item, i) => (
          <div key={i} className="card">

            <input
              value={item.nombre}
              onChange={(e) => {
                const copy = [...data];
                copy[i].nombre = e.target.value;
                setData(copy);
              }}
            />

            <input
              type="range"
              min="0"
              max="400"
              value={item.gramos}
              onChange={(e) => {
                const copy = [...data];
                copy[i].gramos = Number(e.target.value);
                setData(copy);
              }}
            />

            <p>{item.gramos} g</p>
            <p>HC: {hc(item.gramos).toFixed(1)} g</p>

            <div style={{ color: igColor(item.ig || 70) }}>
              ● IG
            </div>

          </div>
        ))}

        {/* 🔥 BLOQUE BOLO */}
        <div className="card">

          {/* TABS */}
          <div className="bolo-tabs">
            {["normal", "prebolo", "extendido"].map(t => (
              <button
                key={t}
                className={boloTab === t ? "active" : ""}
                onClick={() => setBoloTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {/* NORMAL */}
          {boloTab === "normal" && (
            <>
              <p className="big">{totalInsulina.toFixed(1)} U</p>

              <p>Administrar justo antes de comer</p>

              <p>Bolo comida: {comida.toFixed(1)} U</p>
              <p>Corrección: {correccion.toFixed(1)} U</p>
            </>
          )}

          {/* PREBOLO */}
          {boloTab === "prebolo" && (
            <>
              <input type="number" defaultValue={15} />

              <p className="info">
                El prebolo mejora el control postprandial
              </p>

              <p className="big">{totalInsulina.toFixed(1)} U</p>
            </>
          )}

          {/* EXTENDIDO */}
          {boloTab === "extendido" && (
            <>
              <input type="number" defaultValue={50} />
              <input type="number" defaultValue={3} />

              <div className="bar">
                <div style={{ width: "50%" }} />
              </div>

              <p>{(totalInsulina * 0.5).toFixed(1)} U ahora</p>
              <p>{(totalInsulina * 0.5).toFixed(1)} U extendido</p>
            </>
          )}

        </div>

      </main>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        {["analizar", "historial", "ajustes"].map(t => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      {/* 🔥 SHEET GLUCEMIA */}
      {showSheet && (
        <div className="sheet">
          <div className="handle" />

          <input
            type="range"
            min="40"
            max="400"
            onChange={(e) => setGlucose(Number(e.target.value))}
          />

          <p>{glucose} mg/dL</p>

          <button onClick={() => setShowSheet(false)}>Cerrar</button>
        </div>
      )}

      {/* 🎨 ESTILOS iOS */}
      <style jsx>{`
        .app {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
          background: #F2F2F7;
          min-height: 100vh;
        }

        .header {
          position: sticky;
          top: 0;
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: white;
          border-bottom: 0.5px solid rgba(60,60,67,0.18);
        }

        .glucose-pill {
          background: #1D9E75;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
        }

        .card {
          background: white;
          border: 0.5px solid rgba(60,60,67,0.18);
          border-radius: 14px;
          padding: 12px;
          margin: 12px;
        }

        .bottom-nav {
          position: fixed;
          bottom: 0;
          width: 100%;
          display: flex;
          background: white;
          border-top: 0.5px solid rgba(60,60,67,0.18);
          padding-bottom: 20px;
        }

        .bottom-nav button {
          flex: 1;
          font-size: 10px;
        }

        .active {
          color: #1D9E75;
        }

        .sheet {
          position: fixed;
          bottom: 0;
          width: 100%;
          background: white;
          border-radius: 20px 20px 0 0;
          padding: 20px;
        }

        .handle {
          width: 40px;
          height: 4px;
          background: #ccc;
          margin: auto;
          border-radius: 2px;
        }

        .big {
          font-size: 28px;
          color: #1D9E75;
        }

        .info {
          color: rgba(60,60,67,0.6);
        }

        .bar {
          height: 8px;
          background: #eee;
          border-radius: 4px;
        }

        .bar div {
          height: 100%;
          background: #1D9E75;
        }

        @media (prefers-color-scheme: dark) {
          .app { background: #1C1C1E; }
          .card { background: #2C2C2E; }
        }
      `}</style>

    </div>
  );
}