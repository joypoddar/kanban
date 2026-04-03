import { cn } from "@/lib/utils"
import { KanbanBoardProps } from "@/types/kanban-board"
import { mergeProps, useRender } from "@base-ui/react"
import { cva, type VariantProps } from "class-variance-authority"

const boardVariants = cva("flex overflow-x-auto", {
  variants: {
    spacing: {
      none: "gap-0",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
    },
  },
  defaultVariants: {
    spacing: "md",
  },
})

function KanbanBoardPrimitive({
  render,
  ...otherProps
}: Omit<KanbanBoardProps, "spacing">) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({}, otherProps),
  })
}

function KanbanBoard({
  spacing,
  className,
  ...props
}: KanbanBoardProps & VariantProps<typeof boardVariants>) {
  return (
    <KanbanBoardPrimitive
      data-slot="kanban-board"
      className={cn(boardVariants({ spacing }), className)}
      {...props}
    />
  )
}

export { KanbanBoard }
