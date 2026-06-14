"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createJob, updateJob, type Job } from "@/lib/actions/jobs"
import { useToast } from "@/hooks/use-toast"

interface JobFormProps {
  job?: Job
  onSuccess?: () => void
}

export default function JobForm({ job, onSuccess }: JobFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "",
    salary: "",
    description: "",
    requirements: [""],
    benefits: [""],
    applicationDeadline: "",
    contactEmail: "",
    applicationLink: "",
    applicationAddress: "",
    companyWebsite: "",
    education: [""],
    experience: [""],
    skills: [""],
    introduction: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Initialize form data when job prop changes
  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || "",
        company: job.company || "",
        location: job.location || "",
        type: job.type || "",
        salary: job.salary || "",
        description: job.description || "",
        requirements: job.requirements && job.requirements.length > 0 ? job.requirements : [""],
        benefits: job.benefits && job.benefits.length > 0 ? job.benefits : [""],
        applicationDeadline: job.application_deadline || "",
        contactEmail: job.contact_email || "",
        applicationLink: job.application_link || "",
        applicationAddress: job.application_address || "",
        companyWebsite: job.company_website || "",
        education: job.education && job.education.length > 0 ? job.education : [""],
        experience: job.experience && job.experience.length > 0 ? job.experience : [""],
        skills: job.skills && job.skills.length > 0 ? job.skills : [""],
        introduction: job.introduction || "",
      })
    }
  }, [job])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submitFormData = new FormData()

      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          submitFormData.append(key, JSON.stringify(value.filter((item) => item.trim() !== "")))
        } else {
          submitFormData.append(key, value)
        }
      })

      const result = job ? await updateJob(job.id, submitFormData) : await createJob(submitFormData)

      if (result.success) {
        toast({
          title: "Success!",
          description: job ? "Job updated successfully!" : "Job created successfully!",
        })
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addArrayItem = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[]), ""],
    }))
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index),
    }))
  }

  const updateArrayItem = (field: string, index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).map((item, i) => (i === index ? value : item)),
    }))
  }

  const renderArrayField = (field: string, label: string) => {
    const items = formData[field as keyof typeof formData] as string[]

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">{label}</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem(field)}>
            Add {label.slice(0, -1)}
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => updateArrayItem(field, index, e.target.value)}
                placeholder={`Enter ${label.toLowerCase().slice(0, -1)}`}
              />
              {items.length > 1 && (
                <Button type="button" variant="outline" size="sm" onClick={() => removeArrayItem(field, index)}>
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Job Type *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Freelance">Freelance</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary">Salary</Label>
          <Input
            id="salary"
            value={formData.salary}
            onChange={(e) => setFormData((prev) => ({ ...prev, salary: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="applicationDeadline">Application Deadline *</Label>
          <Input
            id="applicationDeadline"
            type="date"
            value={formData.applicationDeadline}
            onChange={(e) => setFormData((prev) => ({ ...prev, applicationDeadline: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyWebsite">Company Website</Label>
          <Input
            id="companyWebsite"
            type="url"
            value={formData.companyWebsite}
            onChange={(e) => setFormData((prev) => ({ ...prev, companyWebsite: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Job Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="introduction">Introduction</Label>
        <Textarea
          id="introduction"
          value={formData.introduction}
          onChange={(e) => setFormData((prev) => ({ ...prev, introduction: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {renderArrayField("requirements", "Requirements")}
          {renderArrayField("experience", "Experience")}
          {renderArrayField("skills", "Skills")}
        </div>
        <div className="space-y-4">
          {renderArrayField("benefits", "Benefits")}
          {renderArrayField("education", "Education")}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : job ? "Update Job" : "Create Job"}
        </Button>
      </div>
    </form>
  )
}
