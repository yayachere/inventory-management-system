"use client"

import { useFormState } from "react-dom"
import { deleteItem } from "@/app/actions/inventory"
import { Button } from "@/components/ui/button"

interface DeleteItemButtonProps {
  itemId: number
}

interface State {
  message?: string | null
}

const initialState: State = {
  message: null,
}

export function DeleteItemButton({ itemId }: DeleteItemButtonProps) {
  const [state, formAction, pending] = useFormState(deleteItem, initialState)

  return (
    <form action={formAction}>
      <input type="hidden" name="itemId" value={itemId} />
      <Button disabled={pending} variant="destructive" size="sm" type="submit">
        {pending ? "Deleting..." : "Delete"}
      </Button>
      {state?.message && <p className="mt-2 text-sm text-red-500">{state.message}</p>}
    </form>
  )
}
