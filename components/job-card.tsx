"use client"

import Link from "next/link"
import { Calendar, MapPin, DollarSign, Building } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Job } from "@/lib/actions/jobs"

interface JobCardProps {
  job: Job
}

export default function JobCard({ job }: JobCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary hover:border-l-primary/80 group">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center text-muted-foreground mb-2">
              <Building className="h-4 w-4 mr-1" />
              <span className="font-medium">{job.company}</span>
            </div>
          </div>
          <Badge variant="secondary">{job.type}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{job.location}</span>
          </div>

          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Deadline {job.application_deadline}</span>
          </div>

          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Posted {formatDate(job.posted_date)}</span>
          </div>

          <p className="text-muted-foreground line-clamp-3">
            {job.description.length > 150 ? `${job.description.substring(0, 150)}...` : job.description}
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/jobs/${job.id}`} className="w-full">
          <Button className="w-full">Read More</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
