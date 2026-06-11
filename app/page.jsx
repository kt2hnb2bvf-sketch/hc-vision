"use client";

import { useState } from "react";

export default function App() {

  const [data, setData] = useState([]);
  const [ratio, setRatio] = useState(10);

  // 🧠 HC
  const hc = (g) => g * 0.3;

  // 🔥 TOTAL
  const totalHC = data.reduce((a, i) => a + hc(i.gramos || 0), 0);

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <h1>GlucoMate</h1>
      </header>

      <main>

        {/* BOTÓN IA */}
        <input
          type="file"
          multiple
          onChange={async (e) => {

            const files = Array.from(e.target.files);

            const images = await Promise.all(
              files.map(file => new Promise(res => {
                const reader = new FileReader();
                reader.onloadend = () => res(reader.result);
                reader.readAsDataURL(file);
              }))
            );

            const res = await fetch("/api/analyze", {
              method: "POST",
              body: JSON.stringify({ images }),
            });

            const json = await res.json();

            setData(json.map(i => ({
              nombre: i.nombre,
              gramos: i.cantidad || 100
            })));

          }}
        />

        {/* RESULTADOS */}
        {data.map((item, i) => (

          <div key={i} className="card">

            {/* EDITAR NOMBRE */}
            <input
              value={item.nombre}
              onChange={(e) => {
                const copy = [...data];
                copy[i].nombre = e.target.value;
                setData(copy);
              }}
            />

            {/* SLIDER GRAMOS */}
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

            {/* INFO */}
            <p>{item.gramos} g</p>

            <p>HC: {hc(item.gramos).toFixed(1)} g</p>

          </div>
        ))}

        {/* TOTAL */}
        {data.length > 0 && (
          <div className="card total">
            <h3>Total HC: {totalHC.toFixed(1)} g</h3>
            <p>Raciones: {(totalHC / 10).toFixed(1)}</p>
          </div>
        )}

      </main>

      {/* 🎨 UI iPhone */}
      <style jsx>{`
        .app {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
          background: #F2F2F7;
          min-height: 100vh;
          padding-bottom: 40px;
        }

        .header {
          position: sticky;
          top: 0;
          background: white;
          padding: 12px;
          border-bottom: 0.5px solid rgba(60,60,67,0.18);
        }

        .card {
          background: white;
          border: 0.5px solid rgba(60,60,67,0.18);
          border-radius: 14px;
          padding: 12px;
          margin: 12px;
        }

        .total {
          background: #1D9E75;
          color: white;
        }

        input {
          width: 100%;
          margin-bottom: 8px;
        }

        @media (prefers-color-scheme: dark) {
          .app { background: #1C1C1E; }
          .card { background: #2C2C2E; }
        }
      `}</style>

    </div>
  );
}