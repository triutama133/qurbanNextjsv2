
import "./globals.css";
import FloatingFeedback from "../components/FloatingFeedback";
import ErrorBoundary from "../components/ErrorBoundary";

export const metadata = {
  title: "Tabungan Qurban Peduli | Qurban Berdampak",
  description: "Platform tabungan qurban untuk memudahkan persiapan ibadah qurban dengan dampak sosial yang terukur",
  keywords: "qurban, tabungan qurban, tabungan islami, idul adha, qurban berdampak",
  authors: [{ name: "Qurban Berdampak Team" }],
  openGraph: {
    title: "Tabungan Qurban Peduli | Qurban Berdampak",
    description: "Platform tabungan qurban untuk memudahkan persiapan ibadah qurban dengan dampak sosial yang terukur",
    type: "website",
    locale: "id_ID",
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: "Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#059669" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased" style={{
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'
      }}>
        <ErrorBoundary>
          {children}
          <FloatingFeedback />
        </ErrorBoundary>
      </body>
    </html>
  );
}
