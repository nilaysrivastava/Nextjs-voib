# Voib

An independent listening room with an editorial record collection, a persistent turntable, and a warm paper-and-brass design. Built with Next.js, React, Supabase Auth/Postgres/Storage, and Stripe test subscriptions.

The interface uses Cormorant Garamond and Manrope, official recording artwork, a responsive library drawer, and consistent account, membership, upload and studio flows. See the [design system](docs/design-system.md).

**Deployment:** https://voib-nilay.onrender.com

Hosted on Render Free and Supabase Free. Stripe Checkout uses the existing Voib Premium **₹49/month test plan**; it never charges real money. Public signup emails use the verified Brevo sender through Supabase custom SMTP.

## Try the public demo

The website displays these credentials and provides login buttons:

| Account       | Email                     | Password            |
| ------------- | ------------------------- | ------------------- |
| Demo listener | `demo.user@voib.example`  | `VoibListener!2026` |
| Demo admin    | `demo.admin@voib.example` | `VoibAdmin!2026`    |

Demo Premium is included. Play official recordings, search, save favourites, and upload audio you have permission to publish. The demo admin at `/admin` can edit or delete demo tracks. Demo accounts have no permission to edit live tracks, user profiles, or billing data. Their passwords cannot be changed through the public Auth API. Demo activity is shared among visitors using the same login. Uploaded music is served from public media buckets: only upload files you own or may share.

## Features

- Email/password signup and login, email verification, email-link login, password recovery, logout, and cookie-based sessions.
- Search, a personal upload library, liked songs, play/pause, previous/next, seek, mute, and volume controls.
- MP3/WAV/OGG uploads, cover art, bounded file sizes, per-user folders and ownership rules.
- Administrator catalog moderation with server authorization and database row-level security.
- Stripe **test-mode only** recurring checkout, subscription webhooks, and customer portal. The server rejects live API keys and live events. No real money is charged.
- 32 official YouTube recordings with genre browsing, artist/composer filters, and an Emraan Hashmi film collection. Bollywood, Pop & R&B, Ghazals, Alternative, and Pakistani pop are classified separately from artist credits.
- Visible official YouTube playback with play/pause, seeking, queue navigation and volume controls. Public videos can play without a Voib login. No commercial audio is downloaded or rehosted; personal licensed uploads still use Supabase Storage.

The old configured Supabase project was paused for over 400 days and could not be restored. This deployment starts with fresh accounts and a newly curated catalogue; historical songs, likes, accounts and subscriptions were not imported.

## Run locally

Use Node 22.13 or later in the Node 22 series.

```sh
npm ci --include=dev
cp .env.example .env.local
# Fill public Supabase settings and optional server-only billing settings.
npm run dev
```

`npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build` check the application. `supabase/sql/access-test.sql` exercises database permissions in a transaction that rolls back its test changes.

With the public Supabase settings in `.env.local`, run `VOIB_TEST_URL=https://voib-nilay.onrender.com npm run test:deployment` for the live smoke checks. They create temporary uploads through the public demo identities, verify moderation and access boundaries, and clean up afterward. Set `VOIB_TEST_REPORT` to save the JSON results to a local path.

The initial free-hosting migration passed 45 live application, Stripe sandbox and email checks; its results are in [`docs/deployment-verification.json`](docs/deployment-verification.json). The redesigned interface adds genre and artist browsing, visible official-source playback, a responsive library drawer, consistent account/studio forms, and browser checks for the upload and favourites flows. Current release verification is recorded separately in `docs/frontend-verification.json`.

## Deployment configuration

The app runs as one Render **Free** web service in Singapore, with Supabase in Mumbai. Build with `npm ci --include=dev && npm run build`; start with `npm start`. The server binds to `0.0.0.0` and Render's `PORT`. Health endpoint: `/api/health`.

Supabase schema and storage policies are in `supabase/sql/schema.sql`. Apply the additive `supabase/sql/catalogue-schema.sql` migration before deploying the YouTube-capable frontend, then publish `supabase/sql/official-catalogue.sql`. The latter replaces only the original generated loops and their demo copies. Source IDs, channels, classifications and credits are recorded in `data/official-catalogue.json`. Supabase schema and storage policies are in `supabase/sql/schema.sql`; apply `supabase/sql/demo_credentials.sql` after creating the demo identities. Use a publishable key in the browser. `SUPABASE_SECRET_KEY` and Stripe credentials belong only in server environment settings, never source control.

| Variable                               | Purpose                                                                           |
| -------------------------------------- | --------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL                                                              |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe publishable key                                                      |
| `NEXT_PUBLIC_SITE_URL`                 | Exact deployed HTTPS origin                                                       |
| `SUPABASE_SECRET_KEY`                  | Server-only Supabase secret key for trusted billing synchronization               |
| `STRIPE_SECRET_KEY`                    | Prefer a restricted **test** key (`rk_test_`); the server also accepts `sk_test_` |
| `STRIPE_PRICE_ID`                      | Server-approved active recurring test price                                       |
| `STRIPE_WEBHOOK_SECRET`                | Signing secret for this deployment's test webhook endpoint                        |
| `NEXT_PUBLIC_GITHUB_AUTH_ENABLED`      | Enable only after configuring a GitHub OAuth app in Supabase                      |

The Stripe test key needs Customers read/write, Checkout Sessions read/write, Customer Portal sessions write, Subscriptions read, Prices read, and Products read. Configure a recurring Voib Premium test price and a test customer portal. Send these events to `/api/webhooks`: `product.created`, `product.updated`, `price.created`, `price.updated`, `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, and `invoice.payment_failed`. Webhook signatures are verified before any billing updates; client-supplied prices and subscription states are not trusted.

Use Stripe test card `4242 4242 4242 4242`, a future expiry, and any CVC. Stripe tax registration and collection would need separate review before any future live-payment launch; this application intentionally rejects live payments.

For public signup emails, configure a custom SMTP sender in Supabase. Set the Site URL to the live origin and allow `/auth/callback` as a redirect URL. The confirmation and password recovery templates are in `supabase/templates/`. Auth callbacks use the configured public origin so redirects work behind Render's proxy. GitHub login is currently disabled at the owner's request; enable it after configuring a GitHub OAuth app in Supabase and setting `NEXT_PUBLIC_GITHUB_AUTH_ENABLED=true`.

Grant a private owner administrator access only through trusted Supabase **app metadata**: `{"groups":["admin"]}`. A demo administrator instead has `{"demo":true,"groups":["demo_admin"]}`. Never authorize from user-editable metadata.

The Render service uses a public Git URL, so deployment after a push is manual. Free services sleep when idle, and the workspace shares 750 free instance hours per month across its free web services. Supabase free projects may pause after inactivity. Neither provider has been upgraded to a paid plan.

## Official recording playback

Commercial recordings remain on their official YouTube channels. The visible player keeps YouTube controls and attribution, pauses when the document is hidden or an app dialog covers it, and offers a direct source link if an embed is unavailable in a listener’s region. It does not extract audio, strip advertisements, or support hidden/background YouTube playback. Browser autoplay policies can require another press of the native video play button.

The catalogue includes Maahi, Zara Sa, Toh Phir Aao, Sajni by Jal, O Maahi, and selections from KK, Pritam, Arijit Singh, The Weeknd, Charlie Puth, One Direction, Michael Jackson, Jagjit Singh, Ghulam Ali, Mehdi Hasan and Farida Khanum. Source metadata was verified using YouTube’s public oEmbed endpoint.
