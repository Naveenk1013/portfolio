<instructions>
## 🚨 MANDATORY: CHANGELOG TRACKING 🚨
You MUST maintain this file to track your work across messages. This is NON-NEGOTIABLE.

## RULES
1. **MAX 5 lines** per entry - be concise but highly informative.
2. **Include file paths** of key files modified or discovered.
3. **Note patterns/conventions** found or established in the codebase.
4. **Sort entries by date** in DESCENDING order (newest at the top).
5. **CRITICAL:** Update this log at the END of EVERY response.
6. **CRITICAL:** Keep this file under 300 lines. Summarize older entries if necessary to stay under the limit. If corrupted, re-create it.
</instructions>

<changelog>
## 2026-05-22
- Created `src/data/animeData.js`: 8 seeded reviews, 6 hot takes, 7 journey milestones, genre list.
- Created `src/components/PortalTransition/PortalTransition.jsx` + `.css`: GSAP speed lines, screen shake, impact text.
- Rewrote `src/components/Hero/Hero.jsx`: 6-click easter egg with wiggle, glow shift, dot indicator, PortalTransition.
- Modified `src/components/ProfileCard/ProfileCard.jsx`: added `onAvatarClick` prop wired to avatar `<img>`.
- Created `src/pages/AnimeWorld/AnimeWorld.jsx` + `.css`: full manga page with stats, reviews, hot takes, journey timeline, exit portal.
- Registered `/anime` route in `src/main.jsx`.
- Added wiggle keyframes and click-hint styles to `src/components/Hero/Hero.css`.
- Restored dependencies (`npm install`) and verified initial build (`npm run build`).
</changelog>