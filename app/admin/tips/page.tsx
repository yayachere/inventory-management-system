"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Trash2, Filter, Eye, Star, Clock, TrendingUp, Users, Home, Lightbulb } from "lucide-react"
import { getAllTips, deleteTip, type Tip } from "@/lib/actions/tips"
import TipPostingDialog from "@/components/tip-posting-dialog"
import EditTipDialog from "@/components/edit-tip-dialog"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function TipsAdminPage() {
  const [tips, setTips] = useState<Tip[]>([])
  const [filteredTips, setFilteredTips] = useState<Tip[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [editingTip, setEditingTip] = useState<Tip | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deletingTipId, setDeletingTipId] = useState<string | null>(null)
  const { toast } = useToast()

  // Load tips
  const loadTips = async () => {
    setLoading(true)
    try {
      const tipsData = await getAllTips()
      setTips(tipsData)
      setFilteredTips(tipsData)
    } catch (error) {
      console.error("Error loading tips:", error)
      toast({
        title: "Error",
        description: "Failed to load tips",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTips()
  }, [])

  // Filter tips based on search and filters
  useEffect(() => {
    let filtered = tips

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (tip) =>
          tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tip.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tip.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tip.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter((tip) => tip.category === filterCategory)
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((tip) => tip.status === filterStatus)
    }

    // Difficulty filter
    if (filterDifficulty !== "all") {
      filtered = filtered.filter((tip) => tip.difficulty_level === filterDifficulty)
    }

    setFilteredTips(filtered)
  }, [tips, searchTerm, filterCategory, filterStatus, filterDifficulty])

  // Handle edit tip
  const handleEditTip = (tip: Tip) => {
    setEditingTip(tip)
    setIsEditDialogOpen(true)
  }

  // Handle tip deletion
  const handleDeleteTip = async (tipId: string) => {
    setDeletingTipId(tipId)
    try {
      const result = await deleteTip(tipId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Tip deleted successfully",
        })
        loadTips() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete tip",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting tip:", error)
      toast({
        title: "Error",
        description: "Failed to delete tip",
        variant: "destructive",
      })
    } finally {
      setDeletingTipId(null)
    }
  }

  // Handle edit success
  const handleEditSuccess = () => {
    setEditingTip(null)
    setIsEditDialogOpen(false)
    loadTips() // Refresh the list
  }

  // Handle new tip posting success
  const handleNewTipSuccess = () => {
    loadTips() // Refresh the list
  }

  // Get unique categories for filter
  const categories = Array.from(new Set(tips.map((tip) => tip.category))).filter(Boolean)

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tips...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tips Management</h1>
          <p className="text-gray-600 mt-1">Manage career tips and advice</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/tips">
              <Lightbulb className="h-4 w-4 mr-2" />
              Tips
            </Link>
          </Button>
          <TipPostingDialog onSuccess={handleNewTipSuccess} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tips</p>
                <p className="text-2xl font-bold text-gray-900">{tips.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Featured Tips</p>
                <p className="text-2xl font-bold text-gray-900">{tips.filter((tip) => tip.is_featured).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tips.filter((tip) => tip.status === "published").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tips.reduce((sum, tip) => sum + tip.views_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setFilterCategory("all")
                setFilterStatus("all")
                setFilterDifficulty("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tips List ({filteredTips.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTips.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tips found matching your criteria.</p>
              <TipPostingDialog onSuccess={handleNewTipSuccess} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTips.map((tip) => (
                    <TableRow key={tip.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {tip.is_featured && <Star className="h-4 w-4 text-yellow-500" />}
                          {tip.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tip.category}</Badge>
                      </TableCell>
                      <TableCell>{tip.author}</TableCell>
                      <TableCell>
                        <Badge className={getDifficultyColor(tip.difficulty_level)}>{tip.difficulty_level}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tip.status === "published" ? "default" : "secondary"}>{tip.status}</Badge>
                      </TableCell>
                      <TableCell>{tip.views_count}</TableCell>
                      <TableCell>{formatDate(tip.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditTip(tip)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={deletingTipId === tip.id}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Tip</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{tip.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTip(tip.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {deletingTipId === tip.id ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Tip Dialog */}
      {editingTip && (
        <EditTipDialog
          tip={editingTip}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}
