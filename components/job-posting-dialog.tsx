"use client"

import type React from "react"
import { useState } from "react"
import { Plus, X, Upload, Calendar, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { createJobPosting, saveDraftJobPosting } from "@/lib/actions/job-posting"
import { useToast } from "@/hooks/use-toast"

// Job categories with descriptions for tooltips
const jobCategories = [
  { label: "Accounting / Finance", description: "Jobs like accountant, auditor, financial analyst" },
  { label: "Admin / Secretarial", description: "Office assistants, executive secretaries, receptionists" },
  { label: "Advertising / Marketing / PR", description: "Digital marketers, brand managers, PR officers" },
  { label: "ICT / Telecom / IT", description: "Developers, network engineers, cybersecurity experts" },
  { label: "Education / Teaching / Training", description: "Teachers, trainers, curriculum designers" },
  { label: "Engineering / Manufacturing", description: "Production engineers, QA, technicians" },
]

// Job type options
const jobTypes = ["Full-Time", "Internship", "Contract", "Other"]

// Career level options
const careerLevels = ["Fresher", "Entry Level", "Mid Level", "Senior Level", "Manager", "Director", "Executive"]

interface JobPosition {
  id: string
  jobTitle: string
  qualifications: string[]
  responsibilities: string[]
  applicationLink: string
  location: string
  jobType: string
  salary: string
  benefits: string[]
  skills: string[]
  experience: string[]
  careerLevel: string
}

interface JobPostData {
  category: string
  howToApply: string
  companyName: string
  deadline: Date | undefined
  companyLogo: string | null // Base64 encoded image
  introduction: string
  description: string
  email: string
  website: string
  applicationAddress: string
  positions: JobPosition[]
}

const initialPosition: JobPosition = {
  id: "1",
  jobTitle: "",
  qualifications: [""],
  responsibilities: [""],
  applicationLink: "",
  location: "",
  jobType: "",
  salary: "",
  benefits: [""],
  skills: [""],
  experience: [""],
  careerLevel: "",
}

const initialJobPost: JobPostData = {
  category: "",
  howToApply: "",
  companyName: "",
  deadline: undefined,
  companyLogo: null,
  introduction: "",
  description: "",
  email: "",
  website: "",
  applicationAddress: "",
  positions: [initialPosition],
}

interface JobPostingDialogProps {
  onSuccess?: () => void
}

export default function JobPostingDialog({ onSuccess }: JobPostingDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [jobPost, setJobPost] = useState<JobPostData>(initialJobPost)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const { toast } = useToast()

  // Add new job position
  const addPosition = () => {
    const newPosition: JobPosition = {
      ...initialPosition,
      id: Date.now().toString(),
      qualifications: [""],
      responsibilities: [""],
      benefits: [""],
      skills: [""],
      experience: [""],
    }
    setJobPost((prev) => ({
      ...prev,
      positions: [...prev.positions, newPosition],
    }))
  }

  // Remove job position
  const removePosition = (positionId: string) => {
    if (jobPost.positions.length > 1) {
      setJobPost((prev) => ({
        ...prev,
        positions: prev.positions.filter((p) => p.id !== positionId),
      }))
    }
  }

  // Update position field
  const updatePosition = (positionId: string, field: keyof JobPosition, value: any) => {
    setJobPost((prev) => ({
      ...prev,
      positions: prev.positions.map((p) => (p.id === positionId ? { ...p, [field]: value } : p)),
    }))
  }

  // Add array field item
  const addArrayItem = (positionId: string, field: keyof JobPosition) => {
    setJobPost((prev) => ({
      ...prev,
      positions: prev.positions.map((p) =>
        p.id === positionId ? { ...p, [field]: [...(p[field] as string[]), ""] } : p,
      ),
    }))
  }

  // Remove array field item
  const removeArrayItem = (positionId: string, field: keyof JobPosition, index: number) => {
    setJobPost((prev) => ({
      ...prev,
      positions: prev.positions.map((p) =>
        p.id === positionId ? { ...p, [field]: (p[field] as string[]).filter((_, i) => i !== index) } : p,
      ),
    }))
  }

  // Update array field item
  const updateArrayItem = (positionId: string, field: keyof JobPosition, index: number, value: string) => {
    setJobPost((prev) => ({
      ...prev,
      positions: prev.positions.map((p) =>
        p.id === positionId
          ? {
              ...p,
              [field]: (p[field] as string[]).map((item, i) => (i === index ? value : item)),
            }
          : p,
      ),
    }))
  }

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file.",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      try {
        const base64 = await fileToBase64(file)
        setJobPost((prev) => ({ ...prev, companyLogo: base64 }))
        setLogoPreview(base64)
      } catch (error) {
        console.error("Error converting file to base64:", error)
        toast({
          title: "Upload Error",
          description: "Failed to process the image. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  // Remove logo
  const removeLogo = () => {
    setJobPost((prev) => ({ ...prev, companyLogo: null }))
    setLogoPreview(null)
    // Reset file input
    const fileInput = document.getElementById("companyLogo") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const validateForm = (): string | null => {
    if (!jobPost.companyName.trim()) {
      return "Company name is required and cannot be empty"
    }
    if (!jobPost.description.trim()) {
      return "Job description is required and cannot be empty"
    }
    if (!jobPost.deadline) {
      return "Application deadline is required"
    }

    // Validate positions with more specific messages
    for (let i = 0; i < jobPost.positions.length; i++) {
      const position = jobPost.positions[i]
      if (!position.jobTitle.trim()) {
        return `Job title is required for position ${i + 1}`
      }
      if (!position.jobType) {
        return `Job type must be selected for position ${i + 1}`
      }
      if (!position.careerLevel) {
        return `Career level must be selected for position ${i + 1}`
      }
      if (position.qualifications.every((q) => !q.trim())) {
        return `At least one qualification is required for position ${i + 1}`
      }
    }

    return null
  }

  const handleSubmit = async (isDraft = false) => {
    // Only validate for published posts, not drafts
    if (!isDraft) {
      const validationError = validateForm()
      if (validationError) {
        toast({
          title: "❌ Validation Error",
          description: validationError,
          variant: "destructive",
        })
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Prepare data for submission
      const submissionData = {
        category: jobPost.category,
        howToApply: jobPost.howToApply,
        companyName: jobPost.companyName,
        deadline: jobPost.deadline ? format(jobPost.deadline, "yyyy-MM-dd") : "",
        introduction: jobPost.introduction,
        description: jobPost.description,
        email: jobPost.email,
        website: jobPost.website,
        applicationAddress: jobPost.applicationAddress,
        companyLogo: jobPost.companyLogo,
        positions: jobPost.positions.map((position) => ({
          jobTitle: position.jobTitle,
          qualifications: position.qualifications.filter((q) => q.trim() !== ""),
          responsibilities: position.responsibilities.filter((r) => r.trim() !== ""),
          applicationLink: position.applicationLink,
          location: position.location,
          jobType: position.jobType,
          salary: position.salary,
          benefits: position.benefits.filter((b) => b.trim() !== ""),
          skills: position.skills.filter((s) => s.trim() !== ""),
          experience: position.experience.filter((e) => e.trim() !== ""),
          careerLevel: position.careerLevel,
        })),
      }

      const result = isDraft ? await saveDraftJobPosting(submissionData) : await createJobPosting(submissionData)

      if (result.success) {
        toast({
          title: isDraft ? "✅ Draft Saved!" : "🎉 Job Posted!",
          description:
            result.message || (isDraft ? "Your draft has been saved successfully!" : "Your job posting is now live!"),
        })

        // Reset form and close dialog
        setJobPost(initialJobPost)
        setLogoPreview(null)
        setIsOpen(false)

        // Call success callback if provided
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({
          title: "❌ Error",
          description: result.error || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast({
        title: "❌ Submission Failed",
        description: "Failed to submit job posting. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render array input field
  const renderArrayField = (
    positionId: string,
    field: keyof JobPosition,
    label: string,
    required = false,
    placeholder = "",
  ) => {
    const position = jobPost.positions.find((p) => p.id === positionId)
    const items = (position?.[field] as string[]) || [""]

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem(positionId, field)}>
            <Plus className="h-3 w-3 mr-1" />
            Add {label.slice(0, -1)}
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => updateArrayItem(positionId, field, index, e.target.value)}
                placeholder={placeholder || `Enter ${label.toLowerCase().slice(0, -1)}`}
                required={required && index === 0}
              />
              {items.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem(positionId, field, index)}
                >
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
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Post New Job</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Create Job Post</DialogTitle>
          </DialogHeader>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Shared Fields Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Post Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={jobPost.category}
                      onValueChange={(value) => setJobPost((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobCategories.map((category) => (
                          <Tooltip key={category.label}>
                            <TooltipTrigger asChild>
                              <SelectItem value={category.label}>
                                <div className="flex items-center">
                                  {category.label}
                                  <Info className="h-3 w-3 ml-2 opacity-50" />
                                </div>
                              </SelectItem>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{category.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label htmlFor="companyName">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="companyName"
                      value={jobPost.companyName}
                      onChange={(e) => setJobPost((prev) => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Enter company name"
                      required
                    />
                  </div>

                  {/* Deadline */}
                  <div className="space-y-2">
                    <Label>
                      Application Deadline <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !jobPost.deadline && "text-muted-foreground",
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {jobPost.deadline ? format(jobPost.deadline, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={jobPost.deadline}
                          onSelect={(date) => setJobPost((prev) => ({ ...prev, deadline: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Company Logo */}
                  <div className="space-y-2">
                    <Label htmlFor="companyLogo">Company Logo</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          id="companyLogo"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("companyLogo")?.click()}
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
                            src={logoPreview || "/placeholder.svg"}
                            alt="Company Logo Preview"
                            className="w-12 h-12 object-contain rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Logo uploaded successfully</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={jobPost.email}
                      onChange={(e) => setJobPost((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@company.com"
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website">Company Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={jobPost.website}
                      onChange={(e) => setJobPost((prev) => ({ ...prev, website: e.target.value }))}
                      placeholder="https://company.com"
                    />
                  </div>
                </div>

                {/* Application Address */}
                <div className="space-y-2">
                  <Label htmlFor="applicationAddress">Application Address</Label>
                  <Input
                    id="applicationAddress"
                    value={jobPost.applicationAddress}
                    onChange={(e) => setJobPost((prev) => ({ ...prev, applicationAddress: e.target.value }))}
                    placeholder="Physical address for in-person applications"
                  />
                </div>

                {/* Introduction */}
                <div className="space-y-2">
                  <Label htmlFor="introduction">Introduction</Label>
                  <Textarea
                    id="introduction"
                    value={jobPost.introduction}
                    onChange={(e) => setJobPost((prev) => ({ ...prev, introduction: e.target.value }))}
                    placeholder="Brief introduction about the company or job post"
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
                    value={jobPost.description}
                    onChange={(e) => setJobPost((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the job post"
                    rows={4}
                    required
                  />
                </div>

                {/* How to Apply */}
                <div className="space-y-2">
                  <Label htmlFor="howToApply">How to Apply</Label>
                  <Textarea
                    id="howToApply"
                    value={jobPost.howToApply}
                    onChange={(e) => setJobPost((prev) => ({ ...prev, howToApply: e.target.value }))}
                    placeholder="Instructions on how candidates should apply"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Job Positions Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Job Positions</h3>
                <Button type="button" variant="outline" onClick={addPosition}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Position
                </Button>
              </div>

              {jobPost.positions.map((position, positionIndex) => (
                <Card key={position.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">Position {positionIndex + 1}</CardTitle>
                      {jobPost.positions.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removePosition(position.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Job Title */}
                      <div className="space-y-2">
                        <Label>
                          Job Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={position.jobTitle}
                          onChange={(e) => updatePosition(position.id, "jobTitle", e.target.value)}
                          placeholder="e.g., Senior Software Engineer"
                          required
                        />
                      </div>

                      {/* Location */}
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          value={position.location}
                          onChange={(e) => updatePosition(position.id, "location", e.target.value)}
                          placeholder="e.g., New York, NY or Remote"
                        />
                      </div>

                      {/* Job Type */}
                      <div className="space-y-2">
                        <Label>
                          Job Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={position.jobType}
                          onValueChange={(value) => updatePosition(position.id, "jobType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                          <SelectContent>
                            {jobTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Career Level */}
                      <div className="space-y-2">
                        <Label>
                          Career Level <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={position.careerLevel}
                          onValueChange={(value) => updatePosition(position.id, "careerLevel", value)}
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

                      {/* Salary */}
                      <div className="space-y-2">
                        <Label>Salary</Label>
                        <Input
                          value={position.salary}
                          onChange={(e) => updatePosition(position.id, "salary", e.target.value)}
                          placeholder="e.g., $80,000 - $100,000"
                        />
                      </div>

                      {/* Application Link */}
                      <div className="space-y-2">
                        <Label>Application Link</Label>
                        <Input
                          value={position.applicationLink}
                          onChange={(e) => updatePosition(position.id, "applicationLink", e.target.value)}
                          placeholder="URL or email for applications"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Array Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {renderArrayField(position.id, "qualifications", "Qualifications", true, "Enter qualification")}
                        {renderArrayField(
                          position.id,
                          "experience",
                          "Experience",
                          true,
                          "Enter experience requirement",
                        )}
                        {renderArrayField(position.id, "skills", "Skills", false, "Enter required skill")}
                      </div>
                      <div className="space-y-4">
                        {renderArrayField(
                          position.id,
                          "responsibilities",
                          "Responsibilities",
                          false,
                          "Enter responsibility",
                        )}
                        {renderArrayField(position.id, "benefits", "Benefits", false, "Enter benefit")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Draft"}
              </Button>
              <Button type="button" onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Job"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
