import * as React from "react"
import { useRender } from "@base-ui/react"

export interface KanbanBoardColumnMeta {
  id: string
  collapsible?: boolean
}

export interface KanbanBoardContextValue {
  collapsed: Record<string, boolean>
  toggleColumn: (id: string) => void
  addColumn: (id: string, collapsible?: boolean) => void
  activeCardId: string | null
  overColumnId: string | null
  dndEnabled: boolean
}

export interface KanbanBoardProps extends useRender.ComponentProps<"div"> {
  spacing?: "none" | "sm" | "md" | "lg"
  maxOpen?: number
  columns?: KanbanBoardColumnMeta[]
  dndEnabled?: boolean
  onCardMove?: (
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    newIndex: number
  ) => void
  onCardDragOver?: (
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    newIndex: number
  ) => void
  onDragStart?: () => void
  onDragCancel?: () => void
  allowReorder?: boolean
  renderDragOverlay?: (activeCardId: string) => React.ReactNode
}
