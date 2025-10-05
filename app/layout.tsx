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
      <a
        href="https://politicalxchange.com"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-3 bottom-3 flex items-center gap-2 text-gray-600"
      >
        Made with ❤️ by Political X Change
        <img
          src="/poxc.webp"
          alt="Political X Change Logo"
          className="mix-blend-multiply"
          width={20}
          height={20}
        />
      </a>
    </html>
  );
}
