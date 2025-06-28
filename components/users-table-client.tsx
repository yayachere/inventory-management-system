"use client"

import { useState } from "react"
import { useFormState } from "react-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Edit, Trash, UserPlus, ToggleRight, ToggleLeft } from "lucide-react"
import { UserForm } from "@/components/user-form"
import { deleteUser, toggleUserStatus } from "@/app/actions/users"
import { hasPermission } from "@/lib/permissions"
import type { User } from "@/lib/db" // Assuming User type is in lib/db

interface UsersTableClientProps {
  users: User[]
  currentUserRole: string
}

const deleteInitialState = { message: "" }
const toggleInitialState = { message: "" }

export function UsersTableClient({ users, currentUserRole }: UsersTableClientProps) {
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [deleteState, deleteAction, deletePending] = useFormState(deleteUser, deleteInitialState)
  const [toggleState, toggleAction, togglePending] = useFormState(toggleUserStatus, toggleInitialState)

  const handleEditClick = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleAddUserSuccess = () => {
    setIsAddUserDialogOpen(false)
  }

  const handleEditUserSuccess = () => {
    setIsEditDialogOpen(false)
    setSelectedUser(null)
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        {hasPermission(currentUserRole, "canManageUsers") && (
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Fill in the details to create a new user account.</DialogDescription>
              </DialogHeader>
              <UserForm onSuccess={handleAddUserSuccess} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {deleteState?.message && !deletePending && (
        <Alert variant={deleteState.message.includes("successfully") ? "default" : "destructive"} className="mb-4">
          <AlertDescription>{deleteState.message}</AlertDescription>
        </Alert>
      )}
      {toggleState?.message && !togglePending && (
        <Alert variant={toggleState.message.includes("successfully") ? "default" : "destructive"} className="mb-4">
          <AlertDescription>{toggleState.message}</AlertDescription>
        </Alert>
      )}

      <div className="relative w-full overflow-auto">
        {" "}
        {/* Added responsive wrapper */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.role === "admin"
                        ? "default"
                        : user.role === "seller"
                          ? "secondary"
                          : user.role === "controller"
                            ? "outline"
                            : "default"
                    }
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? "default" : "destructive"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  {hasPermission(currentUserRole, "canManageUsers") && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(user)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>

                      <form action={toggleAction}>
                        <input type="hidden" name="id" value={user.id} />
                        <input type="hidden" name="currentStatus" value={user.is_active.toString()} />
                        <Button variant="secondary" size="sm" type="submit" disabled={togglePending}>
                          {user.is_active ? (
                            <ToggleLeft className="w-4 h-4 mr-1" />
                          ) : (
                            <ToggleRight className="w-4 h-4 mr-1" />
                          )}
                          {user.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </form>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the user &quot;{user.name}
                              &quot; ({user.email}) from the system.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={deletePending}>Cancel</AlertDialogCancel>
                            <form action={deleteAction}>
                              <input type="hidden" name="id" value={user.id} />
                              <AlertDialogAction type="submit" disabled={deletePending}>
                                {deletePending ? "Deleting..." : "Confirm"}
                              </AlertDialogAction>
                            </form>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User: {selectedUser.name}</DialogTitle>
              <DialogDescription>Update the details for this user account.</DialogDescription>
            </DialogHeader>
            <UserForm user={selectedUser} onSuccess={handleEditUserSuccess} />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
