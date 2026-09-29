# Product Requirements

## 1. Dashboard

### 1.1 Overview Metrics

Dashboard 必須提供招聘總覽。

包含：

* Open Jobs
* Candidates
* Applications
* Interviews
* Offers

---

### 1.2 Application Trend

顯示一段時間內的應徵數量變化。

例如：

```text
Date
Applications
```

---

### 1.3 Recruitment Funnel

顯示候選人招聘流程。

```text
Applied
↓
Screening
↓
Interview
↓
Offer
↓
Hired
```

---

### 1.4 Recent Applications

顯示最近的應徵紀錄。

---

# 2. Job Management

## 2.1 Job List

使用者可以查看職缺列表。

列表需要支援：

* Search
* Filter
* Sort
* Pagination

---

## 2.2 Search

可以依照關鍵字搜尋職缺。

搜尋範圍可以包含：

* Job Title
* Description

---

## 2.3 Filter

可以依照以下條件篩選：

* Status
* Department
* Work Type

---

## 2.4 Sort

可以依照：

* Title
* Department
* Created At
* Updated At

進行排序。

---

## 2.5 Pagination

職缺列表需要支援分頁。

使用者可以調整：

* Page Size
* Current Page

---

## 2.6 Create Job

使用者可以建立新的職缺。

職缺資訊包含：

* Title
* Description
* Department
* Location
* Work Type
* Salary Min
* Salary Max
* Experience
* Education
* Required Skills
* Status

---

## 2.7 Edit Job

使用者可以修改職缺資料。

---

## 2.8 Delete Job

使用者可以刪除職缺。

刪除操作需要有確認流程。

---

## 2.9 Job Detail

可以查看：

* Job Information
* Description
* Required Skills
* System Information

System Information：

* Created At
* Updated At

---

# 3. Candidate Management

## 3.1 Candidate List

可以查看候選人列表。

---

## 3.2 Candidate Detail

可以查看：

* Basic Information
* Resume
* Skills
* Application History
* Interview History
* Offer History
* Notes

---

## 3.3 Candidate Notes

HR / Recruiter 可以新增與管理候選人備註。

---

# 4. Application Management

## 4.1 Application Status

Application 支援：

```text
Applied
Screening
Interview
Offer
Hired
Rejected
```

---

## 4.2 Application Kanban

使用 Kanban 顯示 Application。

例如：

```text
Applied
│
├── Candidate A
└── Candidate B

Screening
│
└── Candidate C

Interview
│
└── Candidate D

Offer
│
└── Candidate E
```

---

## 4.3 Change Status

使用者可以修改 Application Status。

未來可以支援：

```text
Drag & Drop
```

---

# 5. Interview Management

## 5.1 Interview Calendar

使用 Calendar 顯示面試。

---

## 5.2 Create Interview

建立面試需要：

* Candidate
* Job
* Interviewer
* Interview Stage
* Date
* Time
* Mode
* Meeting Link
* Location
* Notes
* Status

---

## 5.3 Edit Interview

可以修改面試資訊。

---

## 5.4 Delete Interview

可以刪除面試。

需要有確認流程。

---

## 5.5 Interview Feedback

面試官可以提供：

* Feedback
* Score
* Notes

---

# 6. Offer Management

## 6.1 Offer Information

Offer 包含：

* Candidate
* Job
* Salary
* Start Date
* Expiration Date
* Benefits
* Message
* Status

---

## 6.2 Offer Status

```text
Draft
Sent
Accepted
Rejected
```

---

## 6.3 Offer CRUD

使用者可以：

* Create
* Read
* Update
* Delete

Offer。

---

# 7. Notification

系統需要提供 Notification。

例如：

```text
Interview scheduled
Application status updated
Offer accepted
```

---

# 8. Audit Log

系統需要記錄重要操作。

Audit Log 欄位：

* Actor
* Action
* Target
* Timestamp
* Details

---

## Example

```text
Actor:
HR User

Action:
Update Job

Target:
Frontend Engineer

Timestamp:
2026-09-24 14:30

Details:
Changed status from draft to open
```

---

# 9. Authentication

系統未來需要登入功能。

登入流程：

```text
Login
↓
Authentication
↓
Get Current User
↓
Dashboard
```

---

# 10. Authorization

系統需要依照 Permission 控制功能。

Permission 範例：

```text
job.read
job.create
job.update

candidate.read
candidate.update

application.read
application.update

interview.read
interview.create
interview.feedback

offer.read
offer.create
```

---

# 11. Error Handling

系統需要處理：

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

---

# 12. Loading State

API 操作期間需要顯示 Loading State。

例如：

```text
Loading...
```

Button 在送出資料時也需要避免重複提交。

---

# 13. Empty State

當沒有資料時需要顯示 Empty State。

例如：

```text
目前沒有職缺資料
```

---

# 14. Accessibility

所有主要功能需要考慮：

* Keyboard Navigation
* Focus State
* Label
* Semantic HTML
* ARIA
* Color Contrast

---

# 15. Testing

未來需要建立：

### Unit Test

測試：

* Utility
* Store
* Service
* Component

### E2E Test

測試：

```text
Login
↓
Job List
↓
Create Job
↓
Job Detail
```

等完整使用者流程。

---

# 16. Performance

系統需要逐步加入：

* Lazy Loading
* Code Splitting
* Pagination
* Efficient Rendering
* Image Optimization

---

# 17. Deployment

未來加入：

* Docker
* CI/CD
* GitHub Actions
