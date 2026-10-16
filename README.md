# HireManage

智慧面試管理平台（Enterprise Recruitment Management System）。

HireManage 是一個以 Vue 3 + TypeScript 建立的企業級招聘與面試管理平台練習專案。

本專案主要目標是模擬實際企業內部管理系統的開發方式，並逐步加入前端工程常見的技術與開發流程。

---

## Project Overview

HireManage 用於協助企業管理完整招聘流程。

主要使用者包含：

* System Admin
* HR / Recruiter
* Hiring Manager

系統涵蓋：

```text
Dashboard
    ↓
Job Management
    ↓
Candidate Management
    ↓
Application Management
    ↓
Interview Management
    ↓
Offer Management
    ↓
Notification
    ↓
Audit Log
```

---

## Current Development Stage

目前採用：

```text
Frontend-first
+
Mock API
+
Mock Data
```

目前沒有真正的後端與資料庫。

---

## Tech Stack

### Core

* Vue 3
* TypeScript
* Vite

### UI

* Tailwind CSS

### State

* Pinia

### Routing

* Vue Router

### HTTP

* Axios

### Mock API

* MSW

### Testing

* Vitest（Unit Test）
* Playwright（E2E Test）

### Development

* ESLint
* Docker
* GitHub Actions

---

## Architecture

目前資料流：

```text
Vue View
    ↓
Pinia Store
    ↓
Service
    ↓
Axios
    ↓
MSW
    ↓
Mock Data
```

各層有明確責任：

```text
View
→ UI 與使用者操作

Store
→ State 與 Domain Logic

Service
→ API Communication

MSW
→ Mock Backend

Mock Data
→ 測試資料
```

---

## Main Features

### Dashboard

已實作：

* Open Jobs
* Candidates
* Applications
* Interviews
* Offers
* Application Trend
* Recruitment Funnel
* Recent Applications

---

### Job Management

已實作：

* Job List
* Search
* Filter
* Sort
* Pagination
* Job Detail
* Create Job
* Edit Job
* Delete Job

Job 包含：

* Title
* Description
* Department
* Location
* Work Type
* Salary
* Experience
* Education
* Required Skills
* Status
* Created At
* Updated At

---

### Candidate Management

已實作：

* Candidate List
* Candidate Detail
* Resume
* Skills
* Application History
* Interview History
* Offer History
* Notes

---

### Application Management

Application 狀態：

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

也可以進入：

```text
Rejected
```

已實作 Kanban、列表、詳細頁、建立與狀態變更。

Drag & Drop 為未來項目。

---

### Interview Management

已實作：

* Interview Calendar
* Create Interview
* Edit Interview
* Delete Interview
* Interview Feedback

Interview 資訊包含：

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

### Offer Management

已實作：

* Create Offer
* Edit Offer
* Offer Detail
* Offer Status

Offer Status：

```text
Draft
Sent
Accepted
Rejected
```

---

### Notification

已實作：

* Interview Scheduled
* Application Updated
* Offer Accepted
* System Notification

---

### Audit Log

已實作，記錄：

* Actor
* Action
* Target
* Timestamp
* Details

例如：

```text
HR updated Job
Recruiter changed Application status
Admin created User
```

---

## User Roles

### System Admin

擁有完整系統管理權限。

```text
*
```

---

### HR / Recruiter

主要負責：

* Job
* Candidate
* Application
* Interview
* Offer

---

### Hiring Manager

主要負責：

* Job
* Candidate
* Application
* Interview Feedback

---

## Permission Design

系統採用 Permission-based Authorization。

而不是只依賴 Role Name。

例如：

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

這樣未來可以更容易擴充角色與權限。

---

## Project Goals

本專案希望練習：

* TypeScript
* Vue 3
* Component Design
* State Management
* Server State
* API Design
* Mock API
* Form Validation
* Error Handling
* Unit Testing
* E2E Testing
* Accessibility
* Performance
* Docker
* CI/CD

---

## Getting Started

```bash
npm install
cp .env.example .env   # 設定 Mock 帳號密碼，.env 不進版控
npm run dev
```

開發模式會自動啟動 MSW，所有 API 皆由 Mock 回應。

Mock 帳號（密碼由 `.env` 的 `VITE_MOCK_*_PASSWORD` 決定，程式碼與文件中不保存密碼）：

| 帳號 | 角色 | 密碼環境變數 |
| --- | --- | --- |
| admin | System Admin | `VITE_MOCK_ADMIN_PASSWORD` |
| hr | HR / Recruiter | `VITE_MOCK_HR_PASSWORD` |
| manager | Hiring Manager | `VITE_MOCK_MANAGER_PASSWORD` |

登入頁的「測試帳號」面板只在 Mock 模式顯示，且只列出有設定密碼的帳號。

常用指令：

```bash
npm run typecheck   # vue-tsc
npm run lint        # ESLint
npm test            # Vitest 單元測試
npm run test:e2e    # Playwright E2E 測試（含 axe 無障礙掃描）
npm run build       # 正式建置
```

Docker：

```bash
docker compose up --build
# 開啟 http://localhost:8080
```

CI：push 到 master 或建立 PR 時，GitHub Actions 會執行 typecheck、lint、單元測試、build、E2E 與 Docker build。

---

## Development Philosophy

HireManage 不追求一次加入所有技術。

開發方式：

```text
先完成功能
    ↓
理解問題
    ↓
加入工程能力
    ↓
測試
    ↓
優化
```

每一個技術都應該與實際功能需求產生關聯。

---

## Future Roadmap

```text
Phase 1  ✅ Vue 3 + TypeScript
Phase 2  ✅ Project Architecture
Phase 3  ✅ TypeScript Deep Dive
Phase 4  ✅ Mock API + Mock Data
Phase 5  ✅ Authentication
Phase 6  ✅ Authorization
Phase 7  ✅ Server State
Phase 8  ✅ Dashboard
Phase 9  ✅ Job Management
Phase 10 ✅ Candidate Management
Phase 11 ✅ Application Kanban
Phase 12 ✅ Interview Calendar
Phase 13 ✅ Offer Management
Phase 14 ✅ Form Validation
Phase 15 ✅ Unit Test
Phase 16 ✅ E2E Test
Phase 17 ✅ Accessibility（axe 自動掃描）
Phase 18 ⬜ Performance
Phase 19 ✅ Docker
Phase 20 ✅ CI/CD
```

---

## License

This project is for learning and portfolio purposes.
