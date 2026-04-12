"use client"

import * as React from "react"
import { mergeProps, useRender } from "@base-ui/react"
import { useDroppable } from "@dnd-kit/core"
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react"
import { cva } from "class-variance-authority"

import {
  KanbanColumnActionProps,
  KanbanColumnContentProps,
  KanbanColumnFooterProps,
  KanbanColumnHeaderProps,
  KanbanColumnProps,
  KanbanColumnTitleProps,
  KanbanColumnToggleProps,
} from "@/types/kanban-column"
import { cn } from "@/lib/utils"

import { useKanbanBoard } from "./kanban-board"

// ─────────────────────────────────────────────
// Variants
// ─────────────────────────────────────────────

const bodySpacing = cva("flex flex-1 flex-col overflow-hidden", {
  variants: {
    spacing: {
      none: "gap-0 p-0",
      sm: "gap-2 p-2",
      md: "gap-3 px-4 pb-4",
      lg: "gap-4 p-6",
    },
  },
  defaultVariants: {
    spacing: "md",
  },
})

const columnVariantClasses = cva(
  "relative flex w-80 flex-col rounded-full border transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-transparent bg-transparent",
        bordered: "border-border bg-muted/50 shadow-sm",
        borderBg: "border-border bg-background shadow-md",
      },
      collapsed: {
        true: "max-w-10 min-w-10",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      collapsed: false,
    },
  }
)

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

interface KanbanColumnContextValue {
  collapsed: boolean
  collapsible: boolean
  onToggle?: () => void
  cardCount?: number
}

const KanbanColumnContext = React.createContext<KanbanColumnContextValue>({
  collapsed: false,
  collapsible: true,
})

function useKanbanColumn() {
  return React.useContext(KanbanColumnContext)
}

// ─────────────────────────────────────────────
// CollapsedOverlay
// ─────────────────────────────────────────────

function KanbanColumnCollapsedOverlay({ cardCount }: { cardCount?: number }) {
  const { collapsed } = useKanbanColumn()
  const collapsedHeight = collapsed
    ? Math.max(40, (cardCount ?? 0) * 50)
    : undefined

  return (
    <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center">
      <div
        className="w-full rounded-full bg-linear-to-b from-muted from-50% transition-colors duration-200 group-hover/column:from-muted-foreground/25"
        style={{ height: `${collapsedHeight}px` }}
      />
      <div className="w-px flex-1 bg-border transition-colors duration-200 group-hover/column:bg-muted-foreground/25" />
    </div>
  )
}

// ─────────────────────────────────────────────
// ColumnPanel
// ─────────────────────────────────────────────

function KanbanColumnPrimitive({
  render,
  ...otherProps
}: Omit<KanbanColumnProps, "variant" | "collapsed" | "onToggle">) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({}, otherProps),
  })
}

function KanbanColumn({
  variant,
  id,
  collapsed: collapsedProp = false,
  collapsible = true,
  onToggle: onToggleProp,
  cardCount,
  className,
  children,
  ...props
}: KanbanColumnProps) {
  const boardCtx = useKanbanBoard()
  const collapsed =
    id !== undefined && boardCtx
      ? (boardCtx.collapsed[id] ?? false)
      : collapsedProp
  const onToggle =
    id !== undefined && boardCtx
      ? () => boardCtx.toggleColumn(id)
      : onToggleProp

  const dndEnabled = boardCtx?.dndEnabled ?? false
  const isOver = dndEnabled && id !== undefined && boardCtx?.overColumnId === id
  const isActive = dndEnabled && boardCtx?.activeCardId !== null

  const { setNodeRef } = useDroppable({ id: id ?? "" })

  return (
    <KanbanColumnContext.Provider
      value={{ collapsed, collapsible, onToggle, cardCount }}
    >
      <KanbanColumnPrimitive
        ref={dndEnabled && id ? setNodeRef : undefined}
        data-slot="column-panel"
        data-collapsed={collapsed}
        id={id}
        onClick={collapsed ? onToggle : undefined}
        className={cn(
          columnVariantClasses({ variant, collapsed }),
          isActive && isOver && "border-primary bg-primary/5",
          collapsed && "group/column cursor-pointer",
          className
        )}
        {...props}
      >
        {collapsed && <KanbanColumnCollapsedOverlay cardCount={cardCount} />}
        <div className="z-50">{children}</div>
      </KanbanColumnPrimitive>
    </KanbanColumnContext.Provider>
  )
}

