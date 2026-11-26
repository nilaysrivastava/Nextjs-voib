"use client";

import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { twMerge } from "tailwind-merge";
import { usePathname } from "next/navigation";

import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";

import SidebarItem from "./SidebarItem";
import Box from "./Box";
import Library from "./Library";
import { useMemo, useState } from "react";

interface SidebarProps {
  children: React.ReactNode;
  songs: Song[];
}

const Sidebar = ({ children, songs }: SidebarProps) => {
  const pathname = usePathname();
  const player = usePlayer();
  const [libraryOpen, setLibraryOpen] = useState(false);

  const routes = useMemo(
    () => [
      {
        icon: HiHome,
        label: "Home",
        active: pathname !== "/search",
        href: "/",
      },
      {
        icon: BiSearch,
        label: "Search",
        href: "/search",
        active: pathname === "/search",
      },
    ],
    [pathname]
  );

  return (
    <div
      className={twMerge(
        `
        flex
        h-full
        `,
        player.activeId && "h-[calc(100%-80px)]"
      )}
    >
      <button aria-label="Open your library" onClick={()=>setLibraryOpen(true)} className="fixed bottom-24 left-4 z-30 rounded-full bg-pink-700 px-4 py-2 shadow-lg md:hidden">Your Library</button>
      {libraryOpen && <div className="fixed inset-0 z-50 md:hidden">
        <button aria-label="Close library" className="absolute inset-0 bg-black/70" onClick={()=>setLibraryOpen(false)}/>
        <aside aria-label="Your Library" className="relative h-full w-[min(90vw,340px)] overflow-y-auto bg-neutral-900 pb-6">
          <button className="m-4 rounded-full border border-neutral-600 px-4 py-2" onClick={()=>setLibraryOpen(false)}>Close library</button>
          <Library songs={songs}/>
        </aside>
      </div>}
      <div
        className="
    flex
    flex-col
    gap-y-2
    bg-black
    h-full
    hidden md:flex w-[280px] shrink-0
    p-2
  "
      >
        <Box>
          <div className="flex flex-col gap-y-4 px-5 py-4">
            {routes.map((item) => (
              <SidebarItem key={item.label} {...item} />
            ))}
          </div>
        </Box>
        <Box className="overflow-y-auto h-full">
          <Library songs={songs} />
        </Box>
      </div>
      <main className="h-full min-w-0 w-full flex py-2">{children}</main>
    </div>
  );
};

export default Sidebar;
