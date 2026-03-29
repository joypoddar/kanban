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
import { mergeProps, useRender } from "@base-ui/react"
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react"
import { cva } from "class-variance-authority"

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
  "flex w-full max-w-[320px] min-w-70 flex-col rounded-lg border transition-all duration-200",
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
// ColumnPanel
// ─────────────────────────────────────────────

function ColumnPanelPrimitive({
  render,
  ...otherProps
}: Omit<ColumnPanelProps, "variant" | "collapsed">) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({}, otherProps),
  })
}

function ColumnPanel({
  variant = "default",
  collapsed = false,
  className,
  ...props
}: ColumnPanelProps) {
  return (
    <ColumnPanelPrimitive
      data-slot="column-panel"
      data-collapsed={collapsed}
      className={cn(columnVariantClasses({ variant, collapsed }), className)}
      {...props}
    />
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
  return (
    <ColumnHeaderPrimitive
      data-slot="column-header"
      className={cn(
        "@container/column-header flex items-center justify-between p-4",
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
  return (
    <ColumnContentPrimitive
      data-slot="column-content"
      className={cn(bodySpacing({ spacing }), className)}
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
  return (
    <ColumnTitlePrimitive
      data-slot="column-title"
      className={cn(
        "flex-1 truncate text-sm leading-none font-semibold tracking-tight text-foreground",
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

function ColumnToggle({
  collapsed = false,
  className,
  children,
  onToggle,
  ...props
}: ColumnToggleProps) {
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

export {
  ColumnPanel,
  ColumnHeader,
  ColumnTitle,
  ColumnAction,
  ColumnToggle,
  ColumnContent,
  ColumnFooter,
}
