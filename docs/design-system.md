# Voib — the listening room

Voib is a music application for people who want a personal, unhurried place to listen. The visual direction is luxury editorial: a record sleeve on a warm paper desk, rather than a streaming-service dashboard.

## Identity

- Cormorant Garamond for expressive headings and record titles; Manrope for navigation, controls and readable detail. Fonts are self-hosted by Next.js.
- Warm paper `#f3f0e8`, dark ink `#272c25`, quiet olive-grey `#6b7066`, and restrained brass `#987849`. Shared CSS variables in `app/globals.css` define the palette.
- Official YouTube recording artwork, framed as a record collection. The forest-green, sienna and slate genre cards provide a coherent palette around varied cover imagery.
- Hairline rules, generous margins, offset record covers, and one tactile vinyl composition. No gradients behind generic cards, fabricated popularity metrics, or decorative controls that do nothing.

## Consistent behaviour

A single navigation and account menu serve every route. The personal library is a focus-trapped drawer. Demo credentials live behind the clearly labelled Demo access action and footer entry, so they stay easy to find without displacing the music.

Primary actions use ink-filled rectangular buttons; secondary actions use hairline borders. Forms have visible labels, consistent focus states, readable errors and disabled submission states. Destructive moderation requires an in-app confirmation naming the record. Authentication, membership, upload and demo dialogs share one accessible modal component.

The player persists across navigation and exposes playback, queue navigation, seeking, volume, mute and saving. Official YouTube videos remain visible in their native player, with source credit and a direct official link; never hide them to create audio-only playback. Saved records play in their own queue. Demo uploads remain accessible through search, personal libraries and the studio; the editorial homepage features the main catalogue without duplicate demo copies.

## Responsive and accessible

Desktop navigation becomes a focus-trapped menu below 700 px. The player keeps transport and seeking on small screens. Grid compositions adapt to the viewport rather than shrinking the desktop dashboard. Preserve keyboard navigation, meaningful button labels, visible focus, reduced-motion support, and real empty, loading and error states.

Keep artwork decorative when an adjacent label supplies its meaning. Avoid adding fake filters, badges, track durations or high-resolution audio claims. Use actual record and account data.
