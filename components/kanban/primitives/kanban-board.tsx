"use client"

import * as React from "react"
import { mergeProps, useRender } from "@base-ui/react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { cva, type VariantProps } from "class-variance-authority"

import {
  KanbanBoardColumnMeta,
  KanbanBoardContextValue,
  KanbanBoardProps,
} from "@/types/kanban-board"
import { cn } from "@/lib/utils"

const boardVariants = cva(
  "mx-auto flex h-screen max-w-7xl justify-center overflow-x-auto",
  {
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
  }
)

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
  dndEnabled: dndEnabledProp,
  onCardMove,
  onCardDragOver,
  onDragStart: onDragStartProp,
  onDragCancel: onDragCancelProp,
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

  const dndEnabled =
    dndEnabledProp ?? (onCardMove !== undefined || onCardDragOver !== undefined)

  // Track the original column of the dragged card (before any optimistic moves)
  const originalActiveColumnIdRef = React.useRef<string | null>(null)
  // Track which column was last entered — deduplicate onCardDragOver calls
  const overColumnIdRef = React.useRef<string | null>(null)

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
    originalActiveColumnIdRef.current =
      (event.active.data.current?.columnId as string | undefined) ?? null
    overColumnIdRef.current = null
    onDragStartProp?.()
    setDndState((prev) => ({ ...prev, activeCardId: cardId }))
  }

  function handleDragOver(event: DragOverEvent) {
    const overId = event.over?.id as string | undefined
    if (!overId) {
      setDndState((prev) => ({ ...prev, overColumnId: null }))
      overColumnIdRef.current = null
      return
    }
    const resolvedColumnId =
      (event.over?.data.current?.columnId as string | undefined) ?? overId
    setDndState((prev) => ({ ...prev, overColumnId: resolvedColumnId }))

    if (!onCardDragOver) return
    // Only fire when entering a new column (deduplicate hover events)
    if (overColumnIdRef.current === resolvedColumnId) return
    overColumnIdRef.current = resolvedColumnId

    const cardId = event.active.id as string
    const fromColumnId = event.active.data.current?.columnId as
      | string
      | undefined
    // Skip if same column — useSortable handles same-column preview natively
    if (!fromColumnId || fromColumnId === resolvedColumnId) return
    onCardDragOver(
      cardId,
      fromColumnId,
      resolvedColumnId,
      Number.MAX_SAFE_INTEGER
    )
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setDndState((prev) => ({
      ...prev,
      activeCardId: null,
      overColumnId: null,
    }))

    if (!over) {
      // Dropped on empty space — revert any optimistic moves
      originalActiveColumnIdRef.current = null
      overColumnIdRef.current = null
      onDragCancelProp?.()
      return
    }

    if (!onCardMove) return

    const cardId = active.id as string
    // Use live data: after optimistic moves this reflects the card's current column
    const fromColumnId = active.data.current?.columnId as string | undefined
    const toColumnId =
      (over.data.current?.columnId as string | undefined) ?? (over.id as string)

    if (!fromColumnId || !toColumnId) return

    // Bypass same-column allowReorder check when the card was originally from a
    // different column (it was moved there optimistically via onCardDragOver)
    const originalFromColumnId = originalActiveColumnIdRef.current
    originalActiveColumnIdRef.current = null
    overColumnIdRef.current = null
    const wasOriginallyDifferentColumn =
      originalFromColumnId !== null && originalFromColumnId !== toColumnId

    if (
      !allowReorder &&
      fromColumnId === toColumnId &&
      !wasOriginallyDifferentColumn
    )
      return

    const overIndex =
      (over.data.current?.sortable?.index as number | undefined) ??
      Number.MAX_SAFE_INTEGER
    onCardMove(cardId, fromColumnId, toColumnId, overIndex)
  }

  function handleDragCancel() {
    originalActiveColumnIdRef.current = null
    overColumnIdRef.current = null
    onDragCancelProp?.()
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
      allowReorder,
    }),
    [
      state.collapsed,
      toggleColumn,
      addColumn,
      dndState.activeCardId,
      dndState.overColumnId,
      dndEnabled,
      allowReorder,
    ]
  )

  const board = (
    <KanbanBoardContext.Provider value={contextValue}>
      <KanbanBoardPrimitive
        data-slot="kanban-board"
        className={cn(
          boardVariants({ spacing }),
          "overflow-x-auto overflow-y-hidden",
          className
        )}
        {...props}
      >
        <div className="flex h-full min-w-max justify-center gap-[inherit]">
          {children}
        </div>
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
      collisionDetection={(args) => {
        // Prefer pointer-inside detection; fall back to rect overlap.
        // This ensures empty-space drops return null (no column match).
        const pointer = pointerWithin(args)
        if (pointer.length > 0) return pointer
        return rectIntersection(args)
      }}
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
