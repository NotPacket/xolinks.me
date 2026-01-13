import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "xolinks.me - Your Link in Bio",
  description: "Create your personalized link-in-bio page with xolinks.me",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
