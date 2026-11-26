"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiArrowUpRight, FiEye, FiEyeOff } from "react-icons/fi";
import {
  useSessionContext,
  useSupabaseClient,
} from "@/providers/SupabaseProvider";
import useAuthModal from "@/hooks/useAuthModal";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { DemoLogins } from "./DemoLogins";
export default function AuthModal() {
  const { session } = useSessionContext(),
    client = useSupabaseClient(),
    router = useRouter(),
    { onClose, isOpen } = useAuthModal();
  const [mode, setMode] = useState<
    "login" | "signup" | "confirm" | "magic" | "forgot"
  >("login");
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [name, setName] = useState(""),
    [code, setCode] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [show, setShow] = useState(false);
  useEffect(() => {
    if (session) {
      onClose();
      setPassword("");
      router.refresh();
    }
  }, [session, onClose, router]);
  function change(next: typeof mode) {
    setMode(next);
    setNotice("");
    setError("");
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "login") {
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      if (mode === "signup") {
        const { error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: window.location.origin + "/auth/callback",
          },
        });
        if (error) throw error;
        setMode("confirm");
        setNotice("We sent a verification code to your email.");
      }
      if (mode === "confirm") {
        const { error } = await client.auth.verifyOtp({
          email,
          token: code,
          type: "email",
        });
        if (error) throw error;
      }
      if (mode === "magic") {
        const { error } = await client.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
            emailRedirectTo: window.location.origin + "/auth/callback",
          },
        });
        if (error) throw error;
        setNotice("Your sign-in link is on its way. Check your inbox.");
      }
      if (mode === "forgot") {
        const { error } = await client.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setNotice(
          "If this email has an account, a reset link will arrive shortly.",
        );
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  const titles = {
    login: "Welcome to the room.",
    signup: "A space of your own.",
    confirm: "One last little step.",
    magic: "A link. Then a listen.",
    forgot: "Let’s get you back in.",
  };
  return (
    <Modal
      title={titles[mode]}
      description={
        mode === "confirm"
          ? "Enter the code from your confirmation email."
          : "Your records, your favourites, your time."
      }
      isOpen={isOpen}
      onChange={(open) => {
        if (!open) onClose();
      }}
    >
      <div className="auth-tabs">
        <button aria-pressed={mode === "login"} onClick={() => change("login")}>
          Sign in
        </button>
        <button
          aria-pressed={mode === "signup"}
          onClick={() => change("signup")}
        >
          Create account
        </button>
      </div>
      <form onSubmit={submit} className="form-stack">
        {mode === "signup" && (
          <label className="field-label">
            Full name
            <Input
              aria-label="Full name"
              placeholder="Your name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </label>
        )}
        <label className="field-label">
          Email address
          <Input
            aria-label="Email"
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        {(mode === "login" || mode === "signup") && (
          <label className="field-label">
            Password
            <span className="password-field">
              <Input
                aria-label="Password"
                placeholder={
                  mode === "signup" ? "At least 8 characters" : "Your password"
                }
                type={show ? "text" : "password"}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="icon-button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow(!show)}
              >
                {show ? <FiEyeOff /> : <FiEye />}
              </button>
            </span>
          </label>
        )}
        {mode === "confirm" && (
          <label className="field-label">
            Verification code
            <Input
              aria-label="Verification code"
              placeholder="Email verification code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </label>
        )}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="form-notice">
            {notice}
          </p>
        )}
        <Button type="submit" disabled={busy} className="button-full">
          {busy
            ? "One moment…"
            : mode === "signup"
              ? "Create account"
              : mode === "confirm"
                ? "Verify email"
                : mode === "magic"
                  ? "Send sign-in link"
                  : mode === "forgot"
                    ? "Send reset link"
                    : "Sign in"}
          <FiArrowUpRight />
        </Button>
      </form>
      {mode === "login" && (
        <div className="auth-alternatives">
          <button onClick={() => change("magic")}>
            Sign in with an email link
          </button>
          <button onClick={() => change("forgot")}>Forgot password?</button>
        </div>
      )}
      {process.env.NEXT_PUBLIC_GITHUB_AUTH_ENABLED === "true" && (
        <Button
          variant="secondary"
          className="button-full"
          onClick={() =>
            client.auth.signInWithOAuth({
              provider: "github",
              options: {
                redirectTo: window.location.origin + "/auth/callback",
              },
            })
          }
        >
          Continue with GitHub
        </Button>
      )}
      <details className="auth-demo">
        <summary>
          Just looking around? Try a demo account <FiArrowUpRight />
        </summary>
        <DemoLogins />
      </details>
    </Modal>
  );
}
