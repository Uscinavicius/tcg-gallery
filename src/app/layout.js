import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pokemon TCG Gallery",
  description: "Track your Pokemon TCG collection",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Analytics/>
      <SpeedInsights/>
      <body className={inter.className}>
        <Nav />
        <div className="pt-16">
          {" "}
          {/* Add padding to account for fixed nav */}
          {children}
        </div>
      </body>
    </html>
  );
}
