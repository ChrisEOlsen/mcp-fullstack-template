// pages/_app.js
import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <>
      <main className={`${poppins.variable} font-sans`}>
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </main>
    </>
  );
}