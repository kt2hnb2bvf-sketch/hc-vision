"use client";

import { useState } from "react";

export default function App() {

  const [photos, setPhotos] = useState([]);
  const [data, setData] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

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
      fontFamily: "-apple-system",
      background: "#F2F2F7",
      minHeight: "100vh",
      padding: 16,
      paddingBottom: 90
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
        padding: 16,
        border: "0.5px solid rgba(60,60,67,0.18)"
      }}>

        <p style={{ fontSize: 12, color: "gray" }}>FOTO DEL PLATO</p>

        <div
          onClick={() => setShowPicker(true)}
          style={{
            border: "1px dashed gray",
            borderRadius: 12,
            height: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column"
          }}
        >
          <img src="https://cdn-icons-png.flaticon.com/512/747/747376.png" width={30} />
          <p>Añade foto del plato</p>
        </div>

        {/* MINIATURAS */}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {photos.map((p, i) => (
            <div key={i} style={{ width: 72, height: 72, borderRadius: 10, overflow: "hidden", position: "relative" }}>
              <img src={p.preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button onClick={() => {
                const copy = [...photos];
                copy.splice(i, 1);
                setPhotos(copy);
              }}>×</button>
            </div>
          ))}

          {photos.length < 4 && (
            <button onClick={() => setShowPicker(true)}>+</button>
          )}
        </div>
      </div>

      {/* BOTÓN */}
      <button
        disabled={!photos.length}
        onClick={async () => {

          setLoading(true);

          const res = await fetch("/api/analyze", {
            method: "POST",
            body: JSON.stringify({
              images: photos.map(p => p.base64)
            })
          });

          const json = await res.json();

          const enriched = (json.items || []).map(item => ({
            ...item,
            mode: "g",
            unitCount: item.units?.default_count || 1
          }));

          setData(enriched);
          setLoading(false);

        }}
        style={{
          width: "100%",
          height: 54,
          borderRadius: 14,
          background: "#1D9E75",
          color: "white",
          marginTop: 12
        }}
      >
        Analizar con IA
      </button>

      {/* RESULTADOS */}
      {data.map((item, i) => {

        const grams =
          item.mode === "g"
            ? item.grams
            : item.unitCount * item.units.grams_per_unit;

        const carbs = hc(grams, item.hc_per_100g);
        const insulin = carbs / ratio;

        return (
          <div key={i} style={{
            background: "white",
            padding: 16,
            borderRadius: 14,
            marginTop: 12
          }}>

            <p>{item.name}</p>

            {item.units && (
              <div>
                <button onClick={() => {
                  const copy = [...data];
                  copy[i].mode = "g";
                  setData(copy);
                }}>g</button>

                <button onClick={() => {
                  const copy = [...data];
                  copy[i].mode = "uds";
                  setData(copy);
                }}>uds</button>
              </div>
            )}

            {item.mode === "g" ? (
              <input
                type="number"
                value={item.grams}
                onChange={(e) => {
                  const copy = [...data];
                  copy[i].grams = Number(e.target.value);
                  setData(copy);
                }}
              />
            ) : (
              <div>
                <button onClick={() => {
                  const copy = [...data];
                  copy[i].unitCount--;
                  setData(copy);
                }}>-</button>

                {item.unitCount} {item.units.label}

                <button onClick={() => {
                  const copy = [...data];
                  copy[i].unitCount++;
                  setData(copy);
                }}>+</button>

                <p>≈ {grams} g</p>
              </div>
            )}

            {/* SEMÁFORO */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: getIGColor(item.gi)
              }} />
              <span>HC: {carbs.toFixed(1)} g</span>
            </div>

            <p>💉 Insulina: {insulin.toFixed(1)} u</p>

            <p style={{ fontSize: 13, color: "gray" }}>
              {getIGAdvice(item.gi)}
            </p>

          </div>
        );
      })}

      {/* DISCLAIMER */}
      <div style={{ fontSize: 12, marginTop: 10, color: "gray" }}>
        ⚠️ Orientativo — no sustituye prescripción médica
      </div>

      {/* PICKER */}
      {showPicker && (
        <div style={{
          position: "fixed",
          bottom: 0,
          width: "100%",
          background: "white",
          padding: 20
        }}>
          <label>
            📷 Cámara
            <input type="file" accept="image/*" capture="environment" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
          </label>

          <label>
            🖼️ Galería
            <input type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
          </label>

          <button onClick={() => setShowPicker(false)}>Cancelar</button>
        </div>
      )}

    </div>
  );
}