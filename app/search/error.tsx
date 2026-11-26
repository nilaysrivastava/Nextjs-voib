"use client";
import Button from "@/components/Button";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <section className="page-state">
      <p className="eyebrow">A MOMENTARY PAUSE</p>
      <h1>The record skipped.</h1>
      <p>We could not open this page. Let’s give it another spin.</p>
      <Button onClick={reset}>Try again</Button>
    </section>
  );
}
