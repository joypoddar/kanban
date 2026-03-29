import { useRender } from "@base-ui/react"


export interface ColumnPanelProps extends useRender.ComponentProps<"div"> {
  variant?: "default" | "ghost" | "bordered"
  collapsed?: boolean
  onToggle?: () => void
}

export type ColumnHeaderProps = useRender.ComponentProps<"div">

export type ColumnFooterProps = useRender.ComponentProps<"div">

export type ColumnTitleProps = useRender.ComponentProps<"h3">

export type ColumnActionProps = useRender.ComponentProps<"div">

export interface ColumnToggleProps extends useRender.ComponentProps<"button"> {
  collapsed?: boolean
  onToggle?: () => void
}

export interface ColumnContentProps extends useRender.ComponentProps<"div"> {
  spacing?: "none" | "sm" | "md" | "lg"
}