// ─────────────────────────────────────────────
// ColumnHeader
// ─────────────────────────────────────────────

function KanbanColumnHeaderPrimitive({
  render,
  ...otherProps
}: KanbanColumnHeaderProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({}, otherProps),
  })
}

function KanbanColumnHeader({ className, ...props }: KanbanColumnHeaderProps) {
  const { collapsed } = useKanbanColumn()

  return (
    <KanbanColumnHeaderPrimitive
      data-slot="column-header"
      className={cn(
        collapsed
          ? "@container/column-header flex h-full flex-col items-center py-3"
          : "@container/column-header flex items-center justify-between p-4 pb-2",
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────
// ColumnContent
// ─────────────────────────────────────────────

function KanbanColumnContentPrimitive({
  render,
  ...otherProps
}: Omit<KanbanColumnContentProps, "spacing">) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({}, otherProps),
  })
}

function KanbanColumnContent({
  spacing = "md",
  className,
  ...props
}: KanbanColumnContentProps) {
  const { collapsed } = useKanbanColumn()

  return (
    <KanbanColumnContentPrimitive
      data-slot="column-content"
      className={cn(bodySpacing({ spacing }), collapsed && "hidden", className)}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────
// ColumnFooter
// ─────────────────────────────────────────────

function KanbanColumnFooterPrimitive({
  render,
  ...otherProps
}: KanbanColumnFooterProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({}, otherProps),
  })
}

function KanbanColumnFooter({ className, ...props }: KanbanColumnFooterProps) {
  return (
    <KanbanColumnFooterPrimitive
      data-slot="column-footer"
      className={cn(
        "@container/column-footer flex items-center justify-between p-4 pb-2",
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────
// ColumnTitle
// ─────────────────────────────────────────────

function KanbanColumnTitlePrimitive({
  render,
  ...otherProps
}: KanbanColumnTitleProps) {
  return useRender({
    defaultTagName: "h3",
    render,
    props: mergeProps<"h3">({}, otherProps),
  })
}

function KanbanColumnTitle({ className, ...props }: KanbanColumnTitleProps) {
  const { collapsed } = useKanbanColumn()

  return (
    <KanbanColumnTitlePrimitive
      data-slot="column-title"
      className={cn(
        collapsed
          ? "order-2 mt-2 text-sm font-semibold tracking-tight text-foreground [writing-mode:vertical-rl]"
          : "flex-1 truncate text-sm leading-none font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────
// ColumnAction
// ─────────────────────────────────────────────

function KanbanColumnActionPrimitive({
  render,
  ...otherProps
}: KanbanColumnActionProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({}, otherProps),
  })
}

function KanbanColumnAction({ className, ...props }: KanbanColumnActionProps) {
  return (
    <KanbanColumnActionPrimitive
      data-slot="column-action"
      className={cn("flex shrink-0 items-center gap-1", className)}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────
// ColumnToggle
// ─────────────────────────────────────────────

function KanbanColumnTogglePrimitive({
  render,
  onToggle,
  collapsed,
  ...otherProps
}: KanbanColumnToggleProps) {
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        type: "button",
        onClick: onToggle,
        "aria-label": collapsed ? "Expand column" : "Collapse column",
        "aria-expanded": !collapsed,
      },
      otherProps
    ),
  })
}

function KanbanColumnToggle({
  className,
  children,
  ...props
}: KanbanColumnToggleProps) {
  const { collapsed, collapsible, onToggle } = useKanbanColumn()
  if (!collapsible || collapsed) return null

  return (
    <KanbanColumnTogglePrimitive
      data-slot="column-toggle"
      collapsed={collapsed}
      onToggle={onToggle}
      className={cn(
        "inline-flex items-center justify-center rounded-md",
        "h-6 w-6 text-muted-foreground",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
        "transition-colors",
        className
      )}
      {...props}
    >
      {children ??
        (collapsed ? (
          <CaretRightIcon className="h-4 w-4" />
        ) : (
          <CaretLeftIcon className="h-4 w-4" />
        ))}
    </KanbanColumnTogglePrimitive>
  )
}

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────

export {
  KanbanColumn,
  KanbanColumnHeader,
  KanbanColumnTitle,
  KanbanColumnAction,
  KanbanColumnToggle,
  KanbanColumnContent,
  KanbanColumnFooter,
  useKanbanColumn,
}
