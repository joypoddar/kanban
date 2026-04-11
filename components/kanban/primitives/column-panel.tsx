"use client"

import { cn } from "@/lib/utils"
import {
  ColumnActionProps,
  ColumnContentProps,
  ColumnFooterProps,
  ColumnHeaderProps,
  ColumnPanelProps,
  ColumnTitleProps,
  ColumnToggleProps,
} from "@/types/column-panel"
import { useDroppable } from "@dnd-kit/core"
import { mergeProps, useRender } from "@base-ui/react"
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react"
import { cva } from "class-variance-authority"
import * as React from "react"
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

interface ColumnPanelContextValue {
  collapsed: boolean
  collapsible: boolean
  onToggle?: () => void
  cardCount?: number
}

const ColumnPanelContext = React.createContext<ColumnPanelContextValue>({
  collapsed: false,
  collapsible: true,
})

function useColumnToggle() {
  return React.useContext(ColumnPanelContext)
}

// ─────────────────────────────────────────────
// ColumnPanel
// ─────────────────────────────────────────────

function ColumnPanelPrimitive({
  render,
  ...otherProps
}: Omit<ColumnPanelProps, "variant" | "collapsed" | "onToggle">) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({}, otherProps),
  })
}

function ColumnPanel({
  variant,
  id,
  collapsed: collapsedProp = false,
  collapsible = true,
  onToggle: onToggleProp,
  cardCount,
  className,
  children,
  ...props
}: ColumnPanelProps) {
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
    <ColumnPanelContext.Provider value={{ collapsed, collapsible, onToggle, cardCount }}>
      <ColumnPanelPrimitive
        ref={dndEnabled && id ? setNodeRef : undefined}
        data-slot="column-panel"
        data-collapsed={collapsed}
        id={id}
        className={cn(
          columnVariantClasses({ variant, collapsed }),
          isActive && isOver && !collapsed && "ring-2 ring-primary/30",
          className
        )}
        style={collapsedHeight !== undefined ? { height: collapsedHeight } : undefined}
        {...props}
      >
        {children}
      </ColumnPanelPrimitive>
    </ColumnPanelContext.Provider>
  )
}

// ─────────────────────────────────────────────
// ColumnHeader
// ─────────────────────────────────────────────

function ColumnHeaderPrimitive({ render, ...otherProps }: ColumnHeaderProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({}, otherProps),
  })
}

function ColumnHeader({ className, ...props }: ColumnHeaderProps) {
  const { collapsed, collapsible, onToggle } = useColumnToggle()
  const isHeaderTrigger = collapsed && collapsible

  return (
    <ColumnHeaderPrimitive
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

function ColumnContentPrimitive({
  render,
  ...otherProps
}: Omit<ColumnContentProps, "spacing">) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({}, otherProps),
  })
}

function ColumnContent({
  spacing = "md",
  className,
  ...props
}: ColumnContentProps) {
  const { collapsed } = useColumnToggle()

  return (
    <ColumnContentPrimitive
      data-slot="column-content"
      className={cn(bodySpacing({ spacing }), collapsed && "hidden", className)}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────
// ColumnFooter
// ─────────────────────────────────────────────

function ColumnFooterPrimitive({ render, ...otherProps }: ColumnFooterProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({}, otherProps),
  })
}

function ColumnFooter({ className, ...props }: ColumnFooterProps) {
  return (
    <ColumnFooterPrimitive
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

function ColumnTitlePrimitive({ render, ...otherProps }: ColumnTitleProps) {
  return useRender({
    defaultTagName: "h3",
    render,
    props: mergeProps<"h3">({}, otherProps),
  })
}

function ColumnTitle({ className, ...props }: ColumnTitleProps) {
  const { collapsed } = useColumnToggle()

  return (
    <ColumnTitlePrimitive
      data-slot="column-title"
      className={cn(
        collapsed
          ? "flex-1 [writing-mode:vertical-rl] text-sm font-semibold tracking-tight text-foreground mt-2"
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

function ColumnActionPrimitive({ render, ...otherProps }: ColumnActionProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({}, otherProps),
  })
}

function ColumnAction({ className, ...props }: ColumnActionProps) {
  return (
    <ColumnActionPrimitive
      data-slot="column-action"
      className={cn("flex shrink-0 items-center gap-1", className)}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────
// ColumnToggle
// ─────────────────────────────────────────────

function ColumnTogglePrimitive({
  render,
  onToggle,
  collapsed,
  ...otherProps
}: ColumnToggleProps) {
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

function ColumnToggle({ className, children, ...props }: ColumnToggleProps) {
  const { collapsed, collapsible, onToggle } = useColumnToggle()
  if (!collapsible || collapsed) return null

  return (
    <ColumnTogglePrimitive
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
    </ColumnTogglePrimitive>
  )
}

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────

export {
  ColumnPanel,
  ColumnHeader,
  ColumnTitle,
  ColumnAction,
  ColumnToggle,
  ColumnContent,
  ColumnFooter,
  useColumnToggle,
}
