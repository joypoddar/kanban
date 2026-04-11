"use client"

import { cn } from "@/lib/utils"
import {
  KanbanBoardColumnMeta,
  KanbanBoardContextValue,
  KanbanBoardProps,
} from "@/types/kanban-board"
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
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
// DnD helpers
// ─────────────────────────────────────────────

interface DndState {
  activeCardId: string | null
  overColumnId: string | null
}

const DRAG_ACTIVATION_DISTANCE = 8

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
  onCardMove,
  allowReorder = false,
  renderDragOverlay,
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

  const [dndState, setDndState] = React.useState<DndState>({
    activeCardId: null,
    overColumnId: null,
  })

  const dndEnabled = onCardMove !== undefined

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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

  function handleDragStart(event: DragStartEvent) {
    const cardId = event.active.id as string
    setDndState((prev) => ({ ...prev, activeCardId: cardId }))
  }

  function handleDragOver(event: DragOverEvent) {
    const overId = event.over?.id as string | undefined
    if (!overId) {
      setDndState((prev) => ({ ...prev, overColumnId: null }))
      return
    }
    // Resolve to column: if hovering a card, use its columnId data; else overId is a column
    const resolvedColumnId =
      (event.over?.data.current?.columnId as string | undefined) ?? overId
    setDndState((prev) => ({ ...prev, overColumnId: resolvedColumnId }))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setDndState((prev) => ({
      ...prev,
      activeCardId: null,
      overColumnId: null,
    }))

    if (!over || !onCardMove) return

    const cardId = active.id as string
    const fromColumnId = active.data.current?.columnId as string | undefined
    const toColumnId =
      (over.data.current?.columnId as string | undefined) ?? (over.id as string)

    if (!fromColumnId || !toColumnId) return
    if (!allowReorder && fromColumnId === toColumnId) return

    const overIndex =
      (over.data.current?.sortable?.index as number | undefined) ?? 0
    onCardMove(cardId, fromColumnId, toColumnId, overIndex)
  }

  function handleDragCancel() {
    setDndState((prev) => ({
      ...prev,
      activeCardId: null,
      overColumnId: null,
    }))
  }

  const contextValue = React.useMemo<KanbanBoardContextValue>(
    () => ({
      collapsed: state.collapsed,
      toggleColumn,
      addColumn,
      activeCardId: dndState.activeCardId,
      overColumnId: dndState.overColumnId,
      dndEnabled,
    }),
    [
      state.collapsed,
      toggleColumn,
      addColumn,
      dndState.activeCardId,
      dndState.overColumnId,
      dndEnabled,
    ]
  )

  const board = (
    <KanbanBoardContext.Provider value={contextValue}>
      <KanbanBoardPrimitive
        data-slot="kanban-board"
        className={cn(boardVariants({ spacing }), className)}
        {...props}
      >
        {children}
      </KanbanBoardPrimitive>
      {dndEnabled && (
        <DragOverlay>
          {dndState.activeCardId
            ? (renderDragOverlay?.(dndState.activeCardId) ?? null)
            : null}
        </DragOverlay>
      )}
    </KanbanBoardContext.Provider>
  )

  if (!dndEnabled) return board

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {board}
    </DndContext>
  )
}

export { KanbanBoard }
