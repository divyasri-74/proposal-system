import "./globals.css";

export const metadata = {
  title: "Proposal Studio — generate professional PDF proposals",
  description: "Create polished business proposals from multiple templates and download them as PDF.",
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
