import Link from "next/link";
export default function NotFound() {
  return (
    <section className="page-state">
      <p className="eyebrow">404 / OFF THE RECORD</p>
      <h1>A little off the beaten track.</h1>
      <p>This page is no longer in the collection.</p>
      <Link href="/" className="button button-primary">
        Back to the listening room
      </Link>
    </section>
  );
}
