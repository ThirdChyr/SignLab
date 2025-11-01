import type { Metadata } from "next";
import "./css/central.css";
import "./css/container.css";
import "./css/component.css";
import ClientLayout from './components/Navbar';

export const metadata: Metadata = {
  title: "Sign Laboratory",
  description: "Learning as a service for sign language",
  icons: {
    icon: "/profile.jpg",           
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}