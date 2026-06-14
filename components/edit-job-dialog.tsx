"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useActionState } from "react"
import { Plus, X, Calendar, Upload, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { type Job, updateJobAction, type UpdateJobState } from "@/lib/actions/jobs"
import { useToast } from "@/hooks/use-toast"

// Categories aligned with posting dialog
const jobCategories = [
  { label: "Accounting / Finance", description: "Jobs like accountant, auditor, financial analyst" },
  { label: "Admin / Secretarial", description: "Office assistants, executive secretaries, receptionists" },
  { label: "Advertising / Marketing / PR", description: "Digital marketers, brand managers, PR officers" },
  { label: "ICT / Telecom / IT", description: "Developers, network engineers, cybersecurity experts" },
  { label: "Education / Teaching / Training", description: "Teachers, trainers, curriculum designers" },
  { label: "Engineering / Manufacturing", description: "Production engineers, QA, technicians" },
]

const jobTypes = ["Full-Time", "Part-Time", "Contract", "Freelance", "Internship", "Other"]
const careerLevels = ["Fresher", "Entry Level", "Mid Level", "Senior Level", "Manager", "Director", "Executive"]

interface EditJobDialogProps {
  job: Job
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface EditJobFormData {
  title: string
  company: string
  location: string
  type: string
  category: string
  careerLevel: string
  salary: string
  applicationDeadline: Date | undefined
  introduction: string
  description: string
  howToApply: string
  contactEmail: string
  applicationLink: string
  applicationAddress: string
  companyWebsite: string
  requirements: string[]
  benefits: string[]
  education: string[]
  experience: string[]
  skills: string[]
  companyLogo: string | null
}

export default function EditJobDialog({ job, isOpen, onOpenChange, onSuccess }: EditJobDialogProps) {
  const [formData, setFormData] = useState<EditJobFormData>({
    title: "",
    company: "",
    location: "",
    type: "",
    category: "",
    careerLevel: "",
    salary: "",
    applicationDeadline: undefined,
    introduction: "",
    description: "",
    howToApply: "",
    contactEmail: "",
    applicationLink: "",
    applicationAddress: "",
    companyWebsite: "",
    requirements: [""],
    benefits: [""],
    education: [""],
    experience: [""],
    skills: [""],
    companyLogo: null,
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const { toast } = useToast()

  // Server Action wiring with useActionState [^1][^2]
  const initialState: UpdateJobState = { ok: false, error: "" }
  const [state, action, isPending] = useActionState(updateJobAction, initialState)

  // Initialize form from job
  useEffect(() => {
    if (!job) return
    setFormData({
      title: job.title ?? "",
      company: job.company ?? "",
      location: job.location ?? "",
      type: job.type ?? "",
      category: job.category ?? "",
      careerLevel: job.career_level ?? "",
      salary: job.salary ?? "",
      applicationDeadline: job.application_deadline ? parseISO(job.application_deadline) : undefined,
      introduction: job.introduction ?? "",
      description: job.description ?? "",
      howToApply: job.how_to_apply ?? "",
      contactEmail: job.contact_email ?? "",
      applicationLink: job.application_link ?? "",
      applicationAddress: job.application_address ?? "",
      companyWebsite: job.company_website ?? "",
      requirements: job.requirements && job.requirements.length ? job.requirements : [""],
      benefits: job.benefits && job.benefits.length ? job.benefits : [""],
      education: job.education && job.education.length ? job.education : [""],
      experience: job.experience && job.experience.length ? job.experience : [""],
      skills: job.skills && job.skills.length ? job.skills : [""],
      companyLogo: job.company_logo ?? null,
    })
    setLogoPreview(job.company_logo ?? null)
  }, [job])

  // React to server action results
  useEffect(() => {
    if (state?.ok) {
      toast({ title: "Success!", description: "Job updated successfully." })
      onOpenChange(false)
      onSuccess?.()
    } else if (state?.error) {
      toast({ title: "Update failed", description: state.error, variant: "destructive" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.ok, state?.error])

  // Helpers for array fields
  const addArrayItem = (field: keyof EditJobFormData) => {
    setFormData((prev) => ({ ...prev, [field]: [...(prev[field] as string[]), ""] }))
  }
  const removeArrayItem = (field: keyof EditJobFormData, index: number) => {
    setFormData((prev) => ({ ...prev, [field]: (prev[field] as string[]).filter((_, i) => i !== index) }))
  }
  const updateArrayItem = (field: keyof EditJobFormData, index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => (i === index ? value : item)),
    }))
  }

  // File to base64
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (e) => reject(e)
    })

  // Handle company logo upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please upload an image.", variant: "destructive" })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max size is 5MB.", variant: "destructive" })
      return
    }

    try {
      const base64 = await fileToBase64(file)
      setFormData((prev) => ({ ...prev, companyLogo: base64 }))
      setLogoPreview(base64)
    } catch (err) {
      console.error(err)
      toast({ title: "Upload error", description: "Failed to process image.", variant: "destructive" })
    }
  }

  const removeLogo = () => {
    setFormData((prev) => ({ ...prev, companyLogo: null }))
    setLogoPreview(null)
    const input = document.getElementById("editCompanyLogo") as HTMLInputElement | null
    if (input) input.value = ""
  }

  // Validate minimal required fields
  const validateForm = (): string | null => {
    if (!formData.title.trim()) return "Job title is required"
    if (!formData.company.trim()) return "Company name is required"
    if (!formData.description.trim()) return "Job description is required"
    if (!formData.applicationDeadline) return "Application deadline is required"
    if (!formData.type) return "Job type is required"
    if (!formData.category) return "Category is required"
    if (!formData.careerLevel) return "Career level is required"
    return null
  }

  // Build and dispatch the Server Action with FormData
  const handleSubmit = async () => {
    const err = validateForm()
    if (err) {
      toast({ title: "Validation error", description: err, variant: "destructive" })
      return
    }

    const fd = new FormData()
    fd.append("id", job.id) // important for server action
    fd.append("title", formData.title)
    fd.append("company", formData.company)
    fd.append("location", formData.location)
    fd.append("type", formData.type)
    fd.append("salary", formData.salary)
    fd.append(
      "applicationDeadline",
      formData.applicationDeadline ? format(formData.applicationDeadline, "yyyy-MM-dd") : "",
    )
    fd.append("description", formData.description)
    fd.append("introduction", formData.introduction)
    fd.append("howToApply", formData.howToApply)
    fd.append("contactEmail", formData.contactEmail)
    fd.append("applicationLink", formData.applicationLink)
    fd.append("applicationAddress", formData.applicationAddress)
    fd.append("companyWebsite", formData.companyWebsite)
    fd.append("category", formData.category)
    fd.append("careerLevel", formData.careerLevel)
    fd.append("companyLogo", formData.companyLogo || "")

    fd.append("requirements", JSON.stringify(formData.requirements.filter((v) => v.trim() !== "")))
    fd.append("benefits", JSON.stringify(formData.benefits.filter((v) => v.trim() !== "")))
    fd.append("education", JSON.stringify(formData.education.filter((v) => v.trim() !== "")))
    fd.append("experience", JSON.stringify(formData.experience.filter((v) => v.trim() !== "")))
    fd.append("skills", JSON.stringify(formData.skills.filter((v) => v.trim() !== "")))

    // Trigger the server action; useActionState handles pending and result
    action(fd)
  }

  const renderArrayField = (field: keyof EditJobFormData, label: string, required = false, placeholder = "") => {
    const items = (formData[field] as string[]) || [""]
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem(field)}>
            <Plus className="h-3 w-3 mr-1" />
            Add {label.slice(0, -1)}
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => updateArrayItem(field, index, e.target.value)}
                placeholder={placeholder || `Enter ${label.toLowerCase().slice(0, -1)}`}
                required={required && index === 0}
              />
              {items.length > 1 && (
                <Button type="button" variant="outline" size="sm" onClick={() => removeArrayItem(field, index)}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Job Post</DialogTitle>
          </DialogHeader>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Job Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Job Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Enter job title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                      placeholder="Enter company name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData((p) => ({ ...p, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobCategories.map((c) => (
                          <Tooltip key={c.label}>
                            <TooltipTrigger asChild>
                              <SelectItem value={c.label}>
                                <div className="flex items-center">
                                  {c.label}
                                  <Info className="h-3 w-3 ml-2 opacity-50" />
                                </div>
                              </SelectItem>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{c.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                      placeholder="e.g., New York, NY or Remote"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Job Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData((p) => ({ ...p, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Career Level <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.careerLevel}
                      onValueChange={(value) => setFormData((p) => ({ ...p, careerLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select career level" />
                      </SelectTrigger>
                      <SelectContent>
                        {careerLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary</Label>
                    <Input
                      id="salary"
                      value={formData.salary}
                      onChange={(e) => setFormData((p) => ({ ...p, salary: e.target.value }))}
                      placeholder="e.g., $80,000 - $100,000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Application Deadline <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.applicationDeadline && "text-muted-foreground",
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {formData.applicationDeadline ? format(formData.applicationDeadline, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={formData.applicationDeadline}
                          onSelect={(date) => setFormData((p) => ({ ...p, applicationDeadline: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Company Logo */}
                <div className="space-y-2">
                  <Label htmlFor="editCompanyLogo">Company Logo</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input
                        id="editCompanyLogo"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("editCompanyLogo")?.click()}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {logoPreview ? "Change Logo" : "Upload Logo"}
                      </Button>
                      {logoPreview && (
                        <Button type="button" variant="outline" size="sm" onClick={removeLogo}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {logoPreview && (
                      <div className="flex items-center space-x-2 p-2 border rounded-md">
                        <img
                          src={logoPreview || "/placeholder.svg?height=48&width=48&query=company%20logo%20preview"}
                          alt="Company Logo Preview"
                          className="w-12 h-12 object-contain rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            {formData.companyLogo === job.company_logo ? "Current logo" : "New logo uploaded"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Introduction */}
                <div className="space-y-2">
                  <Label htmlFor="introduction">Introduction</Label>
                  <Textarea
                    id="introduction"
                    value={formData.introduction}
                    onChange={(e) => setFormData((p) => ({ ...p, introduction: e.target.value }))}
                    placeholder="Brief introduction about the company or job"
                    rows={3}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Job Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Detailed description of the job"
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact & Apply */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact & How to Apply</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData((p) => ({ ...p, contactEmail: e.target.value }))}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyWebsite">Company Website</Label>
                    <Input
                      id="companyWebsite"
                      type="url"
                      value={formData.companyWebsite}
                      onChange={(e) => setFormData((p) => ({ ...p, companyWebsite: e.target.value }))}
                      placeholder="https://company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="applicationLink">Application Link</Label>
                    <Input
                      id="applicationLink"
                      value={formData.applicationLink}
                      onChange={(e) => setFormData((p) => ({ ...p, applicationLink: e.target.value }))}
                      placeholder="URL or email for applications"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="applicationAddress">Application Address</Label>
                    <Input
                      id="applicationAddress"
                      value={formData.applicationAddress}
                      onChange={(e) => setFormData((p) => ({ ...p, applicationAddress: e.target.value }))}
                      placeholder="Physical address for applications"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="howToApply">How to Apply</Label>
                  <Textarea
                    id="howToApply"
                    value={formData.howToApply}
                    onChange={(e) => setFormData((p) => ({ ...p, howToApply: e.target.value }))}
                    placeholder="Instructions, required documents and steps to apply"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Requirements & Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Requirements & Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {renderArrayField("requirements", "Requirements", true, "Enter requirement")}
                    {renderArrayField("experience", "Experience", false, "Enter experience requirement")}
                    {renderArrayField("skills", "Skills", false, "Enter required skill")}
                  </div>
                  <div className="space-y-4">
                    {renderArrayField("benefits", "Benefits", false, "Enter benefit")}
                    {renderArrayField("education", "Education", false, "Enter education requirement")}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Updating..." : "Update Job"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
