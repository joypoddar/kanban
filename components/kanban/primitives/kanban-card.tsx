"use client"

import * as React from "react"
import { mergeProps, useRender } from "@base-ui/react"
import {
  SortableContext,
  SortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { PlusIcon } from "@phosphor-icons/react"
import { cva, type VariantProps } from "class-variance-authority"

import {
  KanbanAddCardProps,
  KanbanBadgeProps,
  KanbanCardDescriptionProps,
  KanbanCardFooterProps,
  KanbanCardHeaderProps,
  KanbanCardListProps,
  KanbanCardProps,
  KanbanCardTitleProps,
  KanbanDropZoneProps,
} from "@/types/kanban-card"
import { cn } from "@/lib/utils"

import { useKanbanBoard } from "./kanban-board"
import { useKanbanColumn } from "./kanban-column"

// ─────────────────────────────────────────────
// KanbanScrollContext — provides columnId to child cards
// ─────────────────────────────────────────────

const KanbanScrollContext = React.createContext<string | null>(null)

// ─────────────────────────────────────────────
// KanbanCard
// ─────────────────────────────────────────────

const cardVariants = cva(
  "cursor-pointer rounded-lg border p-3 transition-all duration-200 select-none",
  {
    variants: {
      variant: {
        default: "border-border bg-card shadow-sm hover:shadow-md",
        ghost: "border-transparent bg-transparent hover:bg-muted/50",
        outlined: "border-border bg-background hover:border-foreground/20",
      },
      draggable: {
        true: "cursor-grab active:cursor-grabbing",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      draggable: false,
    },
  }
)

function KanbanCardPrimitive({
  render,
  ...otherProps
}: Omit<KanbanCardProps, "variant">) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ suppressHydrationWarning: true }, otherProps),
  })
}

function KanbanCard({
  id,
  variant,
  draggable = false,
  className,
  style,
  ...props
}: KanbanCardProps & VariantProps<typeof cardVariants>) {
  const boardCtx = useKanbanBoard()
  const columnCtx = useKanbanColumn()
  const columnId = React.useContext(KanbanScrollContext)
  const dndEnabled = boardCtx?.dndEnabled ?? false
  const sortableEnabled =
    draggable && dndEnabled && !!id && !!columnId && !columnCtx.collapsed

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id ?? "__disabled__",
    disabled: !sortableEnabled,
    data: { columnId },
  })

  const sortableStyle: React.CSSProperties = sortableEnabled
    ? { transform: CSS.Transform.toString(transform), transition }
    : {}

  return (
    <KanbanCardPrimitive
      ref={sortableEnabled ? setNodeRef : undefined}
      data-slot="kanban-card"
      draggable={!dndEnabled && draggable}
      className={cn(
        cardVariants({ variant, draggable }),
        sortableEnabled && isDragging && "opacity-50",
        className
      )}
      style={{ ...sortableStyle, ...style }}
      {...(sortableEnabled ? attributes : {})}
      {...(sortableEnabled ? listeners : {})}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────
// KanbanCardHeader
// ─────────────────────────────────────────────

function KanbanCardHeaderPrimitive({
  render,
  ...otherProps
}: KanbanCardHeaderProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ suppressHydrationWarning: true }, otherProps),
  })
}

