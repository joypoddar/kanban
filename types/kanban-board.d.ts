import { useRender } from "@base-ui/react"

export interface KanbanBoardColumnMeta {
  id: string
  collapsible?: boolean
}

export interface KanbanBoardContextValue {
  collapsed: Record<string, boolean>
  toggleColumn: (id: string) => void
  addColumn: (id: string, collapsible?: boolean) => void
}

export interface KanbanBoardProps extends useRender.ComponentProps<"div"> {
  spacing?: "none" | "sm" | "md" | "lg"
  maxOpen?: number
  columns?: KanbanBoardColumnMeta[]
}