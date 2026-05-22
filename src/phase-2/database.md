<instructions>
## MENTAL CONTEXT: DATABASE DECISIONS
This block tracks database conventions, preferences, and flow decisions. 
**DO NOT** store the raw schema here (entity definitions are injected per-request). 

**What to track here:**
- Data storage preferences (e.g., "store image references as storage paths, not full URLs").
- Schema conventions (e.g., "always use soft deletes", "snake_case columns").
- Anti-patterns to avoid (e.g., "don't store computed values").
- Data flow architecture (e.g., "auth state comes from session, not DB lookup").
- Important indexing or query patterns.

When a database-related decision is made, proactively capture the *why* here. Keep sorted in DESCENDING order.
</instructions>

<database>
# Database Decisions & Conventions
- [AI will populate with active DB rules]
</database>