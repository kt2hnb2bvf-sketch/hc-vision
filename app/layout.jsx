import "./globals.css";

export const metadata = {
  title: "HC Vision",
  description: "Asistente barato de conteo de hidratos con IA"
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
