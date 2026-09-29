import type { JobStatus, WorkType } from '../types/job'

export interface JobFormInput {
  title: string
  description: string
  department: string
  location: string
  workType: WorkType | ''
  salaryMin: string
  salaryMax: string
  experience: string
  education: string
  requiredSkills: string
  status: JobStatus | ''
}

export type JobFormErrors = Partial<
  Record<keyof JobFormInput, string>
>

export function validateJobForm(
  form: JobFormInput,
): JobFormErrors {
  const errors: JobFormErrors = {}

  if (!form.title.trim()) {
    errors.title = '請輸入職缺名稱'
  }

  if (!form.description.trim()) {
    errors.description = '請輸入職缺描述'
  }

  if (!form.department.trim()) {
    errors.department = '請輸入部門'
  }

  if (!form.location.trim()) {
    errors.location = '請輸入工作地點'
  }

  if (!form.workType) {
    errors.workType = '請選擇工作型態'
  }

  const salaryMin = Number(form.salaryMin)
  const salaryMax = Number(form.salaryMax)

  if (
    form.salaryMin === '' ||
    Number.isNaN(salaryMin) ||
    salaryMin < 0
  ) {
    errors.salaryMin = '請輸入有效的最低薪資'
  }

  if (
    form.salaryMax === '' ||
    Number.isNaN(salaryMax) ||
    salaryMax < 0
  ) {
    errors.salaryMax = '請輸入有效的最高薪資'
  }

  if (
    !errors.salaryMin &&
    !errors.salaryMax &&
    salaryMax < salaryMin
  ) {
    errors.salaryMax =
      '最高薪資不能低於最低薪資'
  }

  if (!form.experience.trim()) {
    errors.experience = '請輸入經驗要求'
  }

  if (!form.education.trim()) {
    errors.education = '請輸入學歷要求'
  }

  if (!form.requiredSkills.trim()) {
    errors.requiredSkills =
      '請輸入至少一項必要技能'
  }

  if (!form.status) {
    errors.status = '請選擇職缺狀態'
  }

  return errors
}
