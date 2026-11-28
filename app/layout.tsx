import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import AppProviders from "@/components/AppProviders";
import { NATIVE_UA_MARKER } from "@/lib/native/constants";
import { isNativeShellRequest } from "@/lib/native/isNativeShellRequest";
import {
  APP_DEFAULT_TITLE,
  APP_DESCRIPTION,
  APP_NAME,
  APP_THEME_COLOR,
  APP_TITLE_TEMPLATE,
} from "@/lib/pwa/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: APP_THEME_COLOR,
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

const nativeSwPurgeScript = `
(function () {
  var marker = ${JSON.stringify(NATIVE_UA_MARKER)};
  var ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
  if (ua.indexOf(marker) === -1) return;
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.getRegistrations().then(function (regs) {
    regs.forEach(function (reg) {
      void reg.unregister();
    });
  });
  if (typeof caches !== "undefined") {
    caches.keys().then(function (keys) {
      keys.forEach(function (key) {
        void caches.delete(key);
      });
    });
  }
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nativeShell = await isNativeShellRequest();

  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-dvh flex-col bg-[#080810] text-[#eeeaf4]"
        suppressHydrationWarning
      >
        {nativeShell ? (
          <Script id="native-sw-purge" strategy="beforeInteractive">
            {nativeSwPurgeScript}
          </Script>
        ) : null}
        <AppProviders nativeShell={nativeShell}>{children}</AppProviders>
      </body>
    </html>
  );
}
