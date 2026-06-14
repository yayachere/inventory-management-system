"use server"

import sql from "@/lib/db"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  description: string
  requirements: string[]
  benefits: string[]
  posted_date: string
  application_deadline: string
  contact_email: string
  company_website?: string
  application_link?: string
  application_address?: string
  education: string[]
  experience: string[]
  skills: string[]
  introduction?: string
  company_logo?: string
  category?: string
  career_level?: string
  how_to_apply?: string
  vacancy_group_id?: string
  is_primary_position?: boolean
  qualification?: string[]
  responsibilities?: string[]
}

const toArray = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : [])

export async function getAllJobs(): Promise<Job[]> {
  try {
    const rows = await sql`
      SELECT 
        id::text,
        title,
        company,
        location,
        type,
        COALESCE(salary, '') AS salary,
        description,
        COALESCE(requirements, '[]') AS requirements,
        COALESCE(benefits, '[]') AS benefits,
        posted_date::text,
        application_deadline::text,
        contact_email,
        company_website,
        application_link,
        application_address,
        COALESCE(education, '[]') AS education,
        COALESCE(experience, '[]') AS experience,
        COALESCE(skills, '[]') AS skills,
        introduction,
        company_logo,
        category,
        career_level,
        how_to_apply,
        vacancy_group_id,
        COALESCE(is_primary_position, true) AS is_primary_position
      FROM jobs
      WHERE COALESCE(is_primary_position, true) = true
      ORDER BY created_at DESC
    `
    return (rows as any[]).map((j) => ({
      id: j.id ?? "",
      title: j.title ?? "",
      company: j.company ?? "",
      location: j.location ?? "",
      type: j.type ?? "",
      salary: j.salary ?? "",
      description: j.description ?? "",
      requirements: toArray(j.requirements),
      benefits: toArray(j.benefits),
      posted_date: j.posted_date ?? "",
      application_deadline: j.application_deadline ?? "",
      contact_email: j.contact_email ?? "",
      company_website: j.company_website ?? undefined,
      application_link: j.application_link ?? undefined,
      application_address: j.application_address ?? undefined,
      education: toArray(j.education),
      experience: toArray(j.experience),
      skills: toArray(j.skills),
      introduction: j.introduction ?? undefined,
      company_logo: j.company_logo ?? undefined,
      category: j.category ?? undefined,
      career_level: j.career_level ?? undefined,
      how_to_apply: j.how_to_apply ?? undefined,
      vacancy_group_id: j.vacancy_group_id ?? undefined,
      is_primary_position: j.is_primary_position ?? true,
    }))
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return []
  }
}

export async function getJobById(id: string): Promise<Job | null> {
  try {
    const rows = await sql`
      SELECT 
        id::text,
        title,
        company,
        location,
        type,
        COALESCE(salary, '') AS salary,
        description,
        COALESCE(requirements, '[]') AS requirements,
        COALESCE(benefits, '[]') AS benefits,
        COALESCE(qualification, '[]') AS qualification,
        COALESCE(responsibilities, '[]') AS responsibilities,
        posted_date::text,
        application_deadline::text,
        contact_email,
        company_website,
        application_link,
        application_address,
        COALESCE(education, '[]') AS education,
        COALESCE(experience, '[]') AS experience,
        COALESCE(skills, '[]') AS skills,
        introduction,
        company_logo,
        category,
        career_level,
        how_to_apply,
        vacancy_group_id,
        COALESCE(is_primary_position, true) AS is_primary_position
      FROM jobs
      WHERE id = ${id}
      LIMIT 1
    `
    if (!rows?.length) return null
    const j = rows[0] as any
    return {
      id: j.id ?? "",
      title: j.title ?? "",
      company: j.company ?? "",
      location: j.location ?? "",
      type: j.type ?? "",
      salary: j.salary ?? "",
      description: j.description ?? "",
      requirements: toArray(j.requirements),
      benefits: toArray(j.benefits),
      qualification: toArray(j.qualification),
      responsibilities: toArray(j.responsibilities),
      posted_date: j.posted_date ?? "",
      application_deadline: j.application_deadline ?? "",
      contact_email: j.contact_email ?? "",
      company_website: j.company_website ?? undefined,
      application_link: j.application_link ?? undefined,
      application_address: j.application_address ?? undefined,
      education: toArray(j.education),
      experience: toArray(j.experience),
      skills: toArray(j.skills),
      introduction: j.introduction ?? undefined,
      company_logo: j.company_logo ?? undefined,
      category: j.category ?? undefined,
      career_level: j.career_level ?? undefined,
      how_to_apply: j.how_to_apply ?? undefined,
      vacancy_group_id: j.vacancy_group_id ?? undefined,
      is_primary_position: j.is_primary_position ?? true,
    }
  } catch (error) {
    console.error("Error fetching job:", error)
    return null
  }
}

