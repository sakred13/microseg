# Table: device_task

The `device_task` table is a junction table that associates devices and their respective tasks. Below is a detailed description of each column in the table, its use, and any foreign keys it holds.

| Column Name | Data Type | Description                                  | Foreign Key Reference                |
|-------------|-----------|----------------------------------------------|--------------------------------------|
| `dt_id`     | SERIAL    | Unique identifier for each device-task pair. |                                      |
| `device_id` | INT       | Identifier for the device.                   | `trusted_device(device_id)`          |
| `task_id`   | INT       | Identifier for the task.                     | `task(task_id)`                      |

## Column Descriptions

- **dt_id**: This is a unique identifier for each device-task pair in the table. It is of type `SERIAL`, which means it is auto-incremented.
- **device_id**: This column references the device associated with the task. It is an `INT` field and is a foreign key that references the `device_id` column in the `trusted_device` table.
- **task_id**: This column references the task associated with the device. It is an `INT` field and is a foreign key that references the `task_id` column in the `task` table.
