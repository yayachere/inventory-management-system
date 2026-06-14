"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Filter, MoreVertical, User, Lock, LogOut, Briefcase, FileText, Checkbox, Trash } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { getAllJobs, deleteJob, bulkDeleteJobs, bulkMarkActive, getExpiredJobs, deleteAllExpiredJobs, type Job } from "@/lib/actions/jobs"
import { logout } from "@/lib/actions/auth"
import JobPostingDialog from "@/components/job-posting-dialog"
import EditJobDialog from "@/components/edit-job-dialog"
import { useRouter } from "next/navigation"
import { isExpired, getJobStatus, getStatusColor, getStatusIcon } from "@/lib/job-utils"

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set())
  const [expiredJobs, setExpiredJobs] = useState<Job[]>([])
  const { toast } = useToast()
  const router = useRouter()

  // Load jobs on component mount
  useEffect(() => {
    loadJobs()
  }, [])

  // Filter jobs when search term, filter type, or filter status changes
  useEffect(() => {
    let filtered = jobs

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter((job) => job.type === filterType)
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((job) => getJobStatus(job.application_deadline) === filterStatus)
    }

    setFilteredJobs(filtered)
  }, [jobs, searchTerm, filterType, filterStatus])

  const loadJobs = async () => {
    try {
      setLoading(true)
      const jobsData = await getAllJobs()
      const expiredJobsData = await getExpiredJobs()
      setJobs(jobsData)
      setFilteredJobs(jobsData)
      setExpiredJobs(expiredJobsData)
    } catch (error) {
      console.error("Error loading jobs:", error)
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      const result = await deleteJob(jobId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Job deleted successfully",
        })
        loadJobs() // Reload jobs after deletion
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete job",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting job:", error)
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      })
    }
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    loadJobs() // Reload jobs after successful edit
    setEditingJob(null)
    setIsEditDialogOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const toggleSelection = (jobId: string) => {
    const newSelected = new Set(selectedJobs)
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId)
    } else {
      newSelected.add(jobId)
    }
    setSelectedJobs(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedJobs.size === filteredJobs.length) {
      setSelectedJobs(new Set())
    } else {
      setSelectedJobs(new Set(filteredJobs.map((job) => job.id)))
    }
  }

  const clearSelection = () => {
    setSelectedJobs(new Set())
  }

  const handleBulkDelete = async () => {
    const jobIds = Array.from(selectedJobs)
    try {
      const result = await bulkDeleteJobs(jobIds)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        clearSelection()
        loadJobs()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting jobs:", error)
      toast({
        title: "Error",
        description: "Failed to delete jobs",
        variant: "destructive",
      })
    }
  }

  const handleBulkMarkActive = async () => {
    const jobIds = Array.from(selectedJobs)
    try {
      const result = await bulkMarkActive(jobIds)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        clearSelection()
        loadJobs()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating jobs:", error)
      toast({
        title: "Error",
        description: "Failed to update jobs",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAllExpired = async () => {
    try {
      const result = await deleteAllExpiredJobs()
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        loadJobs()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting expired jobs:", error)
      toast({
        title: "Error",
        description: "Failed to delete expired jobs",
        variant: "destructive",
      })
    }
  }

  const getJobTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "full-time":
        return "bg-green-100 text-green-800"
      case "part-time":
        return "bg-blue-100 text-blue-800"
      case "contract":
        return "bg-orange-100 text-orange-800"
      case "internship":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage job postings and applications</p>
          </div>
          <div className="flex items-center space-x-2">
            <JobPostingDialog onSuccess={loadJobs} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/admin/change-password")}>
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex space-x-2">
          <Button variant="default" className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4" />
            <span>Jobs Dashboard</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center space-x-2"
            onClick={() => router.push("/admin/tips")}
          >
            <FileText className="h-4 w-4" />
            <span>Tips Management</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                Active
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {jobs.filter((job) => !isExpired(job.application_deadline)).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired Jobs</CardTitle>
              <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                Expired
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {expiredJobs.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selected</CardTitle>
              <Checkbox className="h-4 w-4" checked={selectedJobs.size === filteredJobs.length && filteredJobs.length > 0} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedJobs.size}</div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedJobs.size > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-sm font-medium text-gray-700">
                  {selectedJobs.size} job{selectedJobs.size > 1 ? 's' : ''} selected
                </div>
                <div className="flex flex-wrap gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Jobs</AlertDialogTitle>
                        <AlertDialogDescription>
                          Delete {selectedJobs.size} selected job{selectedJobs.size > 1 ? 's' : ''}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleBulkDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button variant="outline" size="sm" onClick={handleBulkMarkActive}>
                    Mark Active
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete All Expired */}
        {expiredJobs.length > 0 && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-sm font-medium text-gray-700">
                  {expiredJobs.length} expired job{expiredJobs.length > 1 ? 's' : ''} found
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                      <Trash className="h-4 w-4 mr-2" />
                      Delete All Expired
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Expired Jobs</AlertDialogTitle>
                      <AlertDialogDescription>
                        Delete all {expiredJobs.length} expired job{expiredJobs.length > 1 ? 's' : ''}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAllExpired}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Job Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs by title, company, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Full-Time">Full-Time</SelectItem>
                    <SelectItem value="Part-Time">Part-Time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Jobs Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedJobs.size === filteredJobs.length && filteredJobs.length > 0}
                        indeterminate={selectedJobs.size > 0 && selectedJobs.size < filteredJobs.length}
                        onChange={toggleSelectAll}
                        className="cursor-pointer"
                      />
                    </TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {searchTerm || filterType !== "all" || filterStatus !== "all" ? "No jobs match your search criteria" : "No jobs posted yet"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJobs.map((job) => {
                      const status = getJobStatus(job.application_deadline)
                      return (
                        <TableRow key={job.id} className={selectedJobs.has(job.id) ? "bg-blue-50" : isExpired(job.application_deadline) ? "opacity-60" : ""}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedJobs.has(job.id)}
                              onChange={() => toggleSelection(job.id)}
                              className="cursor-pointer"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              {job.company_logo && (
                                <img
                                  src={job.company_logo || "/placeholder.svg"}
                                  alt={`${job.company} logo`}
                                  className="w-8 h-8 object-contain rounded"
                                />
                              )}
                              <span>{job.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>{job.company}</TableCell>
                          <TableCell>{job.location || "Not specified"}</TableCell>
                          <TableCell>
                            <Badge className={getJobTypeColor(job.type)}>{job.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(status)}>
                              {getStatusIcon(status)} {status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(job.application_deadline)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditJob(job)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Job</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{job.title}" at {job.company}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteJob(job.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Job Dialog */}
        {editingJob && (
          <EditJobDialog
            job={editingJob}
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSuccess={handleEditSuccess}
          />
        )}
      </div>
    </div>
  )
}
