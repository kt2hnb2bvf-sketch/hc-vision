"use client";
import { useState, useEffect } from "react";

// 🔥 BASE DE DATOS
const DB = {
  arroz: { hc: 28, ig: 70, tipo: "volumen" },
  pasta: { hc: 25, ig: 50, tipo: "volumen" },
  patata: { hc: 17, ig: 65, tipo: "volumen" },

  pan: { hc: 50, ig: 70, tipo: "gramos" },

  platano: { hc: 23, ig: 50, tipo: "unidad", gramos: 120 },
  manzana: { hc: 12, ig: 35, tipo: "unidad", gramos: 150 },

  pico: { hc: 50, ig: 70, tipo: "unidad", gramos: 2 },
  picos: { hc: 50, ig: 70, tipo: "unidad", gramos: 2 },
};

// 🔥 HELPERS
function findFood(text) {
  text = text.toLowerCase();
  for (let key in DB) {
    if (text.includes(key)) return { key, ...DB[key] };
  }
  return null;
}

function getNumber(text) {
  const m = text.match(/\d+/);
  return m ? parseInt(m[0]) : 1;
}

// 🔥 VOLUMEN INTELIGENTE
function estimarVolumen(nombre, gramosIA) {
  if (!gramosIA) gramosIA = 150;

  if (gramosIA < 100) return 80;
  if (gramosIA < 200) return 150;
  return 220;
}

export default function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);

  const [historial, setHistorial] = useState([]);
  const [aprendizaje, setAprendizaje] = useState({});

  // 🔥 LOAD
  useEffect(() => {
    setHistorial(JSON.parse(localStorage.getItem("historial")) || []);
    setAprendizaje(JSON.parse(localStorage.getItem("aprendizaje")) || {});
  }, []);

  useEffect(() => {
    localStorage.setItem("historial", JSON.stringify(historial));
  }, [historial]);

  useEffect(() => {
    localStorage.setItem("aprendizaje", JSON.stringify(aprendizaje));
  }, [aprendizaje]);

  const toBase64 = (file) =>
    new Promise((res) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => res(reader.result);
    });

  const handleImage = (file) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const analizar = async () => {
    if (!image) return;

    const base64 = await toBase64(image);

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ imageBase64: base64 }),
    });

    let json = await res.json();

    json.alimentos = json.alimentos.map(a => ({
      ...a,
      nombre: aprendizaje[a.nombre?.toLowerCase()] || a.nombre,
      confirmado: null
    }));

    setData(json);
  };

  const confirmar = (i, val) => {
    setData(prev => {
      const copy = { ...prev };
      copy.alimentos[i].confirmado = val;
      return { ...copy };
    });
  };

  const corregir = (i, texto) => {
    if (!texto) return;

    setData(prev => {
      const copy = { ...prev };
      const alimento = copy.alimentos[i];

      const info = findFood(texto);
      const unidades = getNumber(texto);

      let gramos;

      if (info) {
        if (info.tipo === "unidad") {
          gramos = unidades * info.gramos;
        } else if (info.tipo === "volumen") {
          gramos = estimarVolumen(texto, alimento.gramos_estimados);
        } else {
          gramos = alimento.gramos_estimados || 100;
        }

        // 🔥 CONTROL ERRORES
        if (gramos > 400) gramos = 400;
        if (gramos < 5) gramos = 5;

        const hc = (gramos * info.hc) / 100;

        copy.alimentos[i] = {
          ...alimento,
          nombre: texto,
          gramos_estimados: gramos,
          hc_totales: hc,
          ig: info.ig,
          confirmado: true
        };

        // 🔥 APRENDIZAJE
        setAprendizaje(prev => ({
          ...prev,
          [alimento.nombre?.toLowerCase()]: texto.toLowerCase()
        }));
      }

      return { ...copy };
    });
  };

  const totalHC =
    data?.alimentos?.reduce((a, b) => a + (b.hc_totales || 0), 0) || 0;

  const insulina = totalHC / 10;

  const guardar = () => {
    const nueva = {
      hora: new Date().toLocaleTimeString(),
      hc: totalHC,
      insulina
    };
    setHistorial([nueva, ...historial]);
  };

  return (
    <div style={{
      background: "#f4f6f9",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>

        <h1 style={{ textAlign: "center", fontSize: "22px", fontWeight: "600" }}>
          HC Vision
        </h1>

        {/* SUBIDA */}
        <div style={{
          background: "white",
          borderRadius: "18px",
          padding: "16px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.06)"
        }}>
          <label style={{
            display: "block",
            background: "#0066CC",
            color: "white",
            padding: "12px",
            borderRadius: "12px",
            textAlign: "center"
          }}>
            📷 Hacer foto
            <input type="file" accept="image/*" capture="environment"
              style={{ display: "none" }}
              onChange={(e) => handleImage(e.target.files[0])}
            />
          </label>

          <label style={{
            display: "block",
            background: "#e5e7eb",
            padding: "12px",
            borderRadius: "12px",
            textAlign: "center",
            marginTop: "8px"
          }}>
            🖼️ Subir imagen
            <input type="file"
              style={{ display: "none" }}
              onChange={(e) => handleImage(e.target.files[0])}
            />
          </label>

          {preview && (
            <img src={preview} style={{
              width: "100%",
              marginTop: "10px",
              borderRadius: "12px"
            }} />
          )}

          <button onClick={analizar} style={{
            width: "100%",
            marginTop: "10px",
            padding: "12px",
            background: "#111827",
            color: "white",
            borderRadius: "12px"
          }}>
            Analizar plato
          </button>
        </div>

        {/* RESULTADOS */}
        {data && data.alimentos.map((a, i) => (
          <div key={i} style={{
            background: "white",
            marginTop: "12px",
            padding: "14px",
            borderRadius: "14px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <b>{a.nombre}</b>
              <span>{a.gramos_estimados} g</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#0066CC" }}>
                {(a.hc_totales || 0).toFixed(1)} g HC
              </span>
              <span>
                {a.ig <= 55 ? "🟢" : a.ig <= 69 ? "🟠" : "🔴"}
              </span>
            </div>

            {a.confirmado === null && (
              <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                <button onClick={() => confirmar(i, true)}>✔️</button>
                <button onClick={() => confirmar(i, false)}>❌</button>
              </div>
            )}

            {a.confirmado === false && (
              <input
                placeholder="Ej: 5 picos, arroz"
                onBlur={(e) => corregir(i, e.target.value)}
                style={{ width: "100%", marginTop: "6px" }}
              />
            )}
          </div>
        ))}

        {/* RESULTADO */}
        {data && (
          <div style={{
            background: "white",
            marginTop: "14px",
            padding: "20px",
            borderRadius: "18px",
            textAlign: "center"
          }}>
            <p style={{ color: "#888" }}>Dosis estimada</p>
            <h1 style={{ fontSize: "48px", fontWeight: "700", color: "#0066CC" }}>
              {insulina.toFixed(1)} U
            </h1>

            <button onClick={guardar}>
              Guardar comida
            </button>
          </div>
        )}

        {/* HISTORIAL */}
        <h3 style={{ marginTop: "20px" }}>Hoy</h3>
        {historial.map((h, i) => (
          <div key={i}>
            {h.hora} — {h.hc.toFixed(1)}g — {h.insulina.toFixed(1)}U
          </div>
        ))}

      </div>
    </div>
  );
}