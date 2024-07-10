---
sidebar_position: 6
---
# Table: mission

The `mission` table stores information about the various missions within the system. Below is a detailed description of each column in the table, its use, and any foreign keys it holds.

| Column Name      | Data Type    | Description                                             | Foreign Key Reference       |
|------------------|--------------|---------------------------------------------------------|-----------------------------|
| `mission_id`     | SERIAL       | Unique identifier for each mission.                     |                             |
| `mission_type`   | VARCHAR(50)  | Type of the mission.                                    |                             |
| `creator_id`     | INT          | Identifier for the user who created the mission.        | `user(user_id)`             |
| `mission_config` | TEXT         | Configuration details for the mission.                  |                             |
| `create_time`    | TIMESTAMP    | Timestamp when the mission was created.                 |                             |
| `duration_sec`   | INT          | Duration of the mission in seconds.                     |                             |
| `criticality`    | FLOAT        | Criticality level of the mission.                       |                             |
| `state`          | VARCHAR(15)  | Current state of the mission.                           |                             |

## Column Descriptions

- **mission_id**: This is a unique identifier for each mission in the table. It is of type `SERIAL`, which means it is auto-incremented.
- **mission_type**: This column stores the type of the mission. It is a `VARCHAR` field with a maximum length of 50 characters.
- **creator_id**: This column references the user who created the mission. It is an `INT` field and is a foreign key that references the `user_id` column in the `user` table.
- **mission_config**: This column holds the configuration details for the mission. It is a `TEXT` field that holds JSON information of which devices are used for the mission, who the creator, supervisors, and viewers are, and the destination co-ordinates.
- **create_time**: This column stores the timestamp when the mission was created. It is a `TIMESTAMP` field.
- **duration_sec**: This column indicates the duration of the mission in seconds. It is an `INT` field.
- **criticality**: This column stores the criticality level of the mission. It is a `FLOAT` field.
- **state**: This column holds the current state of the mission. It is a `VARCHAR` field with a maximum length of 15 characters.
