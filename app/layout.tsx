// app/layout.tsx
import "./globals.css";
import Navbar from "./components/Navbar";
import LayoutPadding from "./components/LayoutPadding";
import Footer from "./components/Footer";
import Script from "next/script";
import { Space_Grotesk, Space_Mono } from "next/font/google";

// Space Grotesk for everything; its mono sibling for code, configs and formulas.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

const themeInitScript = `
  (function () {
    var storedTheme;

    try {
      storedTheme = localStorage.getItem("argus-theme");
    } catch (_) {}

    var theme = storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  })();
`;

export const metadata = {
    title: "Prosjekt Argus",
    description: "Forbedre oversikten over kaskadeeffekter av naturkatastrofer i Norge ved å utvikle et system som kombinerer spatio-temporal maskinlæring med interaktive kartvisualiseringe.",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="no" className={`${spaceGrotesk.variable} ${spaceMono.variable}`} suppressHydrationWarning>
        <head>
            <Script id="theme-init" strategy="beforeInteractive">
                {themeInitScript}
            </Script>
            <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
            <link rel="shortcut icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <meta name="apple-mobile-web-app-title" content="MyWebSite" />
            <link rel="manifest" href="/site.webmanifest" />
            <title>Prosjekt Argus</title>
        </head>
        <body>
        <Navbar />
        <LayoutPadding>
            {children}
        </LayoutPadding>
        <Footer />
        </body>
        </html>
    );
}
