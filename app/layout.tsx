import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gemini 3.1 Pro — Активация подписки",
  description:
    "Активируйте подписку Gemini 3.1 Pro. Получите доступ к продвинутым ИИ-функциям для вашего Google Workspace аккаунта.",
  keywords: ["Gemini", "3.1 Pro", "Google", "AI", "Подписка", "Активация"],
  openGraph: {
    title: "Gemini 3.1 Pro — Активация подписки",
    description:
      "Активируйте подписку Gemini 3.1 Pro для вашего Google Workspace аккаунта.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
