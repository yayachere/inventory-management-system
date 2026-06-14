"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Clock, Calendar, User, BookOpen, Share2, Heart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Layout from "@/components/layout"
import Link from "next/link"
import { getTipById, type Tip } from "@/lib/actions/tips"

export default function TipDetailPage() {
  const params = useParams()
  const [tip, setTip] = useState<Tip | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const fetchTip = async () => {
      if (params.id) {
        try {
          const tipData = await getTipById(params.id as string)
          setTip(tipData)
        } catch (error) {
          console.error("Error fetching tip:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchTip()
  }, [params.id])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleShare = async () => {
    if (navigator.share && tip) {
      try {
        await navigator.share({
          title: tip.title,
          text: tip.content.substring(0, 100) + "...",
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      // You could show a toast notification here
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>Loading tip...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!tip) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Tip Not Found</h1>
            <p className="text-muted-foreground mb-6">The tip you're looking for doesn't exist or has been removed.</p>
            <Link href="/tips">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tips
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/tips">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tips
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className={getDifficultyColor(tip.difficulty_level)}>
              {tip.difficulty_level}
            </Badge>
            <Badge variant="secondary">{tip.category}</Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            {tip.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {tip.author || 'JobsEthiopia Team'}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(tip.created_at)}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {tip.read_time || '5'} min read
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLiked(!isLiked)}
              className={isLiked ? "text-red-600 border-red-200" : ""}
            >
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
              {isLiked ? "Liked" : "Like"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Article Content */}
        <Card>
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <div className="text-base leading-relaxed whitespace-pre-wrap">
                {tip.content}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {tip.tags && tip.tags.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tip.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Related Tips Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Want more career tips?
            </h3>
            <p className="text-muted-foreground mb-6">
              Explore our collection of expert advice and practical tips
            </p>
            <Link href="/tips">
              <Button>
                <BookOpen className="h-4 w-4 mr-2" />
                Browse All Tips
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
