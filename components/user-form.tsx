"use client"

import { useState, useEffect } from "react"
import { useFormState } from "react-dom"
import { addUser, updateUser } from "@/app/actions/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { User } from "@/lib/db" // Assuming User type is in lib/db

interface UserFormProps {
  user?: User // Optional: if provided, it's an edit form
  onSuccess?: () => void
}

const initialState = { message: "" }

export function UserForm({ user, onSuccess }: UserFormProps) {
  const isEditMode = !!user
  const action = isEditMode ? updateUser : addUser
  const [state, formAction, pending] = useFormState(action, initialState)

  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [role, setRole] = useState(user?.role || "seller") // Default role for new users
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (state?.message && state.message.includes("successfully") && !pending) {
      onSuccess?.()
      if (!isEditMode) {
        // Clear form for new user creation
        setName("")
        setEmail("")
        setPassword("")
        setRole("seller")
      }
    }
  }, [state, pending, isEditMode, onSuccess])

  return (
    <form action={formAction} className="space-y-4">
      {isEditMode && <input type="hidden" name="id" value={user.id} />}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter user's name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter user's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select name="role" value={role} onValueChange={setRole} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
            <SelectItem value="controller">Controller</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{isEditMode ? "New Password (optional)" : "Password"}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder={isEditMode ? "Leave blank to keep current password" : "Enter password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isEditMode}
        />
      </div>

      {state?.message && (
        <Alert variant={state.message.includes("successfully") ? "default" : "destructive"}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (isEditMode ? "Updating User..." : "Adding User...") : isEditMode ? "Update User" : "Add User"}
      </Button>
    </form>
  )
}
