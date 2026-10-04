import "./globals.css";

export const metadata = {
  title: "PICTO W",
  description: "Transforma rutinas y acciones en agendas visuales con IA.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
