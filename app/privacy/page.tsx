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
            <Card className='text-muted-foreground'>
              <CardHeader>
                <CardTitle>Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent className='space-x-4 space-y-4'>
                
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    Effective Date: July 2025
                </p>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    At JobsEthiopia, we are committed to respecting and protecting your privacy. 
                    This policy outlines how we handle your information when you visit our website.
                </p>
                <h2 className='mt-4'>1. No Personal Data Collection</h2>
                <p>JobsEthiopia does not collect, store, or process any personal data from users.
                    We simply provide job information and redirect you to the official job application pages of employers and organizations. 
                    All applications are submitted directly to those external websites, and we have no access to your application data.
                </p>
                <h2 className='mt-4'>2. Cookies and Analytics</h2>
                <p>To improve website performance and user experience, we may use basic, non-identifying cookies or third-party analytics tools 
                    (e.g., Google Analytics) to track general usage patterns like:
                </p>
                <ul className="space-y-2 mt-2">
                        <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-muted-foreground">Pages visited</span>
                        </li>
                        <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-muted-foreground">Device type</span>
                        </li>
                        <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-muted-foreground">Browser type</span>
                        </li>
                    </ul>
                <p>This data is aggregated and anonymized, and it helps us understand how users interact with our content — 
                    but it cannot be used to identify you personally.
                </p>
                <h2 className='mt-4'>3. External Links</h2>
                <p>JobsEthiopia contains links to third-party websites where job applications are processed. We are not 
                    responsible for the privacy practices or content of these external sites. We recommend reviewing their 
                    individual privacy policies before submitting any information.
                </p>
                <h2 className='mt-4'>4. Your Rights</h2>
                <p>Since we do not collect personal data, there is no user profile or information stored on our servers. 
                    If you have any concerns, feel free to contact us at jobsethiopiaofficial@gmail.com
                </p>
                <h2 className='mt-4'>5. Changes to This Policy</h2>
                <p>This Privacy Policy may be updated as needed to reflect changes in technology, legal requirements, or 
                    website features. The date at the top will indicate the latest version.
                </p>
              </CardContent>
            </Card>
            
            {/* Terms and conditions*/}
            <Card className='mt-8 text-muted-foreground'>
                <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent className='space-x-4 space-y-4'>
                    <p>Effective Date: July 2025</p>
                    <p>Welcome to JobsEthiopia — a platform designed to help job seekers in Ethiopia discover employment opportunities from verified
                         employers and organizations.
                    </p>
                    <p>By using this website, you agree to the following terms:</p>
                    <h2>1. Purpose of the Platform</h2>
                    <p>JobsEthiopia is not a recruitment agency. We do not accept or process job applications on behalf of employers. Instead, we:
                    </p>
                    <ul className="space-y-2 mt-2">
                        <li className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-muted-foreground">Publish job vacancies from trusted employers and organizations.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-muted-foreground">Redirect users to the official websites or application platforms owned by the 
                                employers</span>
                        </li>
                    </ul>
                    <h2>2. User Responsibility</h2>
                    <ul className="space-y-2 mt-2">
                        <li className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-muted-foreground">You are responsible for verifying the legitimacy and details of any job post before 
                                applying.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-muted-foreground">JobsEthiopia is not responsible for the hiring process, application outcomes, or 
                                communications between you and the employer.</span>
                        </li>
                    </ul>
                    <h2>3. Accuracy of Listings</h2>
                    <p>We strive to ensure the information on JobsEthiopia is accurate and up to date. However, we do not guarantee the completeness, 
                        reliability, or current validity of each job post, especially since opportunities may close or change after publishing.</p>
                    <h2>4. Intellectual Property</h2>
                    <p>All content on JobsEthiopia — including the website design, logo, and formatting — is the intellectual property of JobsEthiopia. 
                        Job posts, however, are the property of the respective employers.</p>
                    <p>You may not copy, reproduce, or republish content from our website without permission, except for personal and non-commercial use.</p>
                    <h2>5. External Sites</h2>
                    <p>We link to third-party websites for job applications. These sites are not under our control, and we are not liable for any damages or 
                        losses related to your use of those external platforms.</p>
                    <h2>6. Limitation of Liability</h2>
                    <p>JobsEthiopia is not liable for any direct, indirect, or incidental damages resulting from your use of this site, including missed job 
                        opportunities, incorrect job data, or technical issues.</p>
                    <h2>7. Governing Law</h2>
                    <p>These terms are governed by and interpreted in accordance with the laws of the Federal Democratic Republic of Ethiopia.</p>
                    <h2>8. Contact</h2>
                    <p>For any inquiries regarding these terms, please contact us at:</p>
                    <p>📧 jobsethiopiaofficial</p>
                    <p>📍 Addis Ababa, Ethiopia</p>
                </CardContent>
            </Card>
        </div>
    </Layout>
  )
}

export default page
