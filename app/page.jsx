"use client";

import { useState } from "react";

export default function App() {

  const [photos, setPhotos] = useState([]);
  const [data, setData] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  const ratio = 10;

  const hc = (g, hc100) => (g * hc100) / 100;

  const getIGAdvice = (gi) => {
    if (!gi) return "";
    if (gi >= 70) return "IG alto → prebolo 10–15 min";
    if (gi >= 56) return "IG medio";
    return "IG bajo";
  };

  const getIGColor = (gi) => {
    if (!gi) return "#ccc";
    if (gi >= 70) return "#FF3B30";
    if (gi >= 56) return "#FF9500";
    return "#34C759";
  };

  const getBoloStrategy = (gi, name, insulin) => {

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

    if (gi >= 70) {
      return {
        total: insulin,
        now: insulin,
        extended: 0,
        time: null,
        advice: "Prebolo 10–15 min"
      };
    }

    if (gi >= 56) {
      return {
        total: insulin,
        now: insulin * 0.7,
        extended: insulin * 0.3,
        time: "1–2h",
        advice: "Dividir bolo"
      };
    }

    return {
      total: insulin,
      now: insulin * 0.5,
      extended: insulin * 0.5,
      time: "2–3h",
      advice: "Bolo extendido"
    };
  };

  const handleFiles = (files) => {
    const arr = Array.from(files).slice(0, 4 - photos.length);

    const readers = arr.map(file => {
      return new Promise(res => {
        const reader = new FileReader();
        reader.onloadend = () => res({
          base64: reader.result,
          preview: reader.result
        });
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(newPhotos => {
      setPhotos(prev => [...prev, ...newPhotos]);
    });

    setShowPicker(false);
  };

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      background: "#F2F2F7",
      minHeight: "100vh",
      padding: 16
    }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>GlucoMate</h2>
        <div style={{
          background: "#1D9E75",
          color: "white",
          padding: "6px 12px",
          borderRadius: 20
        }}>
          -- mg/dL
        </div>
      </div>

      {/* FOTO */}
      <div style={{
        background: "white",
        borderRadius: 14,
        padding: 20,
        marginTop: 10
      }}>
        <div onClick={() => setShowPicker(true)} style={{ textAlign: "center" }}>
          <img src="https://cdn-icons-png.flaticon.com/512/685/685655.png" width={48}/>
          <p>Añadir foto</p>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          {photos.map((p, i) => (
            <img key={i} src={p.preview} style={{
              width: 120,
              height: 120,
              borderRadius: 16,
              objectFit: "cover"
            }} />
          ))}
        </div>
      </div>

      {/* BOTÓN */}
      <button
        disabled={!photos.length}
        onClick={async () => {

          const res = await fetch("/api/analyze", {
            method: "POST",
            body: JSON.stringify({
              images: photos.map(p => p.base64)
            })
          });

          const json = await res.json();
          setData(json.items || []);

        }}
        style={{
          width: "100%",
          height: 56,
          borderRadius: 16,
          background: "#1D9E75",
          color: "white",
          marginTop: 12
        }}
      >
        Analizar con IA
      </button>

      {/* RESULTADOS */}
      {data.map((item, i) => {

        const carbs = hc(item.grams, item.hc_per_100g);
        const insulin = carbs / ratio;
        const bolo = getBoloStrategy(item.gi, item.name, insulin);

        return (
          <div key={i} style={{
            background: "white",
            padding: 16,
            borderRadius: 16,
            marginTop: 12
          }}>

            <p>{item.name}</p>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: getIGColor(item.gi)
              }} />
              <span>{getIGAdvice(item.gi)}</span>
            </div>

            <p>HC: {carbs.toFixed(1)} g</p>

            <p>💉 Total: {bolo.total.toFixed(1)} u</p>
            <p>➡️ Ahora: {bolo.now.toFixed(1)} u</p>

            {bolo.extended > 0 && (
              <p>⏱ Extendida: {bolo.extended.toFixed(1)} u en {bolo.time}</p>
            )}

            <p style={{ fontSize: 13, color: "gray" }}>
              ⚠️ {bolo.advice}
            </p>

          </div>
        );
      })}

      <p style={{ fontSize: 12, color: "gray", marginTop: 12 }}>
        ⚠️ Orientativo — consulta siempre con tu especialista
      </p>

      {/* PICKER */}
      {showPicker && (
        <div style={{
          position: "fixed",
          bottom: 0,
          width: "100%",
          background: "white",
          padding: 20
        }}>
          <input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} />
          <button onClick={() => setShowPicker(false)}>Cerrar</button>
        </div>
      )}

    </div>
  );
}