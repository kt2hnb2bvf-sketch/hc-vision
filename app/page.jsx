"use client";
import { useState } from "react";

export default function App() {

  const [photos, setPhotos] = useState([]);
  const [data, setData] = useState([]);

  const ratio = 10;

  const hc = (g, hc100) => (g * hc100) / 100;

  const getBolo = (gi, name, insulin) => {
    const lower = name.toLowerCase();

    if (lower.includes("sushi") || lower.includes("maki")) {
      return {
        total: insulin,
        now: insulin * 0.7,
        extended: insulin * 0.3,
        time: "1–2h",
        advice: "Prebolo 10–15 min + extendido"
      };
    }

    if (gi >= 70) return {
      total: insulin,
      now: insulin,
      extended: 0,
      advice: "Prebolo 10–15 min"
    };

    if (gi >= 56) return {
      total: insulin,
      now: insulin * 0.7,
      extended: insulin * 0.3,
      time: "1–2h",
      advice: "Dividir bolo"
    };

    return {
      total: insulin,
      now: insulin * 0.5,
      extended: insulin * 0.5,
      time: "2–3h",
      advice: "Bolo extendido"
    };
  };

  const handleFiles = (files) => {
    const arr = Array.from(files).slice(0, 4);

    const readers = arr.map(file =>
      new Promise(res => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result);
        reader.readAsDataURL(file);
      })
    );

    Promise.all(readers).then(setPhotos);
  };

  return (
    <div style={{ padding: 20, fontFamily: "system-ui", background: "#F2F2F7", minHeight: "100vh" }}>

      <h2>GlucoMate</h2>

      {/* SUBIR FOTO */}
      <input type="file" multiple accept="image/*" onChange={(e) => handleFiles(e.target.files)} />

      <div style={{ display: "flex", gap: 10 }}>
        {photos.map((p, i) => (
          <img key={i} src={p} width={100} style={{ borderRadius: 12 }} />
        ))}
      </div>

      {/* ANALIZAR */}
      <button onClick={async () => {

        const res = await fetch("/api/analyze", {
          method: "POST",
          body: JSON.stringify({ images: photos })
        });

        const json = await res.json();
        setData(json.items || []);

      }}>
        Analizar con IA
      </button>

      {/* RESULTADOS */}
      {data.map((item, i) => {

        const carbs = hc(item.grams, item.hc_per_100g);
        const insulin = carbs / ratio;
        const bolo = getBolo(item.gi, item.name, insulin);

        return (
          <div key={i} style={{ background: "white", padding: 15, marginTop: 10, borderRadius: 12 }}>

            <p>{item.name}</p>
            <p>HC: {carbs.toFixed(1)} g</p>

            <p>💉 Total: {bolo.total.toFixed(1)} u</p>
            <p>➡️ Ahora: {bolo.now.toFixed(1)} u</p>

            {bolo.extended > 0 && (
              <p>⏱ Extendida: {bolo.extended.toFixed(1)} u en {bolo.time}</p>
            )}

            <p style={{ color: "gray" }}>{bolo.advice}</p>

          </div>
        );
      })}

      <p style={{ fontSize: 12, marginTop: 20 }}>
        ⚠️ Orientativo — consulta siempre con tu médico
      </p>

    </div>
  );
}