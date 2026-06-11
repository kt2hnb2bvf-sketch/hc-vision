"use client";

import { useState } from "react";

export default function App() {

  const [data, setData] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const hc = (g, hc100) => (g * hc100) / 100;

  const handleFiles = (files) => {
    const newFiles = Array.from(files).slice(0, 4 - photos.length);

    newFiles.forEach(file => {
      const reader = new FileReader();

      reader.onloadend = () => {
        setPhotos(prev => [
          ...prev,
          {
            preview: reader.result,
            base64: reader.result
          }
        ]);
      };

      reader.readAsDataURL(file);
    });

    setShowPicker(false);
  };

  return (
    <div style={{
      fontFamily: "-apple-system",
      background: "#F2F2F7",
      minHeight: "100vh",
      padding: 16
    }}>

      <h2>GlucoMate</h2>

      {/* MINIATURAS */}
      <div style={{
        display: "flex",
        gap: 8,
        overflowX: "auto"
      }}>
        {photos.map((p, i) => (
          <div key={i} style={{
            width: 72,
            height: 72,
            borderRadius: 10,
            overflow: "hidden",
            position: "relative"
          }}>
            <img src={p.preview} style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }} />

            <button onClick={() => {
              const copy = [...photos];
              copy.splice(i, 1);
              setPhotos(copy);
            }}>
              ×
            </button>

            {loading && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white"
              }}>
                ⏳
              </div>
            )}
          </div>
        ))}

        {photos.length < 4 && (
          <button onClick={() => setShowPicker(true)}>+</button>
        )}
      </div>

      <p style={{ fontSize: 12, color: "gray" }}>
        Varias fotos mejoran la precisión
      </p>

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

          setData(json.items || []);
          setLoading(false);

        }}
      >
        {photos.length > 1
          ? `Analizar ${photos.length} fotos`
          : "Analizar"}
      </button>

      {/* RESULTADOS */}
      {data.map((item, i) => (
        <div key={i} style={{
          background: "white",
          marginTop: 10,
          padding: 12,
          borderRadius: 10
        }}>
          <p>{item.name}</p>
          <p>{item.grams} g</p>
          <p>HC: {hc(item.grams, item.hc_per_100g).toFixed(1)}</p>

          {item.units && (
            <p style={{ color: "gray" }}>
              ≈ {item.units.default_count} {item.units.label}
            </p>
          )}
        </div>
      ))}

      {/* ACTION SHEET */}
      {showPicker && (
        <div style={{
          position: "fixed",
          bottom: 0,
          width: "100%",
          background: "white",
          padding: 20,
          borderRadius: "20px 20px 0 0"
        }}>
          <label>
            📷 Cámara
            <input type="file" accept="image/*" capture="environment" hidden
              onChange={(e) => handleFiles(e.target.files)} />
          </label>

          <label>
            🖼️ Galería
            <input type="file" accept="image/*" hidden
              onChange={(e) => handleFiles(e.target.files)} />
          </label>

          <button onClick={() => setShowPicker(false)}>
            Cancelar
          </button>
        </div>
      )}

    </div>
  );
}