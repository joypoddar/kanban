import { useRender } from "@base-ui/react"

export interface KanbanColumnProps extends useRender.ComponentProps<"div"> {
  variant?: "default" | "ghost" | "bordered"
  collapsed?: boolean
  collapsible?: boolean
  onToggle?: () => void
  cardCount?: number
}

export type KanbanColumnHeaderProps = useRender.ComponentProps<"div">

export type KanbanColumnFooterProps = useRender.ComponentProps<"div">

export type KanbanColumnTitleProps = useRender.ComponentProps<"h3">

export type KanbanColumnActionProps = useRender.ComponentProps<"div">

export interface KanbanColumnToggleProps extends useRender.ComponentProps<"button"> {
  collapsed?: boolean
  onToggle?: () => void
}

export interface KanbanColumnContentProps extends useRender.ComponentProps<"div"> {
  spacing?: "none" | "sm" | "md" | "lg"
}
