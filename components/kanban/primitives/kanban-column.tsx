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
  "flex w-80 flex-col rounded-lg border transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border bg-muted/50 shadow-sm",
        ghost: "border-transparent bg-transparent",
        bordered: "border-border bg-background shadow-md",
      },
      collapsed: {
        true: "max-w-15 min-w-15",
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

  const collapsedHeight = collapsed
    ? Math.max(120, (cardCount ?? 0) * 72 + 60)
    : undefined

  return (
    <KanbanColumnContext.Provider
      value={{ collapsed, collapsible, onToggle, cardCount }}
    >
      <KanbanColumnPrimitive
        ref={dndEnabled && id ? setNodeRef : undefined}
        data-slot="column-panel"
        data-collapsed={collapsed}
        id={id}
        className={cn(
          columnVariantClasses({ variant, collapsed }),
          isActive && isOver && "border-primary bg-primary/5",
          className
        )}
        style={
          collapsedHeight !== undefined
            ? { height: collapsedHeight }
            : undefined
        }
        {...props}
      >
        {children}
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
  const { collapsed, collapsible, onToggle } = useKanbanColumn()
  const isHeaderTrigger = collapsed && collapsible

  return (
    <KanbanColumnHeaderPrimitive
      data-slot="column-header"
      role={isHeaderTrigger ? "button" : undefined}
      tabIndex={isHeaderTrigger ? 0 : undefined}
      aria-expanded={isHeaderTrigger ? !collapsed : undefined}
      aria-label={isHeaderTrigger ? "Expand column" : undefined}
      onClick={isHeaderTrigger ? onToggle : undefined}
      onKeyDown={
        isHeaderTrigger
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onToggle?.()
            }
          : undefined
      }
      className={cn(
        collapsed
          ? "@container/column-header flex h-full flex-col-reverse items-center py-3"
          : "@container/column-header flex items-center justify-between p-4 pb-2",
        isHeaderTrigger && "cursor-pointer select-none",
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
          ? "mt-2 flex-1 text-sm font-semibold tracking-tight text-foreground [writing-mode:vertical-rl]"
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
