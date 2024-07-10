---
sidebar_position: 8
---
# Table: viewer

The `viewer` table is used to associate users as viewers to missions based on their respective roles. Below is a detailed description of each column in the table, its use, and any foreign keys it holds.

| Column Name   | Data Type | Description                              | Foreign Key Reference          |
|---------------|-----------|------------------------------------------|--------------------------------|
| `viewer_id`   | SERIAL    | Unique identifier for each viewer role   |                                |
| `user_id`     | INT       | Identifier for the user                  | `user(user_id)`                |
| `mission_id`  | INT       | Identifier for the mission               | `mission(mission_id)`          |

## Column Descriptions

- **viewer_id**: This is a unique identifier for each viewer role in the table. It is of type `SERIAL`, which means it is auto-incremented.
- **user_id**: This column references the user assigned as a viewer. It is an `INT` field and is a foreign key that references the `user_id` column in the `user` table.
- **mission_id**: This column references the mission the user is viewing. It is an `INT` field and is a foreign key that references the `mission_id` column in the `mission` table.
``` &#8203;:citation[oaicite:0]{index=0}&#8203;
