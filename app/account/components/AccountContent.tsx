"use client";
import { useState } from "react";
import Link from "next/link";
import { FiArrowUpRight, FiDisc, FiShield } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import Button from "@/components/Button";
import useSubscribeModal from "@/hooks/useSubscribeModal";
import useAuthModal from "@/hooks/useAuthModal";
import { postData } from "@/libs/helpers";
export default function AccountContent() {
  const auth = useAuthModal(),
    subscribe = useSubscribeModal(),
    { isLoading, user, subscription } = useUser(),
    [busy, setBusy] = useState(false);
  async function portal() {
    setBusy(true);
    try {
      const { url } = await postData({ url: "/api/create-portal-link" });
      window.location.assign(url);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (isLoading)
    return (
      <div className="account-layout" aria-busy="true">
        <p>Opening your space…</p>
      </div>
    );
  if (!user)
    return (
      <div className="saved-section">
        <div className="empty-state">
          <h3>Your room is waiting.</h3>
          <p>Sign in to look after your profile and membership.</p>
          <Button onClick={auth.onOpen}>Sign in to your account</Button>
        </div>
      </div>
    );
  const demo = user.app_metadata.demo,
    admin = user.app_metadata.groups?.includes("admin");
  return (
    <div className="account-layout">
      <section className="profile-panel">
        <p className="eyebrow">YOUR PROFILE</p>
        <div className="profile-avatar">
          {(user.user_metadata.full_name || user.email || "V")
            .slice(0, 1)
            .toUpperCase()}
        </div>
        <h2>{user.user_metadata.full_name || "A fellow listener"}</h2>
        <p className="profile-email">{user.email}</p>
        <dl className="profile-details">
          <div>
            <dt>Account</dt>
            <dd>
              {demo
                ? "Shared demo"
                : admin
                  ? "Owner administrator"
                  : "Personal listener"}
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              {user.email_confirmed_at ? "Verified" : "Awaiting verification"}
            </dd>
          </div>
        </dl>
        {!demo && (
          <Link className="text-link" href="/reset-password">
            Change password <FiArrowUpRight />
          </Link>
        )}
        {(admin || user.app_metadata.groups?.includes("demo_admin")) && (
          <Link className="text-link" href="/admin">
            Open collection studio <FiArrowUpRight />
          </Link>
        )}
      </section>
      <section className="membership-panel">
        <FiDisc size={33} />
        <p className="eyebrow">YOUR MEMBERSHIP</p>
        <h2>
          {demo
            ? "The room is yours."
            : admin
              ? "Owner access."
              : subscription
                ? "A little more room."
                : "Go a little deeper."}
        </h2>
        <p>
          {demo
            ? "Demo Premium is included. Listen, save favourites and add sample tracks. This shared account has no billing account."
            : admin
              ? "Your private administrator account can upload music and manage the collection. Keep these credentials to yourself."
              : subscription
                ? "Your Premium membership is active. Your music has a home here."
                : "Listening is just the beginning. Give your own records a home with a Premium membership."}
        </p>
        <span className="membership-status">
          <span className="status-dot" />
          {demo
            ? "DEMO PREMIUM INCLUDED"
            : admin
              ? "PRIVATE OWNER ACCESS"
              : subscription
                ? "PREMIUM ACTIVE"
                : "LISTENER ACCOUNT"}
        </span>
        {!demo && !admin && !subscription && (
          <Button onClick={subscribe.onOpen}>
            Explore Premium <FiArrowUpRight />
          </Button>
        )}
        {!demo && subscription && (
          <Button disabled={busy} onClick={portal}>
            {busy ? "Opening…" : "Manage membership"}
            <FiArrowUpRight />
          </Button>
        )}
        {!demo && !admin && (
          <p className="fine-print">
            <FiShield /> Test subscriptions only. No real money is charged.
          </p>
        )}
      </section>
    </div>
  );
}
