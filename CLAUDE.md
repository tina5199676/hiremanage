# HireManage

HireManage 是一個企業級智慧面試管理平台練習專案。

本專案的主要目標不是單純完成 UI，而是透過實際開發流程，學習接近業界的前端工程能力。

---

## 1. Project Goals

本專案希望練習以下前端工程能力：

* Vue 3
* TypeScript
* Vite
* Tailwind CSS
* Pinia
* Vue Router
* Axios
* Mock API
* Mock Data
* Server State
* Form Validation
* Unit Test
* E2E Test
* Accessibility
* Performance
* Docker
* CI/CD
* Git / GitHub

目前以 Frontend-first 開發方式為主。

---

## 2. Current Technology Stack

目前使用：

* Vue 3
* TypeScript
* Vite
* Tailwind CSS
* Pinia
* Vue Router
* Axios
* MSW
* Mock Data

預計後續加入：

* Vitest
* Playwright
* ESLint
* Form Validation
* Docker
* GitHub Actions

---

## 3. Project Constraints

### Frontend-first

目前 HireManage 不使用真正的後端 API。

資料由 Mock API 與 Mock Data 提供。

目前不需要：

* FastAPI
* MySQL
* PostgreSQL
* Redis
* 真實後端
* 真實資料庫

未來如果需要，可以另外建立 Full-stack Phase。

### No AI

目前不加入 AI 功能。

禁止自行加入：

* AI Resume Analysis
* AI Candidate Matching
* AI Interview Question Generator
* AI Chatbot
* LLM
* Ollama

如果未來要加入 AI，必須由使用者明確提出。

### No Real Data

所有公司、職缺、候選人、面試資料都使用虛構資料。

禁止加入真實個人資料。

---

## 4. Architecture

目前採用以下資料流：

```text
View
  ↓
Pinia Store
  ↓
Service
  ↓
Axios
  ↓
MSW Mock API
  ↓
Mock Data
```

各層責任：

### View

負責：

* UI
* 使用者操作
* 顯示 Loading
* 顯示 Error
* 顯示資料

View 不應直接處理 API。

### Store

負責：

* Domain State
* Server State
* API 呼叫流程
* Loading State
* Error State
* Query State

View 應透過 Store 操作資料。

### Service

負責：

* API request
* Axios
* API response

Service 不負責 UI。

### Mock API

使用 MSW 模擬後端 API。

負責：

* Request handling
* Response
* HTTP status
* Mock business logic

### Mock Data

負責提供測試資料。

資料必須保持可預期且容易測試。

---

## 5. Directory Responsibilities

```text
src/
├── components/
├── layouts/
├── router/
├── services/
├── stores/
├── types/
├── utils/
└── views/
```

### components/

放可重複使用的 UI Component。

例如：

```text
JobCard.vue
JobTable.vue
StatusBadge.vue
Pagination.vue
```

### layouts/

放整體頁面 Layout。

例如：

```text
AdminLayout.vue
AuthLayout.vue
```

### router/

負責：

* Route
* Navigation Guard
* Permission Guard

### services/

負責 API request。

例如：

```text
jobService.ts
candidateService.ts
applicationService.ts
interviewService.ts
offerService.ts
```

### stores/

使用 Pinia。

負責各 Domain 的 state。

例如：

```text
auth.ts
job.ts
candidate.ts
application.ts
interview.ts
notification.ts
```

### types/

集中管理 TypeScript 型別。

例如：

```text
auth.ts
candidate.ts
application.ts
interview.ts
offer.ts
```

### utils/

放共用工具。

例如：

```text
formatters.ts
permissions.ts
validators.ts
```

### views/

代表實際頁面。

例如：

```text
dashboard/
jobs/
candidates/
applications/
interviews/
offers/
```

---

## 6. TypeScript Rules

所有 Vue Component 使用：

```vue
<script setup lang="ts">
```

禁止使用：

```ts
any
```

除非有非常明確且合理的原因。

優先使用：

* interface
* type
* union type
* generic
* type narrowing

API request / response 必須有明確 TypeScript 型別。

---

## 7. Vue Rules

使用 Vue 3 Composition API。

優先使用：

```ts
ref()
computed()
watch()
onMounted()
```

以及：

```vue
<script setup lang="ts">
```

避免使用不必要的 Options API。

---

## 8. Pinia Rules

Pinia Store 用於管理 Domain State。

例如：

```text
Job Store
Candidate Store
Application Store
Interview Store
```

不要把所有 UI state 都放進 Pinia。

例如：

```text
Modal 是否開啟
Input 是否 focus
Local tab
```

這些通常可以留在 Component。

---

## 9. API Rules

API 呼叫必須經過 Service。

View 不應直接使用 Axios。

錯誤：

```ts
axios.get('/api/jobs')
```

正確：

```text
View
 ↓
Store
 ↓
jobService
 ↓
Axios
```

---

## 10. Mock API Rules

目前使用 MSW。

Mock API 必須模擬真實後端行為。

例如：

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

不要所有情況都回傳 200。

---

## 11. Feature Development Rules

開發新功能時採用小步驟方式。

例如 Create Job：

```text
1. TypeScript Types
2. Mock Data
3. Mock API
4. Service
5. Store
6. Router
7. View
8. Validation
9. Unit Test
10. E2E Test
```

不要一次大幅修改整個專案。

---

## 12. Existing Features

目前 Job Management 已經包含：

* Job List
* Search
* Filter
* Sort
* Pagination
* Job Detail

目前正在逐步加入：

* Create Job
* Edit Job
* Delete Job

---

## 13. Error Handling

UI 必須處理：

### Loading

```text
Loading...
```

### Error

```text
無法取得資料
```

### Empty

```text
目前沒有資料
```

### Not Found

```text
找不到指定資料
```

不要只處理成功情況。

---

## 14. Accessibility

後續開發必須注意：

* label
* button
* keyboard navigation
* focus state
* semantic HTML
* aria-label
* color contrast

互動元素不能只依賴顏色表達狀態。

---

## 15. Performance

後續需要考慮：

* Lazy Loading
* Code Splitting
* Pagination
* 避免不必要的 re-render
* 大量資料處理
* Image Optimization

不要在沒有必要時一次載入所有資料。

---

## 16. Testing

未來加入：

### Unit Test

使用：

```text
Vitest
```

測試：

* utility
* store
* service
* component

### E2E Test

使用：

```text
Playwright
```

測試完整使用者流程。

例如：

```text
Login
↓
Job List
↓
Create Job
↓
Job Detail
```

---

## 17. Git Rules

Commit 使用 Conventional Commits。

例如：

```text
feat: add job creation
fix: fix job pagination
refactor: simplify job store
test: add job store tests
docs: update project documentation
```

---

## 18. Claude Code Development Rules

Claude Code 在修改專案前，必須先理解目前的：

* architecture
* directory structure
* existing implementation
* data flow

不要自行：

* 重寫整個專案
* 修改無關檔案
* 更換技術
* 加入新的 framework
* 加入 AI
* 加入真實 backend
* 加入 database

如果需要大型架構變更，先提出方案，再進行修改。

---

## 19. Implementation Style

每個功能都採取 incremental development。

例如：

```text
Feature
 ↓
Types
 ↓
API
 ↓
Store
 ↓
UI
 ↓
Validation
 ↓
Test
```

每完成一個階段，都應先確認目前功能正常，再進入下一階段。

---

## 20. Important Rule

不要為了讓程式看起來更複雜而增加技術。

每個技術都應該有實際學習目的。

HireManage 的主要目的，是讓開發者逐步學會接近業界的前端工程開發方式。
