# User Flows

## 1. Login Flow

使用者進入 HireManage。

```text
Open Application
        ↓
Login Page
        ↓
Enter Username
        ↓
Enter Password
        ↓
Submit
        ↓
Authentication
        ↓
Get Current User
        ↓
Dashboard
```

---

# 2. Login Error Flow

登入失敗：

```text
Login Page
    ↓
Submit
    ↓
Authentication Failed
    ↓
Display Error
    ↓
User Corrects Information
    ↓
Submit Again
```

---

# 3. Dashboard Flow

登入成功：

```text
Login
 ↓
Dashboard
```

Dashboard 顯示：

```text
Open Jobs
Candidates
Applications
Interviews
Offers
```

使用者可以從 Dashboard 進入不同管理功能。

---

# 4. Job List Flow

```text
Dashboard
    ↓
Job Management
    ↓
Job List
```

使用者可以：

```text
Search
Filter
Sort
Change Page
View Detail
Create Job
Edit Job
```

---

# 5. Search Job Flow

```text
Job List
    ↓
Enter Keyword
    ↓
Search
    ↓
Update Query
    ↓
Fetch Jobs
    ↓
Display Results
```

---

# 6. Filter Job Flow

```text
Job List
    ↓
Select Filter
    ↓
Status / Department / Work Type
    ↓
Update Query
    ↓
Fetch Jobs
    ↓
Display Results
```

---

# 7. Create Job Flow

```text
Job List
    ↓
Create Job
    ↓
Create Job Form
    ↓
Enter Job Information
    ↓
Validation
    ↓
Submit
    ↓
POST /api/jobs
    ↓
Create Success
    ↓
Job Detail / Job List
```

---

# 8. Create Job Validation Flow

```text
Create Job Form
    ↓
Submit
    ↓
Validate Form
    ↓
Valid?
   / \
 No   Yes
 |     |
Show   API
Error  Request
```

---

# 9. Edit Job Flow

```text
Job List
    ↓
Job Detail
    ↓
Edit
    ↓
Edit Job Form
    ↓
Modify Information
    ↓
Validation
    ↓
Submit
    ↓
Update API
    ↓
Success
    ↓
Job Detail
```

---

# 10. Delete Job Flow

```text
Job Detail
    ↓
Delete
    ↓
Confirmation
    ↓
Confirm?
   / \
 No   Yes
 |     |
Stop  DELETE API
          ↓
       Success
          ↓
       Job List
```

---

# 11. Candidate Flow

```text
Candidate List
      ↓
Candidate Detail
      ↓
View Resume
      ↓
View Skills
      ↓
View Application History
      ↓
View Interview History
      ↓
View Offer History
```

---

# 12. Application Flow

候選人建立 Application：

```text
Candidate
    ↓
Apply Job
    ↓
Application Created
    ↓
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

如果候選人未通過：

```text
Application
    ↓
Rejected
```

---

# 13. Application Kanban Flow

```text
Application Board
```

包含：

```text
Applied
Screening
Interview
Offer
Hired
Rejected
```

未來可以使用：

```text
Drag & Drop
```

修改狀態。

---

# 14. Interview Flow

```text
Application
    ↓
Interview Stage
    ↓
Create Interview
    ↓
Select Candidate
    ↓
Select Interviewer
    ↓
Select Date / Time
    ↓
Select Interview Mode
    ↓
Submit
    ↓
Interview Created
```

---

# 15. Interview Feedback Flow

```text
Interview
    ↓
Interview Completed
    ↓
Interviewer
    ↓
Enter Feedback
    ↓
Enter Score
    ↓
Submit
    ↓
Save Feedback
```

---

# 16. Offer Flow

```text
Candidate
    ↓
Offer
    ↓
Create Offer
    ↓
Draft
    ↓
Send
    ↓
Sent
```

候選人回覆：

```text
Accepted
```

或：

```text
Rejected
```

---

# 17. Notification Flow

當系統發生重要事件：

```text
Event
 ↓
Create Notification
 ↓
Notification Center
 ↓
User Reads Notification
```

例如：

```text
Interview Scheduled
Application Updated
Offer Accepted
```

---

# 18. Audit Log Flow

重要操作：

```text
User Action
    ↓
System Event
    ↓
Create Audit Log
    ↓
Store Actor / Action / Target / Timestamp
```

例如：

```text
HR
 ↓
Update Job
 ↓
Audit Log
```

---

# 19. Permission Flow

使用者登入後：

```text
Login
 ↓
Get User
 ↓
Get Permissions
 ↓
Initialize Authorization
 ↓
Render Navigation
 ↓
Render Routes
 ↓
Render Actions
```

例如使用者沒有：

```text
job.create
```

則建立職缺功能不可使用。

---

# 20. Error Flow

API 發生錯誤：

```text
User Action
    ↓
API Request
    ↓
Error
    ↓
Store
    ↓
View
    ↓
Display Error State
```

常見錯誤：

```text
400
Bad Request

401
Unauthorized

403
Forbidden

404
Not Found

409
Conflict

500
Server Error
```

---

# 21. Loading Flow

```text
User Action
    ↓
Start Request
    ↓
Loading = true
    ↓
API Request
    ↓
Response
    ↓
Loading = false
    ↓
Display Result
```

---

# 22. Empty State Flow

當 API 成功但沒有資料：

```text
Request
    ↓
200 OK
    ↓
data = []
    ↓
Empty State
```

例如：

```text
目前沒有符合條件的職缺
```

---

# 23. Complete Recruitment Flow

HireManage 最主要的完整招聘流程：

```text
Create Job
    ↓
Publish / Open Job
    ↓
Candidate Applies
    ↓
Application
    ↓
Screening
    ↓
Interview
    ↓
Interview Feedback
    ↓
Offer
    ↓
Accepted
    ↓
Hired
```

如果候選人未通過：

```text
Screening
    ↓
Rejected
```

或：

```text
Interview
    ↓
Rejected
```
