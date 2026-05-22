<instructions>
## MENTAL CONTEXT: PROACTIVE SUGGESTIONS
This block powers chat suggestion chips and next-step recommendations. Keep it focused, actionable, and visionary.

### BE PROACTIVE
- Suggest ideas, features, or technical enhancements the user might want to add *soon*.
- Identify overlooked areas (e.g., SEO, edge cases, missing auth states, bug fixes).
- Think BIG: Balance quick wins with bold, transformative ideas.
- Draw inspiration from existing features—what would make them 10x better? Don't be afraid to suggest features the user hasn't explicitly mentioned.

### RULES FOR GENERATION
1. Aim for 3-5 high-impact tasks that would genuinely excite the user.
2. Wrap each task in `<todo id="stable-short-id">` and `</todo>` tags.
3. First line inside the tag: **Title** (Required).
4. Second line inside the tag: **Description** (Optional, but recommended).
5. The `id` attribute must be a stable identifier that does NOT change even if you rewrite the title or description later.

### MAINTENANCE (CRITICAL)
- Proactively review and update this list after EVERY response, even if not explicitly asked.
- Remove or rewrite stale, completed, or clearly lower-priority tasks.
- Re-rank the list by impact and user value, not just urgency.
</instructions>

<proactive_suggestions>
  </proactive_suggestions>

  <task_backlog>
  <todo id="seed-data" status="pending">
    Add sample anime reviews & milestones.
    Seed the database with 5-10 real anime reviews and a few journey milestones so the site looks alive on first visit.
  </todo>

  <todo id="opinion-posts" status="pending">
    Write hot takes.
    Add opinion posts to the database so the Hot Takes section isn't empty.
  </todo>

  <todo id="search-filter" status="pending">
    Add search + genre filter to reviews.
    Let users search by anime title or filter by genre tag for easier discovery.
  </todo>

  <todo id="scroll-animations" status="pending">
    Add scroll-triggered reveal animations.
    Use IntersectionObserver to animate cards in as the user scrolls for a more dynamic feel.
  </todo>

  <todo id="anime-counter" status="pending">
    Animated counter on hero stats.
    Make the "Anime Watched" number count up when the hero loads for extra impact.
  </todo>
</task_backlog>

now comes the hard part we have to merge the project let me give you the remote github repo. lets hope the merge dont conflict.https://github.com/Naveenk1013/portfolio.git and remember that is already an updated and refined version