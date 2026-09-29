# Product Overview

## 1. Product Name

HireManage

智慧面試管理平台

英文名稱：

Enterprise Recruitment Management System

---

## 2. Product Description

HireManage 是一個企業內部使用的招聘與面試管理平台。

平台將企業招聘流程集中到單一系統中，讓 HR、Recruiter 與 Hiring Manager 可以管理：

* 職缺
* 候選人
* 應徵流程
* 面試
* Offer
* 通知
* 操作紀錄

---

## 3. Product Goal

HireManage 的主要目標：

1. 集中管理企業職缺
2. 集中管理候選人
3. 追蹤候選人招聘流程
4. 管理面試安排
5. 管理 Offer
6. 提供招聘相關資訊
7. 保留重要操作紀錄

---

## 4. Target Users

### System Admin

負責整個系統管理。

主要功能：

* User Management
* Permission Management
* System Configuration
* Audit Log

---

### HR / Recruiter

負責日常招聘工作。

主要功能：

* Job Management
* Candidate Management
* Application Management
* Interview Management
* Offer Management

---

### Hiring Manager

負責部門招聘與候選人評估。

主要功能：

* 查看職缺
* 查看候選人
* 查看應徵流程
* 查看面試
* 提供 Interview Feedback

---

## 5. Core Modules

```text
Dashboard
Job Management
Candidate Management
Application Management
Interview Management
Offer Management
Notification
Audit Log
```

---

## 6. Dashboard

Dashboard 用於提供招聘工作的總覽。

主要資訊：

* Open Jobs
* Candidates
* Applications
* Interviews
* Offers

預計提供：

* Application Trend
* Recruitment Funnel
* Recent Applications

---

## 7. Job Management

Job Management 用於管理企業職缺。

主要功能：

* Job List
* Search
* Filter
* Sort
* Pagination
* Job Detail
* Create Job
* Edit Job
* Delete Job

---

## 8. Candidate Management

Candidate Management 用於管理候選人。

主要資訊：

* Personal Information
* Resume
* Skills
* Application History
* Interview History
* Offer History
* Notes

---

## 9. Application Management

Application Management 用於管理候選人的應徵流程。

主要狀態：

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

另外包含：

```text
Rejected
```

---

## 10. Interview Management

Interview Management 用於安排與管理面試。

主要功能：

* Calendar
* Create Interview
* Edit Interview
* Delete Interview
* Interview Feedback

---

## 11. Offer Management

Offer Management 用於管理錄用通知。

主要狀態：

```text
Draft
Sent
Accepted
Rejected
```

---

## 12. Notification

Notification 用於通知使用者重要事件。

例如：

* Interview Scheduled
* Application Updated
* Offer Accepted
* System Notification

---

## 13. Audit Log

Audit Log 用於記錄重要系統操作。

例如：

```text
User
Action
Target
Timestamp
Details
```

---

## 14. Current Development Strategy

目前採用：

```text
Frontend-first
+
Mock API
+
Mock Data
```

目前不使用：

* 真實 Backend
* 真實 Database
* 真實企業資料

---

## 15. Product Scope

第一階段主要建立完整前端管理系統。

之後逐步加入：

* Authentication
* Authorization
* Server State
* Validation
* Testing
* Accessibility
* Performance
* Deployment

---

## 16. Product Principle

HireManage 的設計原則：

### Clear

資訊應該容易理解。

### Consistent

不同功能使用一致的操作方式。

### Efficient

管理者可以快速完成工作。

### Scalable

架構可以支援未來功能擴充。

### Maintainable

程式碼需要容易維護與測試。
