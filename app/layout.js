import { AuthContextProvider } from "./context/AuthContext";
import Chatbot from "./components/Chatbot";
import "./globals.css";
import { Inter, Comic_Neue } from "next/font/google";
import localFont from "next/font/local";
import { FontContextProvider } from './context/FontContext';
import FontWrapper from './components/FontWrapper';

export const metadata = {
  title: "Co-Lab AI",
  description: "Collaborative AI Learning Platform",
};
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const comicNeue = Comic_Neue({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-comic-neue",
});

const openDyslexic = localFont({
  src: [
    {
      path: "../public/fonts/OpenDyslexic-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/OpenDyslexic-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-open-dyslexic",
});

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${comicNeue.variable} ${openDyslexic.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <AuthContextProvider>
          <FontContextProvider>
            <FontWrapper>
              {children}
              <Chatbot />
            </FontWrapper>
          </FontContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
