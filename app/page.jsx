"use client";

import { useState } from "react";

export default function App() {
  const [image, setImage] = useState(null);
  const [resultado, setResultado] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result;

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const data = await res.json();
      setResultado(data);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>HC Vision</h1>

      <input type="file" onChange={handleUpload} />

      {resultado && (
        <pre>{JSON.stringify(resultado, null, 2)}</pre>
      )}
    </div>
  );
}