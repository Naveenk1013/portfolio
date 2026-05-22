<instructions>
## MENTAL CONTEXT: CODER MEMORY
This block acts as your ongoing memory for codebase conventions. Proactively update it when you spend time searching for configs, untangling coupled dependencies, or establishing a new pattern.

**What to track here:**
- Frequently used CLI commands or tools.
- User's code style preferences (naming conventions, preferred libraries, formatting).
- Useful codebase structure/architecture notes.
- Tricky quirks, bugs, or anti-patterns specific to this project.

Keep entries sorted in DESCENDING order (newest first) to prioritize recent knowledge.
</instructions>

<coder>
# Codebase Rules & Discoveries
- **Tech Stack:** React 19 + Vite. Use modern syntax and ES modules.
- **Routing:** Handled in `src/main.jsx` with `react-router-dom` (v7.13.0). New routes should be registered there.
- **Animation Frameworks:** Preference for GreenSock (`gsap`) for timeline animations and `motion/react` (Framer Motion) for layouts, springs, and hover/exit transitions.
- **Scroll Management:** Wrapped in Lenis (`<SmoothScroll>`) for kinetic scrolling.
- **Background & Overlays:** Uses canvas-based interactive overlays like `<SplashCursor>` (WebGL fluid tracking) and `<DotGrid>` (mouse proximity canvas).
- **Data Modeling:** Decoupled architecture using centralized JS files (like `src/data/projectsData.js`) to separate raw static information from view templates.
</coder>