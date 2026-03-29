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

export type KanbanAddCardProps = useRender.ComponentProps<"button">

export type KanbanBadgeProps = useRender.ComponentProps<"span">

export type KanbanDropZoneProps = useRender.ComponentProps<"div">