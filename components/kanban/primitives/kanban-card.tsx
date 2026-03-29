import { cn } from "@/lib/utils"
import {
  KanbanAddCardProps,
  KanbanCardDescriptionProps,
  KanbanCardFooterProps,
  KanbanCardHeaderProps,
  KanbanCardProps,
  KanbanCardTitleProps,
  KanbanBadgeProps,
  KanbanDropZoneProps,
  KanbanScrollAreaProps,
} from "@/types/kanban-card"
import { mergeProps, useRender } from "@base-ui/react"
import { PlusIcon } from "@phosphor-icons/react"
import { cva, type VariantProps } from "class-variance-authority"

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
    props: mergeProps<"div">({}, otherProps),
  })
}

function KanbanCard({
  variant,
  draggable = false,
  className,
  ...props
}: KanbanCardProps & VariantProps<typeof cardVariants>) {
  return (
    <KanbanCardPrimitive
      data-slot="kanban-card"
      draggable={draggable ?? false}
      className={cn(cardVariants({ variant, draggable }), className)}
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
    props: mergeProps<"div">({}, otherProps),
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
// KanbanScrollArea
// ─────────────────────────────────────────────

const scrollAreaVariants = cva(
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

function KanbanScrollAreaPrimitive({
  render,
  ...otherProps
}: Omit<KanbanScrollAreaProps, "axis">) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({}, otherProps),
  })
}

function KanbanScrollArea({
  axis,
  className,
  ...props
}: KanbanScrollAreaProps & VariantProps<typeof scrollAreaVariants>) {
  return (
    <KanbanScrollAreaPrimitive
      data-slot="kanban-scroll-area"
      className={cn(scrollAreaVariants({ axis }), className)}
      {...props}
    />
  )
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
  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-2 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        destructive: "bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
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
  return (
    <KanbanBadgePrimitive
      data-slot="kanban-badge"
      className={cn(badgeVariants({ variant }), className)}
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
  KanbanScrollArea,
  KanbanAddCard,
  KanbanBadge,
  KanbanDropZone,
}
