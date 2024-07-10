# Policy APIs

The Policy APIs are used to create network policies between devices to control their network ingress and egress using Software-Defined Networking (SDN).

## GET GetNetworkPolicies

**Method**: GET

**URL**: http://{serverIP}:3001/policy/getNetworkPolicies?authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5MzMxNzYsImV4cCI6MTcxODkzNjc3Nn0.MMGXVLY9-F7zACJc_70L5IQeAjKzcxb2my2_4X_AxEM

**Description**: The /getNetworkPolicies API fetches all the network policies among devices when an authorized user requests it.

### Query Parameters
- **authToken**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5MzMxNzYsImV4cCI6MTcxODkzNjc3Nn0.MMGXVLY9-F7zACJc_70L5IQeAjKzcxb2my2_4X_AxEM

### Response
**Status**: OK (200)

```json
[
    {
        "name": "default-deny",
        "podSelector": {},
        "policyTypes": [
            "Ingress",
            "Egress"
        ]
    },
    {
        "name": "policy-survdrone",
        "podSelector": {
            "matchLabels": {
                "app": "survdrone"
            }
        },
        "policyTypes": [
            "Ingress",
            "Egress"
        ],
        "ingress": [
            {
                "from": [
                    {
                        "podSelector": {
                            "matchLabels": {
                                "app": "surveillancedrone"
                            }
                        }
                    }
                ],
                "ports": [
                    {
                        "port": 8080,
                        "protocol": "TCP"
                    }
                ]
            }
        ],
        "egress": [
            {
                "ports": [
                    {
                        "port": 8000,
                        "protocol": "UDP"
                    }
                ],
                "to": [
                    {
                        "podSelector": {
                            "matchLabels": {
                                "app": "newdemodrone"
                            }
                        }
                    }
                ]
            }
        ]
    }
]
```

## POST AddNetworkPolicy

**Method**: POST

**URL**: http://{serverIP}:3001/policy/addNetworkPolicy

**Description**: This API is used to create a new network policy with ingress and egress rules for a device.

### Request Body
```json
{

    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5MzMxNzYsImV4cCI6MTcxODkzNjc3Nn0.MMGXVLY9-F7zACJc_70L5IQeAjKzcxb2my2_4X_AxEM",

    "device": "survdrone",

    "ingress": [

        {

            "device": "surveillancedrone",

            "port": "8080",

            "protocol": "TCP"

        }

    ],

    "egress": [

        {

            "device": "newdemodrone",

            "port": "8000",

            "protocol": "UDP"

        }

    ]

}
```

## DeleteNetworkPolicy

**Method**: DELETE

**URL**: http://{serverIP}:3001/policy/deleteNetworkPolicy

**Description**: This API is used to delete an existing network policy.

### Request Body
```json
{

    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5MzMxNzYsImV4cCI6MTcxODkzNjc3Nn0.MMGXVLY9-F7zACJc_70L5IQeAjKzcxb2my2_4X_AxEM",

    "policyName": "policy-survdrone"

}
```

### Response
**Status**: OK (200)

```json
{
    "message": "NetworkPolicy deleted successfully"
}
```

