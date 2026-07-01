import type { Metadata } from "next";
import { Poppins  } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";
import AuthProvider from "@/components/auth/AuthProvider";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site";

const roboto = Poppins ({
  subsets: ["latin"],
  weight:'400',
  display:'swap'
});

const defaultDescription =
  "Apollo Hospital provides compassionate, advanced medical care with expert doctors, modern facilities, and 24/7 emergency services.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: defaultDescription,
  openGraph: {
    title: SITE_NAME,
    description: defaultDescription,
    url: "/",
    siteName: SITE_NAME,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: defaultDescription,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={roboto.className}
      >
        {/* <UserHeader /> */}
       <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