export async function getJobsByVacancyGroup(vacancyGroupId: string): Promise<Job[]> {
  try {
    const rows = await sql`
      SELECT 
        id::text,
        title,
        company,
        location,
        type,
        COALESCE(salary, '') AS salary,
        description,
        COALESCE(requirements, '[]') AS requirements,
        COALESCE(benefits, '[]') AS benefits,
        COALESCE(qualification, '[]') AS qualification,
        COALESCE(responsibilities, '[]') AS responsibilities,
        posted_date::text,
        application_deadline::text,
        contact_email,
        company_website,
        application_link,
        application_address,
        COALESCE(education, '[]') AS education,
        COALESCE(experience, '[]') AS experience,
        COALESCE(skills, '[]') AS skills,
        introduction,
        company_logo,
        category,
        career_level,
        how_to_apply,
        vacancy_group_id,
        COALESCE(is_primary_position, true) AS is_primary_position
      FROM jobs
      WHERE vacancy_group_id = ${vacancyGroupId}
      ORDER BY is_primary_position DESC, created_at ASC
    `
    return (rows as any[]).map((j) => ({
      id: j.id ?? "",
      title: j.title ?? "",
      company: j.company ?? "",
      location: j.location ?? "",
      type: j.type ?? "",
      salary: j.salary ?? "",
      description: j.description ?? "",
      requirements: toArray(j.requirements),
      benefits: toArray(j.benefits),
      qualification: toArray(j.qualification),
      responsibilities: toArray(j.responsibilities),
      posted_date: j.posted_date ?? "",
      application_deadline: j.application_deadline ?? "",
      contact_email: j.contact_email ?? "",
      company_website: j.company_website ?? undefined,
      application_link: j.application_link ?? undefined,
      application_address: j.application_address ?? undefined,
      education: toArray(j.education),
      experience: toArray(j.experience),
      skills: toArray(j.skills),
      introduction: j.introduction ?? undefined,
      company_logo: j.company_logo ?? undefined,
      category: j.category ?? undefined,
      career_level: j.career_level ?? undefined,
      how_to_apply: j.how_to_apply ?? undefined,
      vacancy_group_id: j.vacancy_group_id ?? undefined,
      is_primary_position: j.is_primary_position ?? true,
    }))
  } catch (error) {
    console.error("Error fetching jobs by vacancy group:", error)
    return []
  }
}

export async function createJob(formData: FormData) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  const title = (formData.get("title") as string) ?? ""
  const company = (formData.get("company") as string) ?? ""
  const location = (formData.get("location") as string) ?? ""
  const type = (formData.get("type") as string) ?? ""
  const salary = (formData.get("salary") as string) ?? ""
  const description = (formData.get("description") as string) ?? ""
  const applicationDeadline = (formData.get("applicationDeadline") as string) ?? ""
  const contactEmail = (formData.get("contactEmail") as string) ?? ""
  const companyWebsite = (formData.get("companyWebsite") as string) ?? ""
  const applicationLink = (formData.get("applicationLink") as string) ?? ""
  const applicationAddress = (formData.get("applicationAddress") as string) ?? ""
  const introduction = (formData.get("introduction") as string) ?? ""
  const companyLogo = (formData.get("companyLogo") as string) ?? ""
  const category = (formData.get("category") as string) ?? ""
  const careerLevel = (formData.get("careerLevel") as string) ?? ""
  const howToApply = (formData.get("howToApply") as string) ?? ""

  if (!title.trim()) {
    return { success: false, error: "Job title is required" }
  }
  if (!company.trim()) {
    return { success: false, error: "Company name is required" }
  }
  if (!description.trim()) {
    return { success: false, error: "Job description is required" }
  }
  if (!applicationDeadline) {
    return { success: false, error: "Application deadline is required" }
  }
  if (!type) {
    return { success: false, error: "Job type is required" }
  }
  if (!category) {
    return { success: false, error: "Category is required" }
  }
  if (!careerLevel) {
    return { success: false, error: "Career level is required" }
  }

  const parseArray = (v: FormDataEntryValue | null): string[] => {
    try {
      return v ? JSON.parse(v as string) : []
    } catch {
      return []
    }
  }

  const requirements = parseArray(formData.get("requirements"))
  const benefits = parseArray(formData.get("benefits"))
  const experience = parseArray(formData.get("experience"))
  const education = parseArray(formData.get("education"))
  const skills = parseArray(formData.get("skills"))

  if (requirements.length === 0 || requirements.every((r) => !r.trim())) {
    return { success: false, error: "At least one requirement is required" }
  }

  try {
    await sql`
      INSERT INTO jobs (
        title, company, location, type, salary, description,
        requirements, benefits, application_deadline, contact_email,
        application_link, application_address, company_website, education,
        experience, skills, introduction, company_logo, category, career_level, how_to_apply
      ) VALUES (
        ${title}, ${company}, ${location}, ${type}, ${salary}, ${description},
        ${requirements}, ${benefits}, ${applicationDeadline}, ${contactEmail},
        ${applicationLink}, ${applicationAddress}, ${companyWebsite}, ${education},
        ${experience}, ${skills}, ${introduction}, ${companyLogo}, ${category}, ${careerLevel}, ${howToApply}
      )
    `

    revalidatePath("/")
    revalidatePath("/admin")
    return { success: true, message: "Job created successfully!" }
  } catch (error) {
    console.error("Error creating job:", error)
    return { success: false, error: "Failed to create job" }
  }
}

