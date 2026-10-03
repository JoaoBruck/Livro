import { sitePath } from "./site-path";
import type { Metadata } from "next";
import "./globals.css";
import { ReadingThemeControl } from "./reading-theme";
import { READING_BOOTSTRAP } from "./reading-preferences";

export const metadata: Metadata = {
  title: "Myu — Piloto",
  description:
    "Leia os capítulos do piloto de Myu e investigue os arquivos que existem entre eles.",
  icons: { icon: sitePath("/favicon.svg") },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: READING_BOOTSTRAP,
          }}
        />
      </head>
      <body>
        {children}
        <ReadingThemeControl />
      </body>
    </html>
  );
}
