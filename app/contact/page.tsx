'use client'

import { useState } from "react"
import { ArrowLeft,} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Layout from "@/components/layout"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"

const page = () => {
    const [isPending, setIsPending] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const formSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPending(true);
        setAlertMessage("");

        const formData = new FormData(e.currentTarget);
        setName(formData.get("name") as string);
        setEmail(formData.get("email") as string);
        setMessage(formData.get("message") as string);

        // Simulate a network request
        try {
            // Here you would typically send the data to your server
            console.log({ name, email, message });
            setAlertMessage("Thank you for your message!");
        } catch (error) {
            setAlertMessage("Failed to send your message. Please try again later.");
        } finally {
            setIsPending(false);
            // Reset form fields
            setName("");
            setEmail("");
            setMessage("");
        }

    }
    
  return (
    <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> 
            
            {/* Back Button */}
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
            </Link>

            {/* Contact Us Form */}

            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-foreground">Contact Us</CardTitle>
                    <CardDescription>Fill the form and send us your message, Thank You for your feedback!!</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={formSubmit} className="space-y-6">
                    { alertMessage ? (
                        <Alert variant={"default"}>
                        <AlertDescription>{alertMessage}</AlertDescription>
                        </Alert>
                    ): null } 

                    <div className="space-y-4">
                        <Label htmlFor="name">Name</Label>
                        <Input
                        id="name"
                        name="name"
                        onChange={e => setName(e.target.value)}
                        value={name}
                        type="text"
                        required
                        placeholder="Jone Doe"
                        />
                        <Label htmlFor="email">Email address</Label>
                        <Input
                        id="email"
                        name="email"
                        type="email"
                        onChange={e => setEmail(e.target.value)}
                        value={email}
                        autoComplete="email"
                        required
                        placeholder="admin@jobboard.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                        id="message"
                        name="message"
                        onChange={e => setMessage(e.target.value)}
                        value={message}
                        placeholder="Your message here"
                        required
                        rows={6}/>
                    </div>

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Submitting..." : "Submit"}
                    </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    </Layout>
  )
}

export default page