export async function updateJob(id: string, formData: FormData) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  const title = (formData.get("title") as string) ?? ""
  const company = (formData.get("company") as string) ?? ""
  const location = (formData.get("location") as string) ?? ""
  const type = (formData.get("type") as string) ?? ""
  const salary = (formData.get("salary") as string) ?? ""
  const description = (formData.get("description") as string) ?? ""
  const applicationDeadline = (formData.get("applicationDeadline") as string) ?? ""
  const contactEmail = (formData.get("contactEmail") as string) ?? ""
  const companyWebsite = (formData.get("companyWebsite") as string) ?? ""
  const applicationLink = (formData.get("applicationLink") as string) ?? ""
  const applicationAddress = (formData.get("applicationAddress") as string) ?? ""
  const introduction = (formData.get("introduction") as string) ?? ""
  const companyLogo = (formData.get("companyLogo") as string) ?? ""
  const category = (formData.get("category") as string) ?? ""
  const careerLevel = (formData.get("careerLevel") as string) ?? ""
  const howToApply = (formData.get("howToApply") as string) ?? ""

  if (!title.trim()) {
    return { success: false, error: "Job title is required" }
  }
  if (!company.trim()) {
    return { success: false, error: "Company name is required" }
  }
  if (!description.trim()) {
    return { success: false, error: "Job description is required" }
  }
  if (!applicationDeadline) {
    return { success: false, error: "Application deadline is required" }
  }
  if (!type) {
    return { success: false, error: "Job type is required" }
  }
  if (!category) {
    return { success: false, error: "Category is required" }
  }
  if (!careerLevel) {
    return { success: false, error: "Career level is required" }
  }

  const parseArray = (v: FormDataEntryValue | null): string[] => {
    try {
      return v ? JSON.parse(v as string) : []
    } catch {
      return []
    }
  }

  const requirements = parseArray(formData.get("requirements"))
  const benefits = parseArray(formData.get("benefits"))
  const experience = parseArray(formData.get("experience"))
  const education = parseArray(formData.get("education"))
  const skills = parseArray(formData.get("skills"))

  try {
    await sql`
      UPDATE jobs SET
        title = ${title},
        company = ${company},
        location = ${location},
        type = ${type},
        salary = ${salary},
        description = ${description},
        requirements = ${requirements},
        benefits = ${benefits},
        application_deadline = ${applicationDeadline},
        contact_email = ${contactEmail},
        application_link = ${applicationLink},
        application_address = ${applicationAddress},
        company_website = ${companyWebsite},
        education = ${education},
        experience = ${experience},
        skills = ${skills},
        introduction = ${introduction},
        company_logo = ${companyLogo},
        category = ${category},
        career_level = ${careerLevel},
        how_to_apply = ${howToApply},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath(`/jobs/${id}`)
    return { success: true, message: "Job updated successfully!" }
  } catch (error) {
    console.error("Error updating job:", error)
    return { success: false, error: "Failed to update job" }
  }
}

export async function deleteJob(id: string) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  try {
    await sql`DELETE FROM jobs WHERE id = ${id}`
    return { success: true }
  } catch (error) {
    console.error("Error deleting job:", error)
    return { error: "Failed to delete job" }
  }
}

/**
 * Delete multiple jobs at once
 */
export async function bulkDeleteJobs(jobIds: string[]) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  if (!jobIds.length) {
    return { success: false, error: "No jobs selected" }
  }

  try {
    await sql`DELETE FROM jobs WHERE id = ANY(${jobIds})`
    revalidatePath("/admin")
    return { success: true, message: `Successfully deleted ${jobIds.length} jobs` }
  } catch (error) {
    console.error("Error deleting jobs:", error)
    return { success: false, error: "Failed to delete jobs" }
  }
}

/**
 * Bulk update job status to Active
 */
export async function bulkMarkActive(jobIds: string[]) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  if (!jobIds.length) {
    return { success: false, error: "No jobs selected" }
  }

  try {
    await sql`
      UPDATE jobs 
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY(${jobIds})
    `
    revalidatePath("/admin")
    return { success: true, message: `Successfully marked ${jobIds.length} jobs as active` }
  } catch (error) {
    console.error("Error updating jobs:", error)
    return { success: false, error: "Failed to update jobs" }
  }
}

/**
 * Get all expired jobs
 */
export async function getExpiredJobs(): Promise<Job[]> {
  try {
    const rows = await sql`
      SELECT 
        id::text,
        title,
        company,
        location,
        type,
        COALESCE(salary, '') AS salary,
        description,
        COALESCE(requirements, '[]') AS requirements,
        COALESCE(benefits, '[]') AS benefits,
        posted_date::text,
        application_deadline::text,
        contact_email,
        company_website,
        application_link,
        application_address,
        COALESCE(education, '[]') AS education,
        COALESCE(experience, '[]') AS experience,
        COALESCE(skills, '[]') AS skills,
        introduction,
        company_logo,
        category,
        career_level,
        how_to_apply,
        vacancy_group_id,
        COALESCE(is_primary_position, true) AS is_primary_position
      FROM jobs
      WHERE application_deadline < NOW()
      AND COALESCE(is_primary_position, true) = true
      ORDER BY application_deadline DESC
    `
    return (rows as any[]).map((j) => ({
      id: j.id ?? "",
      title: j.title ?? "",
      company: j.company ?? "",
      location: j.location ?? "",
      type: j.type ?? "",
      salary: j.salary ?? "",
      description: j.description ?? "",
      requirements: toArray(j.requirements),
      benefits: toArray(j.benefits),
      posted_date: j.posted_date ?? "",
      application_deadline: j.application_deadline ?? "",
      contact_email: j.contact_email ?? "",
      company_website: j.company_website ?? undefined,
      application_link: j.application_link ?? undefined,
      application_address: j.application_address ?? undefined,
      education: toArray(j.education),
      experience: toArray(j.experience),
      skills: toArray(j.skills),
      introduction: j.introduction ?? undefined,
      company_logo: j.company_logo ?? undefined,
      category: j.category ?? undefined,
      career_level: j.career_level ?? undefined,
      how_to_apply: j.how_to_apply ?? undefined,
      vacancy_group_id: j.vacancy_group_id ?? undefined,
      is_primary_position: j.is_primary_position ?? true,
    }))
  } catch (error) {
    console.error("Error fetching expired jobs:", error)
    return []
  }
}

/**
 * Delete all expired jobs
 */
export async function deleteAllExpiredJobs() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  try {
    const result = await sql`
      DELETE FROM jobs 
      WHERE application_deadline < NOW()
      RETURNING id
    `
    const deletedCount = (result as any[]).length
    revalidatePath("/admin")
    return { success: true, message: `Successfully deleted ${deletedCount} expired jobs`, count: deletedCount }
  } catch (error) {
    console.error("Error deleting expired jobs:", error)
    return { success: false, error: "Failed to delete expired jobs" }
  }
}

export type UpdateJobState = { ok?: boolean; error?: string }

export async function updateJobAction(_prevState: UpdateJobState, formData: FormData): Promise<UpdateJobState> {
  const id = (formData.get("id") as string) ?? ""
  if (!id) return { error: "Missing job id" }

  const result = await updateJob(id, formData)
  if ((result as any)?.success) {
    revalidatePath("/admin")
    revalidatePath(`/jobs/${id}`)
    return { ok: true }
  }
  return { error: (result as any)?.error ?? "Failed to update job" }
}
