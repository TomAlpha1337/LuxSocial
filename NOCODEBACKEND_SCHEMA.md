# LuxSocial - NoCodeBackend Database Schema

> **Complete setup guide for creating the LuxSocial database on [nocodebackend.com](https://nocodebackend.com)**
>
> **Database Name:** `LuxSocial`
> **Total Tables:** 24
> **Last Updated:** 2026-02-16

---

## Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [Supported Field Types](#supported-field-types)
3. [Table Definitions](#table-definitions)
   - [1. users](#1-users)
   - [2. friendships](#2-friendships)
   - [3. blocks](#3-blocks)
   - [4. dilemmas](#4-dilemmas)
   - [5. votes](#5-votes)
   - [6. direct_dilemmas](#6-direct_dilemmas)
   - [7. activities](#7-activities)
   - [8. reactions](#8-reactions)
   - [9. comments](#9-comments)
   - [10. notifications](#10-notifications)
   - [11. streaks](#11-streaks)
   - [12. daily_counters](#12-daily_counters)
   - [13. sessions](#13-sessions)
   - [14. session_dilemmas](#14-session_dilemmas)
   - [15. leaderboards](#15-leaderboards)
   - [16. milestones](#16-milestones)
   - [17. user_milestones](#17-user_milestones)
   - [18. badges](#18-badges)
   - [19. xp_levels](#19-xp_levels)
   - [20. seasons](#20-seasons)
   - [21. events](#21-events)
   - [22. shares](#22-shares)
   - [23. reports](#23-reports)
   - [24. point_rules](#24-point_rules)
4. [Seed Data](#seed-data)
   - [xp_levels (20 Levels)](#seed-data-xp_levels)
   - [point_rules (All Action Types)](#seed-data-point_rules)
   - [milestones](#seed-data-milestones)
5. [Relationship Map](#relationship-map)
6. [Creation Order](#creation-order)

---

## Setup Instructions

### How to Create Each Table in NoCodeBackend Quick Create

1. Log in to [nocodebackend.com](https://nocodebackend.com) and open your project dashboard.
2. Navigate to **Database** > **Quick Create**.
3. Enter the **Table Name** exactly as shown in this guide (lowercase, underscores).
4. Add each column one by one:
   - Enter the **Column Name** exactly as listed.
   - Select the **Type** from the dropdown (varchar, int, smallint, etc.).
   - For **dropdown** fields: select "dropdown" as the type, then enter all allowed values separated by commas.
   - For **password** fields: select "password" -- NoCodeBackend will automatically bcrypt-hash values on insert/update.
   - For **auto-increment** primary keys: check the "Auto Increment" box on the `id` field.
   - For **default values**: enter the default in the "Default" input box.
5. Click **Create Table**.
6. Repeat for all 24 tables, following the **Creation Order** at the bottom of this document.

### Important Notes

- NoCodeBackend does **not** enforce foreign key constraints at the database level. Relationships documented here are **logical** -- enforce them in your application code.
- **Unique constraints** (e.g., `users.username`, `users.email`) should be enforced via your API logic or middleware.
- **Nullable** fields: leave the "Required" checkbox unchecked for optional/nullable columns.
- All `id` columns are **int, auto-increment, primary key**.

---

## Supported Field Types

| Type       | Description                                      | Example Use                  |
|------------|--------------------------------------------------|------------------------------|
| `varchar`  | Variable-length string (text)                    | Usernames, emails, URLs      |
| `int`      | Standard integer (32-bit)                        | IDs, counters, points        |
| `smallint` | Small integer (16-bit)                           | Boolean-like flags (0 or 1)  |
| `bigint`   | Large integer (64-bit)                           | Very large counters          |
| `float`    | Floating-point number                            | Multipliers                  |
| `double`   | Double-precision floating-point                  | High-precision decimals      |
| `decimal`  | Fixed-point decimal                              | Currency values              |
| `datetime` | Date and time value                              | Timestamps                   |
| `password` | Auto-hashed via bcrypt on insert/update          | User passwords               |
| `dropdown` | Enumerated list of allowed string values         | Statuses, categories, roles  |

---

## Table Definitions

---

### 1. users

> Core user accounts table. Every user in LuxSocial has a row here.

| # | Column Name          | Type       | Details                                                    |
|---|----------------------|------------|------------------------------------------------------------|
| 1 | `id`                 | int        | Auto-increment, Primary Key                                |
| 2 | `username`           | varchar    | **Unique** -- no two users can share a username            |
| 3 | `email`              | varchar    | **Unique** -- no two users can share an email              |
| 4 | `password_hash`      | password   | Bcrypt auto-hashed by NoCodeBackend on insert/update       |
| 5 | `avatar_url`         | varchar    | Optional -- URL to profile image, nullable                 |
| 6 | `bio`                | varchar    | Optional -- max 200 characters, nullable                   |
| 7 | `profile_visibility` | dropdown   | Values: `public`, `private`                                |
| 8 | `role`               | dropdown   | Values: `user`, `admin`                                    |
| 9 | `xp`                 | int        | Default: `0`                                               |
|10 | `level`              | int        | Default: `1`                                               |
|11 | `current_streak`     | int        | Default: `0`                                               |
|12 | `best_streak`        | int        | Default: `0`                                               |
|13 | `season_points`      | int        | Default: `0`                                               |
|14 | `total_points`       | int        | Default: `0`                                               |
|15 | `status`             | dropdown   | Values: `active`, `banned`, `deleted`                      |
|16 | `created_at`         | datetime   | Set on user registration                                   |
|17 | `updated_at`         | datetime   | Set on every profile update                                |

**Relationships:**
- Referenced by: `friendships.user_id`, `friendships.friend_id`, `blocks.blocker_id`, `blocks.blocked_id`, `dilemmas.created_by`, `votes.user_id`, `direct_dilemmas.sender_id`, `direct_dilemmas.receiver_id`, `activities.actor_id`, `reactions.user_id`, `comments.user_id`, `notifications.user_id`, `streaks.user_id`, `daily_counters.user_id`, `sessions.user_id`, `leaderboards.user_id`, `user_milestones.user_id`, `badges.user_id`, `shares.user_id`, `reports.reporter_id`, `reports.reported_user_id`, `reports.reviewed_by`

**Notes:**
- `profile_visibility` controls whether the user's profile is visible to non-friends.
- `xp`, `level`, `current_streak`, `best_streak`, `season_points`, and `total_points` are denormalized for fast reads. Update them via application logic whenever the user earns XP, levels up, or completes a streak day.

---

### 2. friendships

> Tracks friend requests and accepted friendships between two users.

| # | Column Name     | Type     | Details                                               |
|---|-----------------|----------|-------------------------------------------------------|
| 1 | `id`            | int      | Auto-increment, Primary Key                           |
| 2 | `user_id`       | int      | References `users.id` -- the user who sent the request|
| 3 | `friend_id`     | int      | References `users.id` -- the user who received it     |
| 4 | `status`        | dropdown | Values: `pending`, `accepted`, `rejected`             |
| 5 | `requested_at`  | datetime | Timestamp when the request was sent                   |
| 6 | `accepted_at`   | datetime | Nullable -- set when status changes to `accepted`     |

**Relationships:**
- `user_id` -> `users.id`
- `friend_id` -> `users.id`

**Notes:**
- Each friendship is stored as a **single row**. The pair (`user_id`, `friend_id`) should be unique -- enforce in app logic.
- To check if two users are friends, query where (`user_id` = A AND `friend_id` = B) OR (`user_id` = B AND `friend_id` = A) with `status` = `accepted`.

---

### 3. blocks

> When a user blocks another user, preventing all interaction.

| # | Column Name  | Type     | Details                                       |
|---|--------------|----------|-----------------------------------------------|
| 1 | `id`         | int      | Auto-increment, Primary Key                   |
| 2 | `blocker_id` | int      | References `users.id` -- the user who blocked |
| 3 | `blocked_id` | int      | References `users.id` -- the user who is blocked |
| 4 | `created_at` | datetime | Timestamp of the block                        |

**Relationships:**
- `blocker_id` -> `users.id`
- `blocked_id` -> `users.id`

**Notes:**
- The pair (`blocker_id`, `blocked_id`) should be unique -- enforce in app logic.
- When checking any interaction (friend requests, direct dilemmas, etc.), always check the blocks table first.

---

### 4. dilemmas

> The core content of LuxSocial -- "Would you rather" style questions with two options.

| # | Column Name     | Type     | Details                                                                                        |
|---|-----------------|----------|------------------------------------------------------------------------------------------------|
| 1 | `id`            | int      | Auto-increment, Primary Key                                                                    |
| 2 | `question_text` | varchar  | The dilemma question                                                                           |
| 3 | `option_a`      | varchar  | First option text                                                                              |
| 4 | `option_b`      | varchar  | Second option text                                                                             |
| 5 | `category`      | dropdown | Values: `lifestyle`, `food`, `travel`, `relationships`, `money`, `hypothetical`, `fun`, `deep`, `sport`, `tech`, `other` |
| 6 | `created_by`    | int      | References `users.id` -- the author                                                            |
| 7 | `is_mystery`    | smallint | `0` = normal, `1` = mystery dilemma (options hidden until answered)                            |
| 8 | `is_featured`   | smallint | `0` = normal, `1` = featured/promoted by admins                                               |
| 9 | `status`        | dropdown | Values: `active`, `inactive`, `deleted`                                                        |
|10 | `votes_a_count` | int      | Default: `0` -- cached count of votes for option A                                             |
|11 | `votes_b_count` | int      | Default: `0` -- cached count of votes for option B                                             |
|12 | `total_votes`   | int      | Default: `0` -- cached total vote count                                                        |
|13 | `created_at`    | datetime | Timestamp of creation                                                                          |

**Relationships:**
- `created_by` -> `users.id`
- Referenced by: `votes.dilemma_id`, `session_dilemmas.dilemma_id`, `shares.dilemma_id`

**Notes:**
- `votes_a_count`, `votes_b_count`, and `total_votes` are **denormalized counters**. Increment them atomically whenever a new vote is cast, so you can display percentages without running a COUNT query.
- `is_mystery` dilemmas: the client should hide option_a and option_b text until the user has voted.

---

### 5. votes

> Records each user's vote on a dilemma.

| # | Column Name     | Type     | Details                                  |
|---|-----------------|----------|------------------------------------------|
| 1 | `id`            | int      | Auto-increment, Primary Key              |
| 2 | `user_id`       | int      | References `users.id`                    |
| 3 | `dilemma_id`    | int      | References `dilemmas.id`                 |
| 4 | `chosen_option` | dropdown | Values: `A`, `B`                         |
| 5 | `voted_at`      | datetime | Timestamp of the vote                    |

**Relationships:**
- `user_id` -> `users.id`
- `dilemma_id` -> `dilemmas.id`

**Notes:**
- The pair (`user_id`, `dilemma_id`) should be unique -- a user can only vote once per dilemma. Enforce in app logic.
- After inserting a vote, increment the corresponding counter on the `dilemmas` table (`votes_a_count` or `votes_b_count` and `total_votes`).

---

### 6. direct_dilemmas

> Private dilemmas sent from one user to another.

| # | Column Name       | Type     | Details                                             |
|---|-------------------|----------|-----------------------------------------------------|
| 1 | `id`              | int      | Auto-increment, Primary Key                         |
| 2 | `sender_id`       | int      | References `users.id`                               |
| 3 | `receiver_id`     | int      | References `users.id`                               |
| 4 | `question_text`   | varchar  | The dilemma question                                |
| 5 | `option_a`        | varchar  | First option text                                   |
| 6 | `option_b`        | varchar  | Second option text                                  |
| 7 | `sender_choice`   | dropdown | Values: `A`, `B`, `none`                            |
| 8 | `receiver_choice` | dropdown | Values: `A`, `B`, `none`                            |
| 9 | `status`          | dropdown | Values: `pending`, `answered`, `expired`, `deleted` |
|10 | `visibility`      | dropdown | Values: `public`, `friends`, `private`              |
|11 | `expires_at`      | datetime | When the direct dilemma expires if unanswered        |
|12 | `created_at`      | datetime | Timestamp of creation                                |

**Relationships:**
- `sender_id` -> `users.id`
- `receiver_id` -> `users.id`

**Notes:**
- `sender_choice` and `receiver_choice` start as `none`. Each is updated when the respective user answers.
- When both choices are filled, set `status` to `answered`.
- If `expires_at` passes without an answer, a scheduled job should set `status` to `expired`.
- `visibility` controls whether the result is shown on the activity feed.

---

### 7. activities

> The social feed. Every meaningful action generates an activity entry.

| # | Column Name      | Type     | Details                                                                                                     |
|---|------------------|----------|-------------------------------------------------------------------------------------------------------------|
| 1 | `id`             | int      | Auto-increment, Primary Key                                                                                 |
| 2 | `actor_id`       | int      | References `users.id` -- who performed the action                                                           |
| 3 | `verb`           | dropdown | Values: `answered`, `asked`, `direct_sent`, `direct_answered`, `streak`, `badge`, `milestone`, `friend_with`, `leveled_up` |
| 4 | `object_type`    | dropdown | Values: `dilemma`, `direct_dilemma`, `user`, `badge`, `milestone`                                           |
| 5 | `object_id`      | int      | ID of the referenced object (polymorphic)                                                                   |
| 6 | `context_text`   | varchar  | Human-readable description, e.g. "answered a dilemma about travel"                                          |
| 7 | `visibility`     | dropdown | Values: `public`, `friends`, `private`                                                                      |
| 8 | `reaction_count` | int      | Default: `0` -- denormalized count of reactions                                                             |
| 9 | `comment_count`  | int      | Default: `0` -- denormalized count of comments                                                              |
|10 | `is_deleted`     | smallint | Default: `0` -- soft delete flag                                                                            |
|11 | `created_at`     | datetime | Timestamp of the activity                                                                                   |

**Relationships:**
- `actor_id` -> `users.id`
- `object_id` -> polymorphic reference (depends on `object_type`)
- Referenced by: `reactions.activity_id`, `comments.activity_id`

**Notes:**
- This is a **polymorphic** table. The `object_type` + `object_id` combo points to a row in one of several tables: `dilemmas`, `direct_dilemmas`, `users`, `badges`, or `milestones`.
- `reaction_count` and `comment_count` are denormalized. Update them when reactions/comments are added or removed.
- Use `is_deleted` for soft-deletes so references from notifications remain valid.

---

### 8. reactions

> Emoji-style reactions on activity feed items.

| # | Column Name   | Type     | Details                                 |
|---|---------------|----------|-----------------------------------------|
| 1 | `id`          | int      | Auto-increment, Primary Key             |
| 2 | `user_id`     | int      | References `users.id`                   |
| 3 | `activity_id` | int      | References `activities.id`              |
| 4 | `type`        | dropdown | Values: `like`, `fire`, `wow`, `sad`    |
| 5 | `created_at`  | datetime | Timestamp of the reaction               |

**Relationships:**
- `user_id` -> `users.id`
- `activity_id` -> `activities.id`

**Notes:**
- The pair (`user_id`, `activity_id`) should be unique -- one reaction per user per activity. Enforce in app logic.
- After insert/delete, update `activities.reaction_count`.

---

### 9. comments

> Text comments on activity feed items.

| # | Column Name   | Type     | Details                                  |
|---|---------------|----------|------------------------------------------|
| 1 | `id`          | int      | Auto-increment, Primary Key              |
| 2 | `user_id`     | int      | References `users.id`                    |
| 3 | `activity_id` | int      | References `activities.id`               |
| 4 | `body`        | varchar  | The comment text                         |
| 5 | `is_deleted`  | smallint | Default: `0` -- soft delete flag         |
| 6 | `created_at`  | datetime | Timestamp of the comment                 |

**Relationships:**
- `user_id` -> `users.id`
- `activity_id` -> `activities.id`

**Notes:**
- Use `is_deleted` for soft-deletes.
- After insert (where `is_deleted` = 0), increment `activities.comment_count`. After soft-delete, decrement it.

---

### 10. notifications

> In-app notifications delivered to users.

| # | Column Name      | Type     | Details                                                                                  |
|---|------------------|----------|------------------------------------------------------------------------------------------|
| 1 | `id`             | int      | Auto-increment, Primary Key                                                              |
| 2 | `user_id`        | int      | References `users.id` -- the recipient                                                   |
| 3 | `type`           | dropdown | Values: `friend_request`, `friend_accepted`, `direct_dilemma`, `reaction`, `comment`, `milestone`, `badge`, `streak`, `system` |
| 4 | `title`          | varchar  | Short notification title                                                                 |
| 5 | `body`           | varchar  | Notification body text                                                                   |
| 6 | `is_read`        | smallint | Default: `0` -- `0` = unread, `1` = read                                                |
| 7 | `reference_type` | dropdown | Values: `user`, `dilemma`, `direct_dilemma`, `activity`, `milestone`, `badge`            |
| 8 | `reference_id`   | int      | ID of the referenced object (polymorphic)                                                |
| 9 | `created_at`     | datetime | Timestamp of the notification                                                            |

**Relationships:**
- `user_id` -> `users.id`
- `reference_id` -> polymorphic reference (depends on `reference_type`)

**Notes:**
- `reference_type` + `reference_id` allow the app to deep-link to the relevant content when the user taps the notification.
- Mark `is_read` = `1` when the user views the notification.
- Consider periodically purging old read notifications (e.g., older than 90 days).

---

### 11. streaks

> Tracks each user's daily activity streak.

| # | Column Name              | Type     | Details                                                  |
|---|--------------------------|----------|----------------------------------------------------------|
| 1 | `id`                     | int      | Auto-increment, Primary Key                              |
| 2 | `user_id`                | int      | References `users.id` -- **Unique** (one row per user)   |
| 3 | `current_streak`         | int      | Default: `0`                                             |
| 4 | `best_streak`            | int      | Default: `0`                                             |
| 5 | `last_activity_date`     | datetime | The last date the user was active                        |
| 6 | `streak_saver_available` | smallint | Default: `0` -- `1` if user has an unused streak saver   |
| 7 | `streak_saver_used_date` | datetime | Nullable -- date the streak saver was last used          |
| 8 | `updated_at`             | datetime | Last time this row was modified                          |

**Relationships:**
- `user_id` -> `users.id` (unique)

**Notes:**
- One row per user. Create the row when the user first answers a dilemma.
- Each day the user answers at least one dilemma, increment `current_streak` and update `last_activity_date`.
- If the user misses a day and `streak_saver_available` = 1, use it (set `streak_saver_available` = 0, set `streak_saver_used_date`). Otherwise reset `current_streak` to 0.
- Always update `best_streak` = MAX(`best_streak`, `current_streak`).
- Sync `current_streak` and `best_streak` back to the `users` table for fast profile reads.

---

### 12. daily_counters

> Tracks how many dilemmas a user has played today (rate limiting).

| # | Column Name    | Type     | Details                                            |
|---|----------------|----------|----------------------------------------------------|
| 1 | `id`           | int      | Auto-increment, Primary Key                        |
| 2 | `user_id`      | int      | References `users.id`                              |
| 3 | `counter_date` | datetime | The date this counter applies to                   |
| 4 | `plays_used`   | int      | Default: `0` -- how many dilemmas answered today   |
| 5 | `plays_limit`  | int      | Default: `10` -- max allowed plays for the day     |
| 6 | `bonus_plays`  | int      | Default: `0` -- extra plays earned via rewards     |
| 7 | `created_at`   | datetime | Timestamp of row creation                          |

**Relationships:**
- `user_id` -> `users.id`

**Notes:**
- The pair (`user_id`, `counter_date`) should be unique -- enforce in app logic.
- Before allowing a user to answer a dilemma, check: `plays_used < plays_limit + bonus_plays`.
- Create a new row each day the user plays. Old rows can be archived/purged periodically.

---

### 13. sessions

> Groups a batch of dilemma answers into a single play session.

| # | Column Name               | Type     | Details                                 |
|---|---------------------------|----------|-----------------------------------------|
| 1 | `id`                      | int      | Auto-increment, Primary Key             |
| 2 | `user_id`                 | int      | References `users.id`                   |
| 3 | `session_date`            | datetime | The date of the session                 |
| 4 | `dilemmas_answered_count` | int      | Default: `0`                            |
| 5 | `xp_earned`               | int      | Default: `0`                            |
| 6 | `created_at`              | datetime | Timestamp of session start              |

**Relationships:**
- `user_id` -> `users.id`
- Referenced by: `session_dilemmas.session_id`

**Notes:**
- A session starts when the user begins a play round and ends when they stop or hit the daily limit.
- Increment `dilemmas_answered_count` and `xp_earned` as the user answers dilemmas within the session.

---

### 14. session_dilemmas

> Junction table linking sessions to the dilemmas answered within them.

| # | Column Name   | Type     | Details                            |
|---|---------------|----------|------------------------------------|
| 1 | `id`          | int      | Auto-increment, Primary Key        |
| 2 | `session_id`  | int      | References `sessions.id`           |
| 3 | `dilemma_id`  | int      | References `dilemmas.id`           |
| 4 | `answered_at` | datetime | Timestamp of the answer            |

**Relationships:**
- `session_id` -> `sessions.id`
- `dilemma_id` -> `dilemmas.id`

**Notes:**
- The pair (`session_id`, `dilemma_id`) should be unique -- enforce in app logic.

---

### 15. leaderboards

> Stores computed leaderboard rankings for various time periods.

| # | Column Name   | Type     | Details                                                              |
|---|---------------|----------|----------------------------------------------------------------------|
| 1 | `id`          | int      | Auto-increment, Primary Key                                         |
| 2 | `user_id`     | int      | References `users.id`                                               |
| 3 | `period_type` | dropdown | Values: `daily`, `weekly`, `season`, `overall`                      |
| 4 | `period_key`  | varchar  | e.g. `"2026-02-16"`, `"2026-W07"`, `"season-1"`, `"all-time"`      |
| 5 | `points`      | int      | Default: `0`                                                        |
| 6 | `rank`        | int      | Default: `0`                                                        |
| 7 | `created_at`  | datetime | Timestamp of row creation                                           |
| 8 | `updated_at`  | datetime | Last recalculation time                                             |

**Relationships:**
- `user_id` -> `users.id`

**Notes:**
- The combo (`user_id`, `period_type`, `period_key`) should be unique -- enforce in app logic.
- `rank` is computed by a scheduled job that sorts all users by `points` descending within each (`period_type`, `period_key`) group.
- For `daily`: `period_key` = `"YYYY-MM-DD"`.
- For `weekly`: `period_key` = `"YYYY-Www"` (ISO week).
- For `season`: `period_key` = `"season-{id}"`.
- For `overall`: `period_key` = `"all-time"`.

---

### 16. milestones

> Definition table for achievements users can unlock.

| # | Column Name     | Type     | Details                                                           |
|---|-----------------|----------|-------------------------------------------------------------------|
| 1 | `id`            | int      | Auto-increment, Primary Key                                      |
| 2 | `name`          | varchar  | e.g. "First Answer", "Streak Master"                             |
| 3 | `description`   | varchar  | Human-readable description of the milestone                      |
| 4 | `threshold`     | int      | The number required to achieve this milestone                    |
| 5 | `milestone_type`| dropdown | Values: `answers`, `streak`, `direct_answers`, `friends`, `level`|
| 6 | `points_reward` | int      | Points awarded when achieved                                     |
| 7 | `badge_icon`    | varchar  | Emoji or icon name for the badge                                 |
| 8 | `created_at`    | datetime | Timestamp of creation                                            |

**Relationships:**
- Referenced by: `user_milestones.milestone_id`

**Notes:**
- This is a **definition/config** table. Rows are created by admins, not by users.
- When a user's count reaches a milestone's `threshold` for the matching `milestone_type`, insert a row into `user_milestones` and award `points_reward`.

---

### 17. user_milestones

> Records which milestones each user has achieved.

| # | Column Name    | Type     | Details                               |
|---|----------------|----------|---------------------------------------|
| 1 | `id`           | int      | Auto-increment, Primary Key           |
| 2 | `user_id`      | int      | References `users.id`                 |
| 3 | `milestone_id` | int      | References `milestones.id`            |
| 4 | `achieved_at`  | datetime | Timestamp of achievement              |

**Relationships:**
- `user_id` -> `users.id`
- `milestone_id` -> `milestones.id`

**Notes:**
- The pair (`user_id`, `milestone_id`) should be unique -- enforce in app logic.
- When inserting, also create an `activities` row (verb = `milestone`) and a `notifications` row.

---

### 18. badges

> Visual badges displayed on a user's profile.

| # | Column Name  | Type     | Details                                              |
|---|--------------|----------|------------------------------------------------------|
| 1 | `id`         | int      | Auto-increment, Primary Key                          |
| 2 | `user_id`    | int      | References `users.id`                                |
| 3 | `badge_name` | varchar  | Display name of the badge                            |
| 4 | `badge_icon` | varchar  | Emoji or icon name                                   |
| 5 | `source`     | dropdown | Values: `milestone`, `streak`, `event`, `admin`      |
| 6 | `earned_at`  | datetime | Timestamp when the badge was earned                  |

**Relationships:**
- `user_id` -> `users.id`

**Notes:**
- Badges can come from multiple sources: unlocking a milestone, achieving a streak, participating in an event, or being awarded manually by an admin.
- The pair (`user_id`, `badge_name`) should be unique -- enforce in app logic.

---

### 19. xp_levels

> Configuration table defining XP thresholds for each level.

| # | Column Name   | Type    | Details                                         |
|---|---------------|---------|-------------------------------------------------|
| 1 | `id`          | int     | Auto-increment, Primary Key                     |
| 2 | `level`       | int     | The level number (1-20+)                        |
| 3 | `xp_required` | int     | Total cumulative XP needed to reach this level  |
| 4 | `title`       | varchar | Display title for this level                    |

**Relationships:**
- None (standalone config table)

**Notes:**
- This is a **configuration** table. Seed it once and update rarely.
- When a user's `xp` reaches or exceeds `xp_required` for the next level, update their `level` on the `users` table.
- See [Seed Data: xp_levels](#seed-data-xp_levels) below for initial data.

---

### 20. seasons

> Defines competitive seasons with start/end dates.

| # | Column Name  | Type     | Details                                          |
|---|--------------|----------|--------------------------------------------------|
| 1 | `id`         | int      | Auto-increment, Primary Key                      |
| 2 | `name`       | varchar  | e.g. "Season 1"                                  |
| 3 | `start_date` | datetime | Season start                                     |
| 4 | `end_date`   | datetime | Season end                                       |
| 5 | `status`     | dropdown | Values: `upcoming`, `active`, `completed`        |
| 6 | `created_at` | datetime | Timestamp of creation                            |

**Relationships:**
- None directly, but `leaderboards.period_key` references season IDs via the pattern `"season-{id}"`.

**Notes:**
- Only one season should be `active` at a time.
- When a season ends, set `status` = `completed`, reset all users' `season_points` to 0, and archive the leaderboard.

---

### 21. events

> Time-limited special events (double points weekends, themed challenges, etc.).

| # | Column Name   | Type     | Details                                                                    |
|---|---------------|----------|----------------------------------------------------------------------------|
| 1 | `id`          | int      | Auto-increment, Primary Key                                               |
| 2 | `name`        | varchar  | Event display name                                                        |
| 3 | `description` | varchar  | Event description                                                         |
| 4 | `event_type`  | dropdown | Values: `double_points`, `special_category`, `weekend_event`, `challenge` |
| 5 | `multiplier`  | float    | Default: `1.0` -- points multiplier during the event                      |
| 6 | `start_date`  | datetime | Event start                                                               |
| 7 | `end_date`    | datetime | Event end                                                                 |
| 8 | `status`      | dropdown | Values: `upcoming`, `active`, `completed`                                 |
| 9 | `created_at`  | datetime | Timestamp of creation                                                     |

**Relationships:**
- None directly.

**Notes:**
- When calculating points for an action, check for active events and apply `multiplier`.
- Multiple events can be active simultaneously (multipliers stack -- or cap at a max, depending on your business rules).

---

### 22. shares

> Tracks when users share dilemmas to external platforms.

| # | Column Name  | Type     | Details                                                    |
|---|--------------|----------|------------------------------------------------------------|
| 1 | `id`         | int      | Auto-increment, Primary Key                                |
| 2 | `user_id`    | int      | References `users.id`                                      |
| 3 | `dilemma_id` | int      | References `dilemmas.id`                                   |
| 4 | `platform`   | dropdown | Values: `whatsapp`, `instagram`, `twitter`, `link`         |
| 5 | `share_url`  | varchar  | The generated share link                                   |
| 6 | `clicks`     | int      | Default: `0` -- number of times the link was clicked       |
| 7 | `installs`   | int      | Default: `0` -- number of app installs attributed to share |
| 8 | `created_at` | datetime | Timestamp of the share action                              |

**Relationships:**
- `user_id` -> `users.id`
- `dilemma_id` -> `dilemmas.id`

**Notes:**
- `clicks` and `installs` are updated by a tracking/analytics system when the share link is visited.
- Use this data to reward users for viral sharing (bonus points, bonus plays, etc.).

---

### 23. reports

> Content moderation reports submitted by users.

| # | Column Name        | Type     | Details                                                                  |
|---|--------------------|----------|--------------------------------------------------------------------------|
| 1 | `id`               | int      | Auto-increment, Primary Key                                             |
| 2 | `reporter_id`      | int      | References `users.id` -- who submitted the report                       |
| 3 | `reported_user_id` | int      | References `users.id` -- the user being reported                        |
| 4 | `content_type`     | dropdown | Values: `dilemma`, `comment`, `activity`, `direct_dilemma`, `user`      |
| 5 | `content_id`       | int      | ID of the reported content (polymorphic)                                |
| 6 | `reason`           | varchar  | User-provided reason for the report                                     |
| 7 | `status`           | dropdown | Values: `pending`, `reviewed`, `resolved`, `dismissed`                  |
| 8 | `resolution`       | varchar  | Nullable -- admin notes on resolution                                   |
| 9 | `reviewed_by`      | int      | Nullable -- references `users.id` (admin who reviewed)                  |
|10 | `created_at`       | datetime | Timestamp of the report                                                 |
|11 | `reviewed_at`      | datetime | Nullable -- timestamp of review                                         |

**Relationships:**
- `reporter_id` -> `users.id`
- `reported_user_id` -> `users.id`
- `reviewed_by` -> `users.id` (nullable)
- `content_id` -> polymorphic reference (depends on `content_type`)

**Notes:**
- `content_type` + `content_id` is a polymorphic reference to the reported content.
- Admin workflow: report starts as `pending`, admin sets it to `reviewed`, then `resolved` or `dismissed`.
- If resolved, the admin may also ban the reported user (update `users.status` = `banned`) or delete the content.

---

### 24. point_rules

> Configuration table defining how many points each action awards.

| # | Column Name      | Type    | Details                                                |
|---|------------------|---------|--------------------------------------------------------|
| 1 | `id`             | int     | Auto-increment, Primary Key                            |
| 2 | `action_type`    | varchar | **Unique** -- e.g. "answer_dilemma", "send_direct"     |
| 3 | `points_awarded` | int     | Points given for this action                           |
| 4 | `description`    | varchar | Human-readable description of the action               |

**Relationships:**
- None (standalone config table)

**Notes:**
- This is a **configuration** table. Seed it once and adjust values for balancing.
- Your application logic should look up the `points_awarded` value by `action_type` whenever a scoring event occurs.
- See [Seed Data: point_rules](#seed-data-point_rules) below for initial data.

---

## Seed Data

### Seed Data: xp_levels

> Insert these 20 rows into the `xp_levels` table after creation. XP curve is exponential to reward long-term engagement.

| level | xp_required | title            |
|------:|------------:|------------------|
|     1 |           0 | Newcomer         |
|     2 |         100 | Curious          |
|     3 |         250 | Explorer         |
|     4 |         500 | Thinker          |
|     5 |         850 | Debater          |
|     6 |       1,300 | Philosopher      |
|     7 |       1,900 | Strategist       |
|     8 |       2,700 | Visionary        |
|     9 |       3,800 | Influencer       |
|    10 |       5,200 | Trailblazer      |
|    11 |       7,000 | Maverick         |
|    12 |       9,500 | Champion         |
|    13 |      12,500 | Legend           |
|    14 |      16,500 | Titan            |
|    15 |      21,500 | Mastermind       |
|    16 |      28,000 | Grandmaster      |
|    17 |      36,000 | Mythic           |
|    18 |      46,000 | Transcendent     |
|    19 |      60,000 | Immortal         |
|    20 |      80,000 | LuxSocial Elite  |

**How to seed in NoCodeBackend:**
1. Open the `xp_levels` table in the NoCodeBackend data browser.
2. Click **Add Row** and enter each row manually, OR use the **Import CSV** feature with the following CSV:

```csv
level,xp_required,title
1,0,Newcomer
2,100,Curious
3,250,Explorer
4,500,Thinker
5,850,Debater
6,1300,Philosopher
7,1900,Strategist
8,2700,Visionary
9,3800,Influencer
10,5200,Trailblazer
11,7000,Maverick
12,9500,Champion
13,12500,Legend
14,16500,Titan
15,21500,Mastermind
16,28000,Grandmaster
17,36000,Mythic
18,46000,Transcendent
19,60000,Immortal
20,80000,LuxSocial Elite
```

---

### Seed Data: point_rules

> Insert these rows into the `point_rules` table. These define the point economy for all scoring actions.

| action_type              | points_awarded | description                                              |
|--------------------------|---------------:|----------------------------------------------------------|
| `answer_dilemma`         |             10 | User answers a public dilemma                            |
| `create_dilemma`         |             15 | User creates a new public dilemma                        |
| `send_direct`            |              5 | User sends a direct dilemma to another user              |
| `answer_direct`          |             10 | User answers a direct dilemma they received              |
| `receive_vote`           |              2 | Someone votes on a dilemma the user created              |
| `daily_login`            |              5 | User logs in / opens app for the first time today        |
| `streak_day`             |              5 | Bonus points per day of active streak                    |
| `streak_7`               |             50 | Bonus for reaching a 7-day streak                        |
| `streak_30`              |            200 | Bonus for reaching a 30-day streak                       |
| `streak_100`             |          1,000 | Bonus for reaching a 100-day streak                      |
| `milestone_achieved`     |             25 | Base bonus when any milestone is unlocked                |
| `level_up`               |             20 | Bonus when the user levels up                            |
| `first_share`            |             25 | Bonus for sharing a dilemma for the first time           |
| `share_dilemma`          |              5 | Points per dilemma share (after first)                   |
| `share_install`          |            100 | Bonus when a share link leads to a new app install       |
| `receive_reaction`       |              2 | Someone reacts to the user's activity                    |
| `add_friend`             |             10 | User makes a new friend (both users get points)          |
| `complete_session_5`     |             15 | Bonus for answering 5 dilemmas in a single session       |
| `complete_session_10`    |             30 | Bonus for answering 10 dilemmas in a single session      |
| `event_participation`    |             20 | Bonus for participating in a special event               |

```csv
action_type,points_awarded,description
answer_dilemma,10,User answers a public dilemma
create_dilemma,15,User creates a new public dilemma
send_direct,5,User sends a direct dilemma to another user
answer_direct,10,User answers a direct dilemma they received
receive_vote,2,Someone votes on a dilemma the user created
daily_login,5,User logs in or opens app for the first time today
streak_day,5,Bonus points per day of active streak
streak_7,50,Bonus for reaching a 7-day streak
streak_30,200,Bonus for reaching a 30-day streak
streak_100,1000,Bonus for reaching a 100-day streak
milestone_achieved,25,Base bonus when any milestone is unlocked
level_up,20,Bonus when the user levels up
first_share,25,Bonus for sharing a dilemma for the first time
share_dilemma,5,Points per dilemma share after first
share_install,100,Bonus when a share link leads to a new app install
receive_reaction,2,Someone reacts to the users activity
add_friend,10,User makes a new friend and both users get points
complete_session_5,15,Bonus for answering 5 dilemmas in a single session
complete_session_10,30,Bonus for answering 10 dilemmas in a single session
event_participation,20,Bonus for participating in a special event
```

---

### Seed Data: milestones

> Insert these rows into the `milestones` table. These define all the achievements users can unlock.

#### Answer Milestones (milestone_type: `answers`)

| name                  | description                               | threshold | milestone_type | points_reward | badge_icon     |
|-----------------------|-------------------------------------------|----------:|----------------|--------------|----------------|
| First Answer          | Answer your very first dilemma            |         1 | answers        |           10 | star           |
| Getting Started       | Answer 10 dilemmas                        |        10 | answers        |           25 | thumbs_up      |
| Dilemma Enthusiast    | Answer 50 dilemmas                        |        50 | answers        |           50 | fire           |
| Century Club          | Answer 100 dilemmas                       |       100 | answers        |          100 | hundred        |
| Dilemma Addict        | Answer 250 dilemmas                       |       250 | answers        |          200 | lightning      |
| Decision Machine      | Answer 500 dilemmas                       |       500 | answers        |          400 | robot          |
| Dilemma Legend        | Answer 1000 dilemmas                      |     1,000 | answers        |        1,000 | trophy         |
| The Oracle            | Answer 2500 dilemmas                      |     2,500 | answers        |        2,500 | crystal_ball   |

#### Streak Milestones (milestone_type: `streak`)

| name                  | description                               | threshold | milestone_type | points_reward | badge_icon     |
|-----------------------|-------------------------------------------|----------:|----------------|--------------|----------------|
| On Fire               | Reach a 3-day streak                      |         3 | streak         |           15 | flame          |
| Week Warrior          | Reach a 7-day streak                      |         7 | streak         |           50 | calendar       |
| Streak Master         | Reach a 14-day streak                     |        14 | streak         |          100 | medal          |
| Monthly Maniac        | Reach a 30-day streak                     |        30 | streak         |          250 | crown          |
| Streak Legend         | Reach a 100-day streak                    |       100 | streak         |        1,000 | diamond        |
| Unstoppable           | Reach a 365-day streak                    |       365 | streak         |        5,000 | infinity       |

#### Direct Dilemma Milestones (milestone_type: `direct_answers`)

| name                  | description                               | threshold | milestone_type  | points_reward | badge_icon     |
|-----------------------|-------------------------------------------|----------:|-----------------|--------------|----------------|
| Direct Debut          | Answer your first direct dilemma          |         1 | direct_answers  |           10 | envelope       |
| Direct Enthusiast     | Answer 25 direct dilemmas                 |        25 | direct_answers  |           50 | chat           |
| Direct Master         | Answer 100 direct dilemmas                |       100 | direct_answers  |          200 | bullseye       |
| Direct Legend          | Answer 500 direct dilemmas               |       500 | direct_answers  |        1,000 | rocket         |

#### Friends Milestones (milestone_type: `friends`)

| name                  | description                               | threshold | milestone_type | points_reward | badge_icon     |
|-----------------------|-------------------------------------------|----------:|----------------|--------------|----------------|
| First Friend          | Make your first friend                    |         1 | friends        |           10 | handshake      |
| Social Butterfly      | Make 10 friends                           |        10 | friends        |           50 | butterfly      |
| Popular               | Make 50 friends                           |        50 | friends        |          150 | sparkles       |
| Social Legend          | Make 100 friends                          |       100 | friends        |          500 | globe          |

#### Level Milestones (milestone_type: `level`)

| name                  | description                               | threshold | milestone_type | points_reward | badge_icon     |
|-----------------------|-------------------------------------------|----------:|----------------|--------------|----------------|
| Level 5               | Reach level 5                             |         5 | level          |           50 | arrow_up       |
| Level 10              | Reach level 10                            |        10 | level          |          150 | zap            |
| Level 15              | Reach level 15                            |        15 | level          |          400 | star2          |
| Level 20              | Reach the maximum level                   |        20 | level          |        2,000 | gem            |

**CSV for milestones import:**

```csv
name,description,threshold,milestone_type,points_reward,badge_icon
First Answer,Answer your very first dilemma,1,answers,10,star
Getting Started,Answer 10 dilemmas,10,answers,25,thumbs_up
Dilemma Enthusiast,Answer 50 dilemmas,50,answers,50,fire
Century Club,Answer 100 dilemmas,100,answers,100,hundred
Dilemma Addict,Answer 250 dilemmas,250,answers,200,lightning
Decision Machine,Answer 500 dilemmas,500,answers,400,robot
Dilemma Legend,Answer 1000 dilemmas,1000,answers,1000,trophy
The Oracle,Answer 2500 dilemmas,2500,answers,2500,crystal_ball
On Fire,Reach a 3-day streak,3,streak,15,flame
Week Warrior,Reach a 7-day streak,7,streak,50,calendar
Streak Master,Reach a 14-day streak,14,streak,100,medal
Monthly Maniac,Reach a 30-day streak,30,streak,250,crown
Streak Legend,Reach a 100-day streak,100,streak,1000,diamond
Unstoppable,Reach a 365-day streak,365,streak,5000,infinity
Direct Debut,Answer your first direct dilemma,1,direct_answers,10,envelope
Direct Enthusiast,Answer 25 direct dilemmas,25,direct_answers,50,chat
Direct Master,Answer 100 direct dilemmas,100,direct_answers,200,bullseye
Direct Legend,Answer 500 direct dilemmas,500,direct_answers,1000,rocket
First Friend,Make your first friend,1,friends,10,handshake
Social Butterfly,Make 10 friends,10,friends,50,butterfly
Popular,Make 50 friends,50,friends,150,sparkles
Social Legend,Make 100 friends,100,friends,500,globe
Level 5,Reach level 5,5,level,50,arrow_up
Level 10,Reach level 10,10,level,150,zap
Level 15,Reach level 15,15,level,400,star2
Level 20,Reach the maximum level,20,level,2000,gem
```

---

## Relationship Map

Below is a summary of all logical foreign key relationships across the 24 tables.

```
users
 |
 |-- friendships.user_id
 |-- friendships.friend_id
 |-- blocks.blocker_id
 |-- blocks.blocked_id
 |-- dilemmas.created_by
 |-- votes.user_id
 |-- direct_dilemmas.sender_id
 |-- direct_dilemmas.receiver_id
 |-- activities.actor_id
 |-- reactions.user_id
 |-- comments.user_id
 |-- notifications.user_id
 |-- streaks.user_id
 |-- daily_counters.user_id
 |-- sessions.user_id
 |-- leaderboards.user_id
 |-- user_milestones.user_id
 |-- badges.user_id
 |-- shares.user_id
 |-- reports.reporter_id
 |-- reports.reported_user_id
 |-- reports.reviewed_by
 |
dilemmas
 |-- votes.dilemma_id
 |-- session_dilemmas.dilemma_id
 |-- shares.dilemma_id
 |
activities
 |-- reactions.activity_id
 |-- comments.activity_id
 |
sessions
 |-- session_dilemmas.session_id
 |
milestones
 |-- user_milestones.milestone_id
```

**Polymorphic References (require app-level resolution):**
- `activities`: `object_type` + `object_id` -> dilemmas, direct_dilemmas, users, badges, or milestones
- `notifications`: `reference_type` + `reference_id` -> users, dilemmas, direct_dilemmas, activities, milestones, or badges
- `reports`: `content_type` + `content_id` -> dilemmas, comments, activities, direct_dilemmas, or users

---

## Creation Order

Create the tables in this order to ensure that referenced tables exist before the tables that reference them. Since NoCodeBackend does not enforce foreign keys at the database level, this order is a **best practice** rather than a strict requirement.

| Order | Table              | Depends On                          |
|------:|--------------------|-------------------------------------|
|     1 | `users`            | --                                  |
|     2 | `xp_levels`        | --                                  |
|     3 | `point_rules`      | --                                  |
|     4 | `milestones`       | --                                  |
|     5 | `seasons`          | --                                  |
|     6 | `events`           | --                                  |
|     7 | `friendships`      | users                               |
|     8 | `blocks`           | users                               |
|     9 | `dilemmas`         | users                               |
|    10 | `votes`            | users, dilemmas                     |
|    11 | `direct_dilemmas`  | users                               |
|    12 | `activities`       | users                               |
|    13 | `reactions`        | users, activities                   |
|    14 | `comments`         | users, activities                   |
|    15 | `notifications`    | users                               |
|    16 | `streaks`          | users                               |
|    17 | `daily_counters`   | users                               |
|    18 | `sessions`         | users                               |
|    19 | `session_dilemmas` | sessions, dilemmas                  |
|    20 | `leaderboards`     | users                               |
|    21 | `user_milestones`  | users, milestones                   |
|    22 | `badges`           | users                               |
|    23 | `shares`           | users, dilemmas                     |
|    24 | `reports`          | users                               |

**After creating all tables, seed the following configuration tables:**
1. `xp_levels` -- 20 rows (see seed data above)
2. `point_rules` -- 20 rows (see seed data above)
3. `milestones` -- 26 rows (see seed data above)

---

> **Document generated for the LuxSocial project -- nocodebackend.com database setup guide.**
