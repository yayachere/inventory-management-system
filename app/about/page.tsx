import Layout from '@/components/layout'
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const page = () => {
  return (
    <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> 
            
            {/* Back Button */}
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
            </Link>

            {/* about us */}
            <Card>
              <CardHeader>
                <CardTitle>About Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    JobsEthiopia is a modern job listing platform committed to bridging the gap between employers and job seekers 
                    across Ethiopia. Founded with the vision of making job search more accessible, transparent, and efficient, 
                    JobsEthiopia is designed to empower individuals to find meaningful employment and help organizations attract the
                     right talent.

                    We understand that job hunting can be overwhelming — that's why we provide reliable, up-to-date, and verified job
                     opportunities across a wide range of sectors including government, NGOs, private companies, finance, healthcare, 
                     education, and technology. Whether you're a fresh graduate looking for your first opportunity or a professional 
                     exploring your next career move, JobsEthiopia is here to support your journey.
                </p>
              </CardContent>
            </Card>
            {/* What we do */}
            <Card>
                <CardHeader>
                <CardTitle>What We Do:</CardTitle>
                </CardHeader>
                <CardContent>
                <ul className="space-y-2">
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-muted-foreground">Publish daily job vacancies from trusted employers and organizations.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-muted-foreground">Curate job listings that are clear, concise, and easy to apply to.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-muted-foreground">Share job alerts through multiple channels, including Telegram, Instagram, Facebook, and TikTok.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-muted-foreground">Help employers reach thousands of qualified candidates through targeted job promotion.</span>
                    </li>
                </ul>
                </CardContent>
            </Card>
            {/* Misson */}
            <Card>
              <CardHeader>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-muted-foreground">To make job searching easier, faster, and more transparent for everyone in Ethiopia by offering
                         a centralized, trusted, and user-friendly platform.</span>
                    </li>
                </ul>
              </CardContent>
            </Card>
            {/* Vision */}
            <Card>
              <CardHeader>
                <CardTitle>Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-muted-foreground">To become Ethiopia’s leading job connection hub — a place where opportunity meets talent, and 
                        where careers are built with confidence.</span>
                    </li>
                </ul>
              </CardContent>
            </Card>
        </div>
    </Layout>
  )
}

export default page
