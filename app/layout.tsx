import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: `Landesheimratswahl Hessen ${new Date().getFullYear()}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <link rel="icon" type="image/x-icon" href="/lhr.png" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