function KanbanCardHeader({ className, ...props }: KanbanCardHeaderProps) {
  return (
    <KanbanCardHeaderPrimitive
      data-slot="kanban-card-header"
      className={cn("mb-2 flex items-start justify-between gap-2", className)}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────
// KanbanCardTitle
// ─────────────────────────────────────────────

function KanbanCardTitlePrimitive({
  render,
  ...otherProps
}: KanbanCardTitleProps) {
  return useRender({
    defaultTagName: "h4",
    render,
    props: mergeProps<"h4">({}, otherProps),
  })
}

function KanbanCardTitle({ className, ...props }: KanbanCardTitleProps) {
  return (
    <KanbanCardTitlePrimitive
      data-slot="kanban-card-title"
      className={cn(
        "text-sm leading-none font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────
// KanbanCardDescription
// ─────────────────────────────────────────────

function KanbanCardDescriptionPrimitive({
  render,
  ...otherProps
}: KanbanCardDescriptionProps) {
  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">({}, otherProps),
  })
}

function KanbanCardDescription({
  className,
  ...props
}: KanbanCardDescriptionProps) {
  return (
    <KanbanCardDescriptionPrimitive
      data-slot="kanban-card-description"
      className={cn("line-clamp-2 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────
// KanbanCardFooter
// ─────────────────────────────────────────────

function KanbanCardFooterPrimitive({
  render,
  ...otherProps
}: KanbanCardFooterProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({}, otherProps),
  })
}

function KanbanCardFooter({ className, ...props }: KanbanCardFooterProps) {
  return (
    <KanbanCardFooterPrimitive
      data-slot="kanban-card-footer"
      className={cn("mt-3 flex items-center justify-between gap-2", className)}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────
// KanbanCardList
// ─────────────────────────────────────────────

const kanbanCardListVariants = cva(
  "scrollbar-thin flex-1 space-y-2 scrollbar-thumb-border scrollbar-track-transparent",
  {
    variants: {
      axis: {
        vertical: "overflow-x-hidden overflow-y-auto",
        horizontal: "overflow-x-auto overflow-y-hidden",
        both: "overflow-auto",
      },
    },
    defaultVariants: {
      axis: "vertical",
    },
  }
)

// Keeps every item in place — used when allowReorder is false and the active
// card is being dragged within its own column.
const noopSortingStrategy: SortingStrategy = () => null

function KanbanCardListPrimitive({
  render,
  ...otherProps
}: Omit<KanbanCardListProps, "axis" | "items" | "columnId">) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({}, otherProps),
  })
}

function KanbanCardList({
  axis,
  items,
  columnId,
  className,
  ...props
}: KanbanCardListProps & VariantProps<typeof kanbanCardListVariants>) {
  const boardCtx = useKanbanBoard()
  const columnCtx = useKanbanColumn()
  const dndEnabled = boardCtx?.dndEnabled ?? false
  const allowReorder = boardCtx?.allowReorder ?? true
  const activeCardId = boardCtx?.activeCardId ?? null
  const isCollapsed = columnCtx.collapsed

  // Suppress the sorting animation when reorder is disabled and the dragged
  // card belongs to this same column (it can still be dropped into other columns).
  const isActiveSameColumn =
    !allowReorder && !!activeCardId && !!items && items.includes(activeCardId)
  const strategy = isActiveSameColumn
    ? noopSortingStrategy
    : verticalListSortingStrategy

  // When collapsed, skip SortableContext entirely — the column's useDroppable
  // acts as the sole drop target and cards always land at the end of the list.
  // This avoids zero-rect measurements from display:none items causing the
  // drag overlay to animate toward the top-left corner.
  const sortableActive = dndEnabled && !!items && !!columnId && !isCollapsed

  const scrollEl = (
    <KanbanScrollContext.Provider value={columnId ?? null}>
      <KanbanCardListPrimitive
        data-slot="kanban-scroll-area"
        className={cn(kanbanCardListVariants({ axis }), className)}
        {...props}
      />
    </KanbanScrollContext.Provider>
  )

  if (sortableActive) {
    return (
      <SortableContext items={items!} strategy={strategy}>
        {scrollEl}
      </SortableContext>
    )
  }

  return scrollEl
}

// ─────────────────────────────────────────────
// KanbanAddCard
// ─────────────────────────────────────────────

const addCardVariants = cva(
  "mt-2 flex w-full items-center gap-2 rounded-lg border p-3 text-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
  {
    variants: {
      variant: {
        dashed:
          "border-dashed border-border text-muted-foreground hover:border-foreground/20 hover:bg-muted hover:text-foreground",
        solid: "border-border bg-muted text-foreground hover:bg-muted/80",
        ghost:
          "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
      },
    },
    defaultVariants: {
      variant: "dashed",
    },
  }
)

function KanbanAddCardPrimitive({ render, ...otherProps }: KanbanAddCardProps) {
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">({ type: "button" }, otherProps),
  })
}

function KanbanAddCard({
  variant,
  className,
  children,
  ...props
}: KanbanAddCardProps & VariantProps<typeof addCardVariants>) {
  return (
    <KanbanAddCardPrimitive
      data-slot="kanban-add-card"
      className={cn(addCardVariants({ variant }), className)}
      {...props}
    >
      {children ?? (
        <>
          <PlusIcon className="h-4 w-4" />
          <span>Add card</span>
        </>
      )}
    </KanbanAddCardPrimitive>
  )
}

// ─────────────────────────────────────────────
// KanbanBadge
// ─────────────────────────────────────────────

const badgeVariants = cva(
  "inline-flex size-5 items-center justify-center rounded-full px-2 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        destructive: "bg-destructive/10 text-destructive",
      },
      collapsed: {
        true: "bg-transparent text-muted-foreground",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      collapsed: false,
    },
  }
)

function KanbanBadgePrimitive({ render, ...otherProps }: KanbanBadgeProps) {
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({}, otherProps),
  })
}

function KanbanBadge({
  variant,
  className,
  ...props
}: KanbanBadgeProps & VariantProps<typeof badgeVariants>) {
  const { collapsed } = useKanbanColumn()

  return (
    <KanbanBadgePrimitive
      data-slot="kanban-badge"
      className={cn(badgeVariants({ variant, collapsed }), className)}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────
// KanbanDropZone
// ─────────────────────────────────────────────

const dropZoneVariants = cva(
  "flex h-20 items-center justify-center rounded-lg border-2 border-dashed transition-colors",
  {
    variants: {
      active: {
        true: "border-primary bg-primary/10 text-primary",
        false: "border-primary/50 bg-primary/5 text-muted-foreground",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
)

function KanbanDropZonePrimitive({
  render,
  ...otherProps
}: KanbanDropZoneProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({}, otherProps),
  })
}

function KanbanDropZone({
  active,
  className,
  children,
  ...props
}: KanbanDropZoneProps & VariantProps<typeof dropZoneVariants>) {
  return (
    <KanbanDropZonePrimitive
      data-slot="kanban-drop-zone"
      className={cn(dropZoneVariants({ active }), className)}
      {...props}
    >
      {children ?? <span className="text-xs">Drop here</span>}
    </KanbanDropZonePrimitive>
  )
}

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────

export {
  KanbanCard,
  KanbanCardHeader,
  KanbanCardTitle,
  KanbanCardDescription,
  KanbanCardFooter,
  KanbanCardList,
  KanbanAddCard,
  KanbanBadge,
  KanbanDropZone,
}
