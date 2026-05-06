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

## Stage 2

**which recommended DB will you use?:** 
- PostgreSQL

**Explain:**
- Strong consistency.
- JSONB will be supported for json formatting in postgres
- Perfect indexing over large data of tables.


### Schema (in SQL)
```sql

CREATE TABLE users (
  id TEXT PRIMARY KEY
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL ,
  type TEXT NOT NULL CHECK (type IN ('placement', 'event', 'result', 'sys')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,

  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  channel TEXT NOT NULL CHECK (channel IN ('app', 'email', 'sms')),

  read BOOLEAN NOT NULL DEFAULT false,
  dismissed BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

```

### what problems could arise as the data volume increases and How to solve such issues.
**Issues are** 
- Large tables
- High Write volumes
- Hot users

**Solutions:**
- Make time based partitioning and archive old ones. 
- Use Batching technique for bulk inserts to queues.
- Use redis cache for recent notifications.

### Queries

#### 1) List notifications
```sql
SELECT * FROM notifications WHERE user_id = $1
ORDER BY created_at DESC LIMIT $2;
```

#### 2) Get notification
```sql
SELECT * FROM notifications WHERE id = $1 AND user_id = $2;
```

#### 3) Mark notifications as read
```sql
UPDATE notifications
SET read = true, updated_at = now()
WHERE user_id = $1 AND id = $2```

#### 4) Dismiss notifications
```sql
UPDATE notifications
SET dismissed = true, updated_at = now()
WHERE user_id = $1 AND id = $2```

#### 5) Create notification
```sql
INSERT INTO notifications (
  id, user_id, type, title, body, data, priority, channel
)
VALUES (
  $1, $2, $3, $4, $5, $6::jsonb, $7, $8
);
```