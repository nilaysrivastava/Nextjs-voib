"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { FiArrowUpRight, FiMenu, FiX, FiUser, FiLogOut } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { Song } from "@/types";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";
import usePlayer from "@/hooks/usePlayer";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import Library from "./Library";
import DemoAccess, { DemoLogins } from "./DemoLogins";
import Modal from "./Modal";
export default function Sidebar({
  children,
  songs,
}: {
  children: React.ReactNode;
  songs: Song[];
}) {
  const pathname = usePathname(),
    router = useRouter(),
    auth = useAuthModal(),
    client = useSupabaseClient(),
    player = usePlayer();
  const { user } = useUser();
  const [library, setLibrary] = useState(false),
    [menu, setMenu] = useState(false),
    [demo, setDemo] = useState(false),
    [account, setAccount] = useState(false);
  const admin = user?.app_metadata.groups?.some((g: string) =>
    ["admin", "demo_admin"].includes(g),
  );
  async function logout() {
    setAccount(false);
    const { error } = await client.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    player.reset();
    router.push("/");
    router.refresh();
    toast.success("You are signed out.");
  }
  const nav = [
    ["Discover", "/"],
    ["Saved records", "/liked"],
    ["Search", "/search"],
  ];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to music
      </a>
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="wordmark" href="/" aria-label="Voib home">
          voib<span aria-hidden="true">•</span>
        </Link>
        <div className="desktop-links">
          {nav.map(([name, href]) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? "nav-link active" : "nav-link"}
              aria-current={pathname === href ? "page" : undefined}
            >
              {name}
            </Link>
          ))}
          <button
            className="nav-link"
            aria-label="Open your library"
            onClick={() => setLibrary(true)}
          >
            Your library
          </button>
        </div>
        <div className="nav-actions">
          <button className="demo-trigger" onClick={() => setDemo(true)}>
            Demo access <FiArrowUpRight />
          </button>
          {user ? (
            <div className="account-menu">
              <button
                className="icon-button account-trigger"
                aria-label="Account menu"
                aria-expanded={account}
                onClick={() => setAccount(!account)}
              >
                <FiUser size={19} />
              </button>
              {account && (
                <>
                  <button
                    className="menu-dismiss"
                    aria-label="Close account menu"
                    onClick={() => setAccount(false)}
                  />
                  <div className="account-popover">
                    <p className="eyebrow">YOUR LISTENING SPACE</p>
                    <Link href="/account" onClick={() => setAccount(false)}>
                      Your account <FiArrowUpRight />
                    </Link>
                    {admin && (
                      <Link href="/admin" onClick={() => setAccount(false)}>
                        Collection studio <FiArrowUpRight />
                      </Link>
                    )}
                    <button onClick={logout}>
                      Sign out <FiLogOut />
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button className="sign-in" onClick={auth.onOpen}>
              Sign in <FiArrowUpRight />
            </button>
          )}
          <button
            className="icon-button mobile-menu-trigger"
            aria-label="Open navigation"
            onClick={() => setMenu(true)}
          >
            <FiMenu size={22} />
          </button>
        </div>
      </nav>
      <main id="main-content">{children}</main>
      <footer className="site-footer">
        <div className="footer-line">
          <Link href="/" className="wordmark">
            voib<span aria-hidden="true">•</span>
          </Link>
          <p>
            An independent listening room.
            <br />
            Good music. Given space.
          </p>
          <span className="eyebrow">LISTEN WITH INTENTION</span>
        </div>
        <DemoAccess onOpen={() => setDemo(true)} />
        <div className="footer-bottom">
          <span>© 2026 Voib</span>
          <span>Take your time. Stay a while.</span>
          <Link href="/account">
            Your account <FiArrowUpRight />
          </Link>
        </div>
      </footer>
      <Dialog.Root open={library} onOpenChange={setLibrary}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-overlay" />
          <Dialog.Content className="library-drawer">
            <div className="drawer-heading">
              <div>
                <p className="eyebrow">YOUR PERSONAL COLLECTION</p>
                <Dialog.Title>Your library.</Dialog.Title>
                <Dialog.Description>
                  Every record you have made room for.
                </Dialog.Description>
              </div>
              <Dialog.Close className="icon-button" aria-label="Close library">
                <FiX size={23} />
              </Dialog.Close>
            </div>
            <Library songs={songs} onNavigate={() => setLibrary(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={menu} onOpenChange={setMenu}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-overlay" />
          <Dialog.Content className="mobile-navigation">
            <div className="drawer-heading">
              <Dialog.Title className="wordmark">voib.</Dialog.Title>
              <Dialog.Close
                className="icon-button"
                aria-label="Close navigation"
              >
                <FiX size={24} />
              </Dialog.Close>
            </div>
            <Dialog.Description className="eyebrow">
              MAKE YOURSELF AT HOME
            </Dialog.Description>
            {nav.map(([name, href], i) => (
              <Link key={href} href={href} onClick={() => setMenu(false)}>
                <span>0{i + 1}</span>
                {name}
                <FiArrowUpRight />
              </Link>
            ))}
            <button
              onClick={() => {
                setMenu(false);
                setLibrary(true);
              }}
            >
              <span>04</span>Your library
              <FiArrowUpRight />
            </button>
            {admin && (
              <Link href="/admin" onClick={() => setMenu(false)}>
                Collection studio
                <FiArrowUpRight />
              </Link>
            )}
            <button
              className="mobile-demo"
              onClick={() => {
                setMenu(false);
                setDemo(true);
              }}
            >
              Explore the demo
              <FiArrowUpRight />
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Modal
        isOpen={demo}
        onChange={setDemo}
        title="Make yourself at home."
        description="Two open doors into Voib. Choose a listening account or explore the collection studio."
      >
        <DemoLogins />
      </Modal>
    </div>
  );
}
