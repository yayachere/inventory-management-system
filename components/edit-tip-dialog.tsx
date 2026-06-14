"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, X, Lightbulb, Save, Send } from "lucide-react"
import { updateTip, type Tip, type UpdateTipData } from "@/lib/actions/tips"
import { useToast } from "@/hooks/use-toast"

interface EditTipDialogProps {
  tip: Tip
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const TIP_CATEGORIES = [
  { value: "Career Development", label: "Career Development", description: "Tips for advancing your career" },
  { value: "Interview Skills", label: "Interview Skills", description: "Ace your job interviews" },
  { value: "Resume Writing", label: "Resume Writing", description: "Create compelling resumes" },
  { value: "Networking", label: "Networking", description: "Build professional relationships" },
  { value: "Remote Work", label: "Remote Work", description: "Work from home effectively" },
  { value: "Skill Development", label: "Skill Development", description: "Learn new professional skills" },
  { value: "Work-Life Balance", label: "Work-Life Balance", description: "Maintain healthy work habits" },
  { value: "Leadership", label: "Leadership", description: "Develop leadership skills" },
  { value: "Communication", label: "Communication", description: "Improve workplace communication" },
  { value: "Productivity", label: "Productivity", description: "Boost your work efficiency" },
]

const DIFFICULTY_LEVELS = [
  { value: "Beginner", label: "Beginner", description: "Easy to understand and implement" },
  { value: "Intermediate", label: "Intermediate", description: "Requires some experience" },
  { value: "Advanced", label: "Advanced", description: "For experienced professionals" },
]

export default function EditTipDialog({ tip, isOpen, onOpenChange, onSuccess }: EditTipDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentTag, setCurrentTag] = useState("")
  const { toast } = useToast()

  const [formData, setFormData] = useState<UpdateTipData>({
    id: tip.id,
    title: tip.title,
    content: tip.content,
    category: tip.category,
    author: tip.author,
    tags: tip.tags || [],
    difficulty_level: tip.difficulty_level,
    estimated_read_time: tip.estimated_read_time,
    is_featured: tip.is_featured,
    status: tip.status,
  })

  // Update form data when tip changes
  useEffect(() => {
    setFormData({
      id: tip.id,
      title: tip.title,
      content: tip.content,
      category: tip.category,
      author: tip.author,
      tags: tip.tags || [],
      difficulty_level: tip.difficulty_level,
      estimated_read_time: tip.estimated_read_time,
      is_featured: tip.is_featured,
      status: tip.status,
    })
  }, [tip])

  const handleInputChange = (field: keyof UpdateTipData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }))
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const validateForm = (): string[] => {
    const errors: string[] = []

    if (!formData.title.trim()) errors.push("Title is required")
    if (!formData.content.trim()) errors.push("Content is required")
    if (!formData.category) errors.push("Category is required")
    if (!formData.author.trim()) errors.push("Author is required")
    if (formData.estimated_read_time < 1) errors.push("Estimated read time must be at least 1 minute")

    return errors
  }

  const handleSubmit = async (isDraft = false) => {
    const errors = validateForm()
    if (errors.length > 0 && !isDraft) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        ...formData,
        status: isDraft ? "draft" : "published",
      }

      const result = await updateTip(submitData)

      if (result.success) {
        toast({
          title: "Success",
          description: `Tip updated successfully!`,
        })

        onOpenChange(false)
        onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update tip",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating tip:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Edit Tip
          </DialogTitle>
          <DialogDescription>Update your tip to help others succeed in their careers</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter tip title..."
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    placeholder="Your name..."
                    value={formData.author}
                    onChange={(e) => handleInputChange("author", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your tip content here..."
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>

          {/* Category and Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category & Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIP_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div>
                            <div className="font-medium">{category.label}</div>
                            <div className="text-sm text-muted-foreground">{category.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={formData.difficulty_level}
                    onValueChange={(value) => handleInputChange("difficulty_level", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-sm text-muted-foreground">{level.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="readTime">Estimated Read Time (minutes)</Label>
                  <Input
                    id="readTime"
                    type="number"
                    min="1"
                    max="60"
                    value={formData.estimated_read_time}
                    onChange={(e) => handleInputChange("estimated_read_time", Number.parseInt(e.target.value) || 5)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange("is_featured", checked)}
                />
                <Label htmlFor="featured">Mark as featured tip</Label>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Updating..." : "Update Tip"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
