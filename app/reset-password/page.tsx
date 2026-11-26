"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import Header from "@/components/Header";
import Input from "@/components/Input";
import Button from "@/components/Button";
export default function ResetPassword() {
  const { user, isLoading } = useUser(),
    client = useSupabaseClient(),
    router = useRouter();
  const [password, setPassword] = useState(""),
    [confirmation, setConfirmation] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("Passwords must match.");
      return;
    }
    setBusy(true);
    const { error } = await client.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setPassword("");
    setConfirmation("");
    router.replace("/account");
    router.refresh();
  }
  return (
    <div className="interior-page">
      <Header>
        <p className="eyebrow">YOUR ACCOUNT</p>
        <h1>
          A fresh <em>start.</em>
        </h1>
        <p className="page-description">
          Choose a new password for your listening space.
        </p>
      </Header>
      <div className="password-reset-form">
        {isLoading ? (
          <p>Checking your session…</p>
        ) : !user ? (
          <p className="form-notice">
            Open the password reset link from your email to continue.
          </p>
        ) : user.app_metadata.demo ? (
          <p className="form-notice">
            Public demo passwords are fixed. Use a personal account to reset
            your password.
          </p>
        ) : (
          <form onSubmit={submit} className="form-stack">
            <label className="field-label">
              New password
              <Input
                aria-label="New password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className="field-label">
              Confirm password
              <Input
                aria-label="Confirm new password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="Once more, to be sure"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
              />
            </label>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
