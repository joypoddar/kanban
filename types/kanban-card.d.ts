import { useRender } from "@base-ui/react"

export interface KanbanCardProps extends useRender.ComponentProps<"div"> {
  variant?: "default" | "ghost" | "outlined"
  draggable?: boolean
}

export type KanbanCardHeaderProps = useRender.ComponentProps<"div">

export type KanbanCardTitleProps = useRender.ComponentProps<"h4">

export type KanbanCardDescriptionProps = useRender.ComponentProps<"p">

export type KanbanCardFooterProps = useRender.ComponentProps<"div">

export type KanbanScrollAreaProps = useRender.ComponentProps<"div">

export interface KanbanAddCardProps extends useRender.ComponentProps<"button"> {
  variant?: "dashed" | "solid" | "ghost"
}

export interface KanbanBadgeProps extends useRender.ComponentProps<"span"> {
  variant?: "default" | "success" | "warning" | "destructive"
}

export interface KanbanDropZoneProps extends useRender.ComponentProps<"div"> {
  active?: boolean
}