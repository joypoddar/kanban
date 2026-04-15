import { useRender } from "@base-ui/react"

export interface KanbanColumnProps extends useRender.ComponentProps<"div"> {
  variant?: "default" | "bordered" | "borderBg"
  collapsed?: boolean
  collapsible?: boolean
  onToggle?: () => void
  cardCount?: number
  editable?: boolean
  color?: string
}

export interface KanbanColumnMenuProps {
  onEdit?: () => void
  onMoveLeft?: () => void
  onMoveRight?: () => void
  onDelete?: () => void
  canMoveLeft?: boolean
  canMoveRight?: boolean
}

export interface KanbanColumnEditPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultName?: string
  defaultColor?: string
  onSave: (name: string, color: string) => void
}

export interface KanbanColumnDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  columnTitle?: string
  onConfirm: () => void
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
