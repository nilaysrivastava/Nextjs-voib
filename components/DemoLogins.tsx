"use client";
import { useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { useSupabaseClient, useUser } from "@/providers/SupabaseProvider";
import Button from "./Button";
export const DEMOS = [
  {
    label: "Demo listener",
    email: "demo.user@voib.example",
    password: "VoibListener!2026",
    route: "/",
  },
  {
    label: "Demo admin",
    email: "demo.admin@voib.example",
    password: "VoibAdmin!2026",
    route: "/admin",
  },
];
export function DemoLogins() {
  const client = useSupabaseClient();
  const [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  async function login(d: (typeof DEMOS)[number]) {
    setBusy(d.label);
    setError("");
    const { error } = await client.auth.signInWithPassword({
      email: d.email,
      password: d.password,
    });
    if (error) {
      setError("Demo sign-in is unavailable. Please try again.");
      setBusy("");
    } else window.location.assign(d.route);
  }
  return (
    <div className="demo-logins">
      {DEMOS.map((d, i) => (
        <article className="demo-account" key={d.label}>
          <div className="demo-account-heading">
            <span className="eyebrow">
              0{i + 1} / {i ? "THE STUDIO" : "THE LISTENING ROOM"}
            </span>
            <FiArrowUpRight />
          </div>
          <h3>{d.label}</h3>
          <p>
            {i
              ? "Edit and manage the shared sample records."
              : "Listen, save favourites, and upload a record."}
          </p>
          <dl>
            <div>
              <dt>Email</dt>
              <dd>{d.email}</dd>
            </div>
            <div>
              <dt>Password</dt>
              <dd>
                <code>{d.password}</code>
              </dd>
            </div>
          </dl>
          <Button
            variant={i ? "secondary" : "primary"}
            disabled={!!busy}
            onClick={() => login(d)}
          >
            {busy === d.label
              ? "Opening the room…"
              : `Try ${d.label.toLowerCase()}`}
            <FiArrowUpRight />
          </Button>
        </article>
      ))}
      <p className="fine-print">
        Public, shared accounts. Demo Premium is included; no payment is needed.
        Please use sample files only. Demo administrators can manage demo
        uploads, while the main catalogue stays protected.
      </p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}
export default function DemoAccess({ onOpen }: { onOpen: () => void }) {
  const user = useUser();
  return (
    <div className="footer-demo">
      <div>
        <span className="status-dot" />
        <p>
          {user?.app_metadata.demo
            ? "You are in the shared demo room."
            : "A first visit? The doors are open."}
        </p>
      </div>
      <button onClick={onOpen}>
        Explore demo accounts <FiArrowUpRight />
      </button>
    </div>
  );
}
