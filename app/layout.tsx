import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LHR Hessen Wahlsystem",
  description: "Sicheres und DSGVO-konformes Wahlsystem für die LHR Hessen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
