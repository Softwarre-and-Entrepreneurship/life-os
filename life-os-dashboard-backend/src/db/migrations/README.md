# Schema Migrations

Add future schema changes here as SQL files named with a numeric version prefix.

Examples:

```text
0002_add_goal_deadline.sql
0003_add_user_settings.sql
```

Rules:

- Version numbers must be greater than the baseline schema version `1`.
- Each file is applied once and recorded in `schema_migrations`.
- Keep migrations backward-compatible with existing local user data whenever possible.
