# User Roles

## 1. Overview

HireManage 主要包含三種使用者：

```text
System Admin
HR / Recruiter
Hiring Manager
```

系統採用 Permission-based Authorization。

也就是：

```text
Role
 ↓
Permissions
 ↓
Feature Access
```

而不是只依靠 Role Name 判斷權限。

---

# 2. System Admin

## 2.1 Description

System Admin 負責管理整個 HireManage 系統。

---

## 2.2 Permission

```text
*
```

代表完整權限。

---

## 2.3 Access

System Admin 可以存取：

* Dashboard
* User Management
* Permission Management
* Job Management
* Candidate Management
* Application Management
* Interview Management
* Offer Management
* Notification
* Audit Log
* System Settings

---

# 3. HR / Recruiter

## 3.1 Description

HR / Recruiter 負責企業日常招聘工作。

---

## 3.2 Permissions

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

offer.read
offer.create
```

---

## 3.3 Access

HR / Recruiter 可以：

### Job

* 查看職缺
* 建立職缺
* 修改職缺

### Candidate

* 查看候選人
* 修改候選人資料

### Application

* 查看應徵
* 修改應徵狀態

### Interview

* 查看面試
* 建立面試

### Offer

* 查看 Offer
* 建立 Offer

---

# 4. Hiring Manager

## 4.1 Description

Hiring Manager 主要負責部門招聘與候選人評估。

---

## 4.2 Permissions

```text
job.read

candidate.read
candidate.update

application.read

interview.read
interview.feedback
```

---

## 4.3 Access

Hiring Manager 可以：

### Job

* 查看職缺

### Candidate

* 查看候選人
* 修改候選人資訊

### Application

* 查看應徵流程

### Interview

* 查看面試
* 提供面試 Feedback

---

# 5. Permission Model

Permission 使用：

```text
resource.action
```

格式。

例如：

```text
job.read
job.create
job.update
```

其中：

```text
resource = job
action = read
```

---

# 6. Permission List

目前規劃：

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

# 7. UI Authorization

前端 UI 應依照 Permission 顯示功能。

例如：

如果使用者沒有：

```text
job.create
```

則：

```text
＋ 建立職缺
```

不應顯示或應禁止操作。

---

# 8. Route Authorization

Route 也需要進行 Permission Check。

例如：

```text
/admin/jobs
```

需要：

```text
job.read
```

---

# 9. Action Authorization

除了 Route 之外，Button 與操作也需要檢查 Permission。

例如：

```text
Create
Edit
Delete
Submit
Approve
```

---

# 10. Principle

權限控制必須：

```text
Role
  ↓
Permission
  ↓
Route / Navigation / UI Action
```

不要直接寫：

```ts
if (role === 'admin')
```

來處理所有權限。

應優先使用：

```ts
hasPermission('job.create')
```

這樣未來新增角色時，可以降低修改範圍。
