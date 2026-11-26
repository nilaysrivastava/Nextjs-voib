import { Cormorant_Garamond, Manrope } from "next/font/google";

import getSongsByUserId from "@/actions/getSongsByUserId";
import getActiveProductsWithPrices from "@/actions/getActiveProductsWithPrices";
import Sidebar from "@/components/Sidebar";
import ToasterProvider from "@/providers/ToasterProvider";
import UserProvider from "@/providers/UserProvider";
import ModalProvider from "@/providers/ModalProvider";
import SupabaseProvider from "@/providers/SupabaseProvider";

import "./globals.css";

import Player from "@/components/Player";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "Voib",
  description:
    "An independent listening room. Discover records, keep your favourites, and listen unhurried.",
};

export const revalidate = 0;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const products = await getActiveProductsWithPrices();
  const userSongs = await getSongsByUserId();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${display.variable} ${body.variable}`}>
        <ToasterProvider />
        <SupabaseProvider>
          <UserProvider>
            <ModalProvider products={products} />
            <div>
              <Sidebar songs={userSongs}>{children}</Sidebar>
            </div>
            <Player />
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
