"use client";

import { useState } from "react";

export default function App() {

  const [photos, setPhotos] = useState([]);
  const [data, setData] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const hc = (g, hc100) => (g * hc100) / 100;

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
      padding: 16,
      paddingBottom: 90
    }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 16
      }}>
        <h2 style={{ margin: 0 }}>GlucoMate</h2>

        <div style={{
          background: "#1D9E75",
          color: "white",
          padding: "6px 12px",
          borderRadius: 20,
          fontSize: 12
        }}>
          -- mg/dL
        </div>
      </div>

      {/* FOTO CARD */}
      <div style={{
        background: "white",
        borderRadius: 14,
        padding: 16,
        border: "0.5px solid rgba(60,60,67,0.18)",
        marginBottom: 12
      }}>

        <p style={{
          fontSize: 12,
          color: "rgba(60,60,67,0.6)"
        }}>
          FOTO DEL PLATO
        </p>

        <div
          onClick={() => setShowPicker(true)}
          style={{
            border: "1px dashed rgba(60,60,67,0.3)",
            borderRadius: 12,
            height: 140,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}
        >
          <div style={{ fontSize: 26 }}>📷</div>
          <p>Añade foto del plato</p>
          <p style={{ fontSize: 12, color: "gray" }}>
            Pulsa o arrastra una imagen
          </p>
        </div>

        {/* MINIATURAS */}
        <div style={{
          display: "flex",
          gap: 8,
          marginTop: 10,
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

              <button
                onClick={() => {
                  const copy = [...photos];
                  copy.splice(i, 1);
                  setPhotos(copy);
                }}
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  background: "black",
                  color: "white",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  fontSize: 10
                }}
              >×</button>

              {loading && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
      </div>

      {/* BOTÓN ANALIZAR */}
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
        style={{
          width: "100%",
          height: 50,
          borderRadius: 12,
          border: "0.5px solid rgba(60,60,67,0.18)",
          background: photos.length ? "#1D9E75" : "#E5E5EA",
          color: photos.length ? "white" : "gray",
          fontSize: 16,
          marginBottom: 12
        }}
      >
        {photos.length > 1
          ? `✨ Analizar ${photos.length} fotos`
          : "✨ Analizar con IA"}
      </button>

      {/* RESULTADOS */}
      {data.map((item, i) => (
        <div key={i} style={{
          background: "white",
          padding: 12,
          borderRadius: 14,
          marginBottom: 10
        }}>
          <p>{item.name}</p>
          <p>{item.grams} g</p>
          <p>HC: {hc(item.grams, item.hc_per_100g).toFixed(1)}</p>
        </div>
      ))}

      {/* BOTTOM NAV */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "white",
        borderTop: "0.5px solid rgba(60,60,67,0.18)",
        display: "flex",
        justifyContent: "space-around",
        padding: "8px 0"
      }}>
        <Tab label="Analizar" active />
        <Tab label="Historial" />
        <Tab label="Ajustes" />
      </div>

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
            📷 Tomar foto
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>

          <label>
            🖼️ Galería
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>

          <button onClick={() => setShowPicker(false)}>
            Cancelar
          </button>
        </div>
      )}

    </div>
  );
}

function Tab({ label, active }) {
  return (
    <div style={{
      fontSize: 10,
      color: active ? "#1D9E75" : "gray"
    }}>
      {label}
    </div>
  );
}