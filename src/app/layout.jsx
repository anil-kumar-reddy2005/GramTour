import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});
const playfair = Playfair_Display({
    variable: "--font-playfair",
    subsets: ["latin"],
});
export const metadata = {
    title: "GramTour | Discover Hidden Rural India",
    description: "AI-powered rural tourism and artisan experience platform connecting travelers with authentic villages in India.",
};
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
export default function RootLayout({ children, }) {
    return (<html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <Navigation />
        <main style={{ minHeight: 'calc(100vh - 4rem - 300px)' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>);
}
