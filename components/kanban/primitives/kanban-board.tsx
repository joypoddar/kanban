"use client"

import { cn } from "@/lib/utils"
import {
  KanbanBoardColumnMeta,
  KanbanBoardContextValue,
  KanbanBoardProps,
} from "@/types/kanban-board"
import { mergeProps, useRender } from "@base-ui/react"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const boardVariants = cva("flex h-full justify-center overflow-x-auto", {
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

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

const KanbanBoardContext = React.createContext<KanbanBoardContextValue | null>(
  null
)

export function useKanbanBoard() {
  return React.useContext(KanbanBoardContext)
}

// ─────────────────────────────────────────────
// Init helpers
// ─────────────────────────────────────────────

function computeInitialState(
  columns: KanbanBoardColumnMeta[],
  maxOpen?: number
) {
  const fixed = columns.filter((c) => c.collapsible === false)
  const collapsible = columns.filter((c) => c.collapsible !== false)
  const allowedOpen =
    maxOpen !== undefined
      ? Math.max(0, maxOpen - fixed.length)
      : collapsible.length
  const openOrder = collapsible.slice(0, allowedOpen).map((c) => c.id)
  const openSet = new Set(openOrder)
  const collapsed: Record<string, boolean> = {}
  collapsible.forEach((c) => {
    if (!openSet.has(c.id)) collapsed[c.id] = true
  })
  return { collapsed, openOrder }
}

// ─────────────────────────────────────────────
// Primitive
// ─────────────────────────────────────────────

function KanbanBoardPrimitive({
  render,
  ...otherProps
}: Omit<KanbanBoardProps, "spacing" | "maxOpen" | "columns">) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({}, otherProps),
  })
}

// ─────────────────────────────────────────────
// KanbanBoard
// ─────────────────────────────────────────────

function KanbanBoard({
  spacing,
  maxOpen,
  columns: columnsMeta = [],
  className,
  children,
  ...props
}: KanbanBoardProps & VariantProps<typeof boardVariants>) {
  const colMetaRef = React.useRef<Record<string, boolean>>(
    Object.fromEntries(columnsMeta.map((c) => [c.id, c.collapsible !== false]))
  )

  const [state, setState] = React.useState(() =>
    computeInitialState(columnsMeta, maxOpen)
  )

  const toggleColumn = React.useCallback(
    (id: string) => {
      setState((prev) => {
        const isCollapsed = prev.collapsed[id] ?? false
        if (!isCollapsed) {
          return {
            collapsed: { ...prev.collapsed, [id]: true },
            openOrder: prev.openOrder.filter((oid) => oid !== id),
          }
        }
        if (maxOpen !== undefined) {
          const fixedCount = Object.values(colMetaRef.current).filter(
            (v) => !v
          ).length
          const allowedOpen = Math.max(0, maxOpen - fixedCount)
          if (prev.openOrder.length >= allowedOpen) {
            const lruId = prev.openOrder[0]
            return {
              collapsed: { ...prev.collapsed, [lruId]: true, [id]: false },
              openOrder: [...prev.openOrder.slice(1), id],
            }
          }
        }
        return {
          collapsed: { ...prev.collapsed, [id]: false },
          openOrder: [...prev.openOrder, id],
        }
      })
    },
    [maxOpen]
  )

  const addColumn = React.useCallback(
    (id: string, collapsible = true) => {
      colMetaRef.current[id] = collapsible
      if (!collapsible) return
      setState((prev) => {
        if (maxOpen !== undefined) {
          const fixedCount = Object.values(colMetaRef.current).filter(
            (v) => !v
          ).length
          const allowedOpen = Math.max(0, maxOpen - fixedCount)
          if (prev.openOrder.length >= allowedOpen) {
            const lruId = prev.openOrder[0]
            return {
              collapsed: { ...prev.collapsed, [lruId]: true },
              openOrder: [...prev.openOrder.slice(1), id],
            }
          }
        }
        return { ...prev, openOrder: [...prev.openOrder, id] }
      })
    },
    [maxOpen]
  )

  return (
    <KanbanBoardContext.Provider
      value={{ collapsed: state.collapsed, toggleColumn, addColumn }}
    >
      <KanbanBoardPrimitive
        data-slot="kanban-board"
        className={cn(boardVariants({ spacing }), className)}
        {...props}
      >
        {children}
      </KanbanBoardPrimitive>
    </KanbanBoardContext.Provider>
  )
}

export { KanbanBoard }
