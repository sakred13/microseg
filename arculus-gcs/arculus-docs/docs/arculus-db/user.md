---
sidebar_position: 3
---
# Table: user

The `user` table stores information about the users of the system. Below is a detailed description of each column in the table, its use, and any foreign keys it holds.

| Column Name     | Data Type    | Description                               | Foreign Key Reference       |
|-----------------|--------------|-------------------------------------------|-----------------------------|
| `user_id`       | SERIAL       | Unique identifier for each user.          |                             |
| `email`         | VARCHAR(30)  | Email address of the user.                |                             |
| `username`      | VARCHAR(20)  | Username chosen by the user.              |                             |
| `role_id`       | INT          | Identifier for the user's role.           | `role(role_id)`             |
| `password_hash` | VARCHAR(100) | Hashed password for user authentication.  |                             |

## Column Descriptions

- **user_id**: This is a unique identifier for each user in the table. It is of type `SERIAL`, which means it is auto-incremented.
- **email**: This column stores the email address of the user. It is a `VARCHAR` field with a maximum length of 30 characters.
- **username**: This column holds the username chosen by the user. It is a `VARCHAR` field with a maximum length of 20 characters.
- **role_id**: This column references the user's role in the system. It is an `INT` field and is a foreign key that references the `role_id` column in the `role` table.
- **password_hash**: This column stores the hashed password for user authentication. It is a `VARCHAR` field with a maximum length of 100 characters.
