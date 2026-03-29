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
// Variants
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

// ─────────────────────────────────────────────
// KanbanCard
// ─────────────────────────────────────────────

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

function KanbanScrollAreaPrimitive({
  render,
  ...otherProps
}: KanbanScrollAreaProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({}, otherProps),
  })
}

function KanbanScrollArea({ className, ...props }: KanbanScrollAreaProps) {
  return (
    <KanbanScrollAreaPrimitive
      data-slot="kanban-scroll-area"
      className={cn(
        "flex-1 overflow-x-hidden overflow-y-auto",
        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border",
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────
// KanbanAddCard
// ─────────────────────────────────────────────

function KanbanAddCardPrimitive({ render, ...otherProps }: KanbanAddCardProps) {
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">({ type: "button" }, otherProps),
  })
}

function KanbanAddCard({ className, children, ...props }: KanbanAddCardProps) {
  return (
    <KanbanAddCardPrimitive
      data-slot="kanban-add-card"
      className={cn(
        "mt-2 flex w-full items-center gap-2 p-3",
        "text-sm text-muted-foreground",
        "rounded-lg border border-dashed border-border",
        "hover:border-foreground/20 hover:bg-muted hover:text-foreground",
        "focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
        "transition-colors",
        className
      )}
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

function KanbanBadgePrimitive({ render, ...otherProps }: KanbanBadgeProps) {
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({}, otherProps),
  })
}

function KanbanBadge({ className, ...props }: KanbanBadgeProps) {
  return (
    <KanbanBadgePrimitive
      data-slot="kanban-badge"
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-full bg-muted px-2 py-1",
        "text-xs font-medium text-muted-foreground",
        "h-5 min-w-5",
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────
// KanbanDropZone
// ─────────────────────────────────────────────

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
  className,
  children,
  ...props
}: KanbanDropZoneProps) {
  return (
    <KanbanDropZonePrimitive
      data-slot="kanban-drop-zone"
      className={cn(
        "rounded-lg border-2 border-dashed border-primary/50",
        "flex h-20 items-center justify-center bg-primary/5",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-xs text-muted-foreground">Drop here</span>
      )}
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
