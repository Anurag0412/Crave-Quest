# CraveQuest database schema

## Scope and conventions

The PostgreSQL MVP schema stores outlets, their own menus and dishes, recurring menu availability, ingredient/allergen evidence, dietary tags, lightweight user preferences and restrictions, recommendation feedback, and user-confirmed discoveries. It intentionally does not model authentication, ordering/payment, recommendation algorithms, or inventory.

Migrations are ordered SQL files in `database/migrations/`; demo records are in `database/seeds/`. Names use `snake_case`, primary keys are `bigint` identity columns, and timestamps are `timestamptz`. PostgreSQL 15 or later is required because the restriction uniqueness constraint uses `UNIQUE NULLS NOT DISTINCT`.

## Relationships

```text
outlets 1 ── * menus 1 ── * menu_dishes * ── 1 dishes
   │                              │                 │
   └────────────── 1 ── * dishes  └── * availability
                                                   ├── * dish_ingredients * ── ingredients
                                                   └── * dish_dietary_tags * ── dietary_tags
ingredients * ── * allergens
user_profiles ── * preferences ── dietary_tags
user_profiles ── * restrictions ── dietary_tags / ingredients / allergens
user_profiles ── * recommendation_feedback ── menu_dishes
user_profiles ── * confirmed_discoveries ── dishes
```

Every dish has exactly one owning outlet (`dishes.outlet_id`). `menu_dishes` has composite foreign keys to both `(outlet_id, menu_id)` and `(outlet_id, dish_id)`, so a menu cannot include a dish belonging to a different outlet. Recommendation feedback also references an actual menu/dish entry and its outlet. Use the `outlet_id` filter when selecting recommendations, along with the availability rules below.

## Recommendation availability

A menu entry is eligible only when its outlet is active, its menu is published, the menu's optional `valid_from`/`valid_through` dates include the requested date, the entry is listed, and `availability_status = 'available'`. If the entry has any `menu_dish_availability` rows, at least one must match the outlet's local day of week and local time. Entries without schedule rows are treated as available throughout the menu's validity period. The caller must calculate local time using `outlets.time_zone`; PostgreSQL day-of-week values are Sunday `0` through Saturday `6`. This supports outlet-scoped recommendations without duplicating a global dish catalog.

## Allergy and ingredient safety

`dishes.ingredient_data_status` distinguishes `unknown`, `partial`, and `verified_complete`. A complete declaration is accepted only with a source and check timestamp. `dish_ingredients` records a known ingredient as `contains`, `may_contain`, or `free_from`, separately from whether the record itself is verified. `free_from` rows are constrained to `verified`; verified ingredient/allergen and dietary-tag claims also require evidence text and a timestamp.

An absent ingredient or allergen row is not evidence of absence. For allergy-sensitive recommendations, exclude dishes unless their ingredient data is `verified_complete`, then consider both `contains` and `may_contain` rows, verified ingredient-to-allergen mappings, and the user's restriction target. Unverified catalog associations are not safety evidence. Never infer allergy suitability from a dietary tag such as vegan or gluten-free. Seeded ingredient and tag rows are explicitly unverified fictional examples.

Restrictions target exactly one dietary tag, ingredient, or allergen. `user_preferences` are soft preferences (`prefer`) or user-marked requirements (`require`); applications should evaluate hard restrictions first and avoid presenting an unverified tag as a guarantee.

## Tables

| Table | Purpose |
|---|---|
| `outlets` | Outlet identity, location, timezone, and active status. |
| `menus` | Outlet-owned menus, publication state, service period, and optional date bounds. |
| `dishes` | Outlet-owned dishes and ingredient-data completeness/evidence status. |
| `menu_dishes` | Outlet-consistent menu listing, price, currency, and current availability status. |
| `menu_dish_availability` | Optional recurring local service windows for menu entries. |
| `ingredients`, `allergens`, `ingredient_allergens` | Ingredient/allergen catalog and evidence-backed mappings. |
| `dish_ingredients` | Ingredient presence and verification evidence for a dish. |
| `dietary_tags`, `dish_dietary_tags` | Dietary labels and their evidence status per dish. |
| `user_profiles` | Minimal app profile without credentials or auth lifecycle. |
| `user_preferences` | User's preferred or required dietary tags. |
| `user_restrictions` | User restriction targeting one tag, ingredient, or allergen. |
| `recommendation_feedback` | User response about a dish recommended from a specific outlet menu. |
| `confirmed_discoveries` | User-confirmed tried/discovered dishes, unique per user and dish. |

## Constraints and indexes

Foreign keys protect ownership and prevent cross-outlet menu entries. Checks validate nonnegative prices, ISO-like currency/country formats, date ranges, feedback/status vocabularies, day/time windows, evidence requirements, and single-target restrictions. Useful indexes cover published menus, outlet/category dish lookup, available menu entries, scheduled windows, ingredient/tag lookups, per-user restrictions, and recent feedback/discoveries.

## Migration and seed assumptions

- The initial migration targets PostgreSQL 15+ and requires no extensions.
- `time_zone` values must be valid IANA timezone names; PostgreSQL does not validate them at insert time in this schema.
- Availability schedules cannot cross midnight in a single row (`ends_at > starts_at`); represent an overnight window as two rows split at midnight.
- Schedule overlap is not prevented by a database constraint; seed/application logic should avoid duplicate overlapping periods.
- Seed data is fictional, uses USD, and is illustrative only. Ingredient lists are partial or unknown and all seeded ingredient/tag assertions are unverified; they must not be used for real allergy decisions.
- The database does not by itself enforce application authorization or the semantics of `require`; those remain application responsibilities.

## Applying locally

Apply `database/migrations/001_initial_schema.sql` once to an empty PostgreSQL 15+ database, then run `database/seeds/001_demo_data.sql`. The seed script uses fixed IDs and conflict-safe inserts so it can be rerun against this schema.
