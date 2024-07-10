---
sidebar_position: 4
---
# Table: trusted_device

The `trusted_device` table stores information about the devices that are configured with their respective virtualized functionality. Below is a detailed description of each column in the table, its use, and any foreign keys it holds.

| Column Name      | Data Type    | Description                              | Foreign Key Reference |
|------------------|--------------|------------------------------------------|-----------------------|
| `device_id`      | SERIAL       | Unique identifier for each device.       |                       |
| `device_name`    | VARCHAR(40)  | Name of the device.                      |                       |
| `ip_address`     | VARCHAR(20)  | IP address of the device.                |                       |
| `device_type`    | VARCHAR(40)  | Type of the device.                      |                       |

## Column Descriptions

- **device_id**: This is a unique identifier for each device in the table. It is of type `SERIAL`, which means it is auto-incremented.
- **device_name**: This column stores the name of the device. It is a `VARCHAR` field with a maximum length of 40 characters.
- **ip_address**: This column holds the IP address of the device. It is a `VARCHAR` field with a maximum length of 20 characters.
- **device_type**: This column stores the type of the device. It is a `VARCHAR` field with a maximum length of 40 characters.
