---
sidebar_position: 5
---
# Table: task

The `task` table is used to configure the various tasks, their allowed ingress and egress available in Arculus. Below is a detailed description of each column in the table and its use.

| Column Name    | Data Type    | Description                              | Foreign Key Reference |
|----------------|--------------|------------------------------------------|-----------------------|
| `task_id`      | SERIAL       | Unique identifier for each task.         |                       |
| `task_name`    | VARCHAR(30)  | Name of the task.                        |                       |
| `task_type`    | VARCHAR(20)  | Type of the task.                        |                       |
| `traffic_type` | VARCHAR(20)  | Type of network traffic (ingress/egress).|                       |
| `traffic_port` | INT          | Network port used by the task.           |                       |

## Column Descriptions

- **task_id**: This is a unique identifier for each task in the table. It is of type `SERIAL`, which means it is auto-incremented.
- **task_name**: This column stores the name of the task. It is a `VARCHAR` field with a maximum length of 30 characters.
- **task_type**: This column holds the type of the task. It is a `VARCHAR` field with a maximum length of 20 characters.
- **traffic_type**: This column indicates the type of network traffic (ingress or egress) associated with the task. It is a `VARCHAR` field with a maximum length of 20 characters.
- **traffic_port**: This column stores the network port used by the task. It is an `INT` field.
