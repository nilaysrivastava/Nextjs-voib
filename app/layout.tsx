import { Figtree } from "next/font/google";

import getSongsByUserId from "@/actions/getSongsByUserId";
import getActiveProductsWithPrices from "@/actions/getActiveProductsWithPrices";
import Sidebar from "@/components/Sidebar";
import ToasterProvider from "@/providers/ToasterProvider";
import UserProvider from "@/providers/UserProvider";
import ModalProvider from "@/providers/ModalProvider";
import SupabaseProvider from "@/providers/SupabaseProvider";

import "./globals.css";
import DemoAccess from "@/components/DemoLogins";
import Player from "@/components/Player";

const font = Figtree({ subsets: ["latin"] });

export const metadata = {
  title: "Voib",
  description: "Listen to Good Music!",
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
    <html lang="en">
      <body className={`${font.className} flex h-dvh flex-col overflow-hidden`}>
        <ToasterProvider />
        <SupabaseProvider>
          <UserProvider>
            <ModalProvider products={products} />
            <DemoAccess />
            <div className="min-h-0 flex-1">
            <Sidebar songs={userSongs}>{children}</Sidebar>
            </div>
            <Player />
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
