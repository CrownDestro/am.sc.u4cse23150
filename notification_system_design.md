## Stage 1

REST API design, contract and structure.

### Core actions
- Notifications (organized by type with filter option)
- Mark notifications as read
- Create notification (Only for Admin)

###  http Headers
#### Request header:
```
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

#### Response header:
```
Content-Type: application/json
XYZ-Request-Id: <uuid>
```


### Data model
Notification object example:
```json
{
  "id": "1",
  "userId": "test_user",
  "type": "placement",
  "title": "Placement drive open",
  "body": "XYZ company reg. closes at 9 Am.",
  "data": {
    "companyId": "cmp_1",
    "driveId": "drive_2026"
  },
  "priority": "high",
  "channel": "app",
  "read": false,
  "dismissed": false,
  "createdAt": "2026-05-06T10:20:30Z",
  "updatedAt": "2026-05-06T10:20:30Z"
}
```

#### Allowed enums:
- `priority`: `low`, `medium`, `high`
- `channel`: `app`, `email`, `sms`
- `type`: `placement`, `event`, `result`, `sys`


### Endpoints

#### 1) List notifications
`GET /notifications`

params:
- `read` (true | false)
- `dismissed` (true | false)
- `type` (placement | event | result | sys)

Response 200:
```json
{
  "items": [
    {
      "id": "1",
      "userId": "usr_123",
      "type": "event",
      "title": "Tech Talk",
      "body": "Distributed systems Expert session in acharya hall",
      "data": { "eventId": "event_1" },
      "priority": "medium",
      "channel": "app",
      "read": false,
      "dismissed": false,
      "createdAt": "2026-05-06T10:20:30Z",
      "updatedAt": "2026-05-06T10:20:30Z"
    }
  ],
}
```

#### 2) Get Notification
`GET /notifications/{notificationId}`

Response 200:
```json
{
  "id": "1",
  "userId": "usr_123",
  "type": "result",
  "title": "Semester results published",
  "body": "Your results are out.",
  "data": { "resultId": "result_2026_S6" },
  "priority": "high",
  "channel": "app",
  "read": true,
  "dismissed": false,
  "createdAt": "2026-05-06T10:20:30Z",
  "updatedAt": "2026-05-06T10:20:30Z"
}
```

#### 3) Mark notifications as read
`POST /notifications/read`

Request body:
```json
{
  "ids": ["2", "1"],
  "read": true
}
```

Response 200:
```json
{
  "updated": 2
}
```

#### 4) Dismiss notification
`POST /notifications/dismiss`

Request body:
```json
{
  "ids": ["2"],
  "dismissed": true
}
```

Response 200:
```json
{
  "updated": 1
}
```

#### 5) Create notification (by Admin)
`POST /notifications`

Request body:
```json
{
  "userId": "usr_123",
  "type": "placement",
  "title": "Placement drive open",
  "body": "XYZ company reg. closes at 9 Am.",
  "data": { "companyId": "cmp_1", "driveId": "drv_2026" },
  "priority": "high",
  "channel": "app"
}
```


### Real-time notifications
Use SSE (server sent events) for real-time delivery to logged-in users.


### Error format
Standard error response:
```json
{
  "error": {
    "code": "not_found",
    "message": "Notification not found",
    "requestId": "req_123"
  }
}
```