import type { Metadata } from "next";
import { Poppins  } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";
import AuthProvider from "@/components/auth/AuthProvider";

const roboto = Poppins ({
  subsets: ["latin"],
  weight:'400',
  display:'swap'
});

export const metadata: Metadata = {
  title: "Hospital Management System",
  description: "This is Quick Hospital management System For Efficentlly Manage Hospital",
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
