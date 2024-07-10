---
sidebar_position: 2
---

# Table: role

The `role` table holds all user roles within Arculus. It is used to authorize users to access only the UI and API functionalities they are permitted to use on Arculus. Below is a detailed description of each column in the table.

| Column Name | Data Type   | Description                                          | Foreign Key Reference |
|-------------|-------------|------------------------------------------------------|-----------------------|
| `role_id`   | SERIAL      | Unique identifier for each role.                     |                       |
| `role_name` | VARCHAR(20) | Name of the role.                                     |                       |

## Column Descriptions

- **role_id**: This is a unique identifier for each role in the table. It is of type `SERIAL`, which means it is auto-incremented.
- **role_name**: This column stores the name of the role. It is a `VARCHAR` field with a maximum length of 20 characters.
