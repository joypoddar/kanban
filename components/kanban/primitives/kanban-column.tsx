"use client"

import * as React from "react"
import { mergeProps, useRender } from "@base-ui/react"
import { Menu } from "@base-ui/react/menu"
import { Popover } from "@base-ui/react/popover"
import { useDroppable } from "@dnd-kit/core"
import {
  CaretLeftIcon,
  CaretRightIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react"
import { cva } from "class-variance-authority"

import {
  KanbanColumnActionProps,
  KanbanColumnContentProps,
  KanbanColumnDeleteDialogProps,
  KanbanColumnEditPopoverProps,
  KanbanColumnFooterProps,
  KanbanColumnHeaderProps,
  KanbanColumnMenuControllerProps,
  KanbanColumnMenuProps,
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

const columnVariantClasses = cva("relative flex w-80 flex-col border", {
  variants: {
    variant: {
      default: "border-transparent bg-transparent",
      bordered: "border-border bg-muted/50 shadow-sm",
      borderBg: "border-border bg-background shadow-md",
    },
    collapsed: {
      true: "max-w-10 min-w-10 rounded-full",
      false: "rounded-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    collapsed: false,
  },
})

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

interface KanbanColumnContextValue {
  collapsed: boolean
  collapsible: boolean
  onToggle?: () => void
  cardCount?: number
  editable: boolean
  color?: string
}

const KanbanColumnContext = React.createContext<KanbanColumnContextValue>({
  collapsed: false,
  collapsible: true,
  editable: true,
})

function useKanbanColumn() {
  return React.useContext(KanbanColumnContext)
}

// ─────────────────────────────────────────────
// CollapsedOverlay
// ─────────────────────────────────────────────

function KanbanColumnCollapsedOverlay({ cardCount }: { cardCount?: number }) {
  const { collapsed, color } = useKanbanColumn()
  const collapsedHeight = collapsed
    ? Math.max(40, (cardCount ?? 0) * 50)
    : undefined

  return (
    <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center">
      <div
        className={cn(
          "w-full rounded-full from-50% transition-colors duration-200",
          !color &&
            "bg-linear-to-b from-muted group-hover/column:from-muted-foreground/25"
        )}
        style={{
          height: `${collapsedHeight}px`,
          ...(color && {
            background: `linear-gradient(to bottom, ${color} 50%, transparent)`,
            opacity: 0.65,
          }),
        }}
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
  editable = true,
  color,
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
      value={{ collapsed, collapsible, onToggle, cardCount, editable, color }}
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
        style={
          color
            ? ({ "--column-color": color } as React.CSSProperties)
            : undefined
        }
        {...props}
      >
        {collapsed && <KanbanColumnCollapsedOverlay cardCount={cardCount} />}
        {!collapsed && color && (
          <div
            aria-hidden
            className="h-1 w-full shrink-0 rounded-t-lg bg-(--column-color)"
          />
        )}
        <div className="relative z-10">{children}</div>
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
          : "group/header @container/column-header relative flex items-center justify-center p-4 pb-2",
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
  const { collapsed, collapsible, onToggle } = useKanbanColumn()

  return (
    <KanbanColumnTitlePrimitive
      data-slot="column-title"
      onClick={!collapsed && collapsible ? onToggle : undefined}
      className={cn(
        collapsed
          ? "order-2 mt-2 text-sm font-semibold tracking-tight text-foreground [writing-mode:vertical-rl]"
          : "truncate text-center text-sm leading-none font-semibold tracking-tight text-foreground",
        !collapsed && collapsible && "cursor-pointer",
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
        "size-5 text-muted-foreground",
        "opacity-0 group-hover/header:opacity-100",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
        "transition-all duration-200",
        className
      )}
      {...props}
    >
      {children ??
        (collapsed ? (
          <CaretRightIcon className="size-4" />
        ) : (
          <CaretLeftIcon className="size-4" />
        ))}
    </KanbanColumnTogglePrimitive>
  )
}

// ─────────────────────────────────────────────
// ColumnMenu
// ─────────────────────────────────────────────

function KanbanColumnMenu({
  onEdit,
  onMoveLeft,
  onMoveRight,
  onDelete,
  canMoveLeft = true,
  canMoveRight = true,
}: KanbanColumnMenuProps) {
  const { collapsed, editable } = useKanbanColumn()
  if (!editable || collapsed) return null

  return (
    <Menu.Root>
      <Menu.Trigger
        className={cn(
          "inline-flex items-center justify-center rounded-md",
          "size-5 text-muted-foreground",
          "opacity-0 group-hover/header:opacity-100",
          "hover:bg-muted hover:text-foreground",
          "focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
          "transition-all duration-200"
        )}
        aria-label="Column actions"
      >
        <DotsThreeIcon weight="bold" className="size-4" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={4} align="start" className="z-50">
          <Menu.Popup
            className={cn(
              "min-w-44 overflow-hidden rounded-lg border border-border",
              "bg-popover p-1 text-popover-foreground shadow-md",
              "data-ending-style:opacity-0 data-starting-style:opacity-0",
              "transition-opacity duration-150"
            )}
          >
            <Menu.Item
              onClick={onEdit}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5",
                "text-sm text-foreground outline-none",
                "data-highlighted:bg-accent data-highlighted:text-accent-foreground"
              )}
            >
              <PencilSimpleIcon className="size-3.5" />
              Edit column
            </Menu.Item>
            <Menu.Item
              onClick={onMoveLeft}
              disabled={!canMoveLeft}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5",
                "text-sm text-foreground outline-none",
                "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                "data-disabled:cursor-default data-disabled:opacity-40"
              )}
            >
              <CaretLeftIcon className="size-3.5" />
              Move to the left
            </Menu.Item>
            <Menu.Item
              onClick={onMoveRight}
              disabled={!canMoveRight}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5",
                "text-sm text-foreground outline-none",
                "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                "data-disabled:cursor-default data-disabled:opacity-40"
              )}
            >
              <CaretRightIcon className="size-3.5" />
              Move to the right
            </Menu.Item>
            <Menu.Separator className="my-1 h-px bg-border" />
            <Menu.Item
              onClick={onDelete}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5",
                "text-sm text-destructive outline-none",
                "data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
              )}
            >
              <TrashIcon className="size-3.5" />
              Delete column
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

// ─────────────────────────────────────────────
// ColumnDeleteDialog
// ─────────────────────────────────────────────

function KanbanColumnDeleteDialog({
  open,
  onOpenChange,
  columnTitle,
  onConfirm,
}: KanbanColumnDeleteDialogProps) {
  return (
    <dialog
      open={open}
      aria-modal
      className={cn(
        "fixed inset-0 z-50 m-auto h-fit w-80 rounded-lg border border-border",
        "bg-popover p-5 text-popover-foreground shadow-xl",
        "backdrop:bg-black/50"
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false)
      }}
    >
      <h2 className="mb-1 text-sm font-semibold text-foreground">
        Delete &ldquo;{columnTitle}&rdquo;?
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">
        All cards will be moved to Uncategorized.
      </p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium",
            "border border-border text-foreground",
            "transition-colors hover:bg-muted"
          )}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm()
            onOpenChange(false)
          }}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium",
            "text-destructive-foreground bg-destructive",
            "transition-colors hover:bg-destructive/90"
          )}
        >
          Delete
        </button>
      </div>
    </dialog>
  )
}

// ─────────────────────────────────────────────
// ColumnEditPopover
// ─────────────────────────────────────────────

const PRESET_COLORS = [
  "var(--kanban-color-1)",
  "var(--kanban-color-2)",
  "var(--kanban-color-3)",
  "var(--kanban-color-4)",
  "var(--kanban-color-5)",
  "var(--kanban-color-6)",
  "var(--kanban-color-7)",
  "var(--kanban-color-8)",
]

function KanbanColumnEditPopover({
  open,
  onOpenChange,
  defaultName = "",
  defaultColor = PRESET_COLORS[0],
  onSave,
}: KanbanColumnEditPopoverProps) {
  const [name, setName] = React.useState(defaultName)
  const [color, setColor] = React.useState(defaultColor)

  // Sync when popover opens with new defaults
  React.useEffect(() => {
    if (open) {
      setName(defaultName)
      setColor(defaultColor)
    }
  }, [open, defaultName, defaultColor])

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      {/* Invisible trigger — opened imperatively from the menu */}
      <Popover.Trigger
        aria-hidden
        className="pointer-events-none absolute size-0 overflow-hidden"
      />
      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          className="isolate z-50"
        >
          <Popover.Popup
            className={cn(
              "flex w-56 flex-col gap-2.5 rounded-lg p-3",
              "bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10",
              "origin-(--transform-origin) duration-100",
              "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
              "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
            )}
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  onSave(name.trim(), color)
                  onOpenChange(false)
                }
                if (e.key === "Escape") onOpenChange(false)
              }}
              placeholder="Column name"
              autoFocus
              className={cn(
                "w-full rounded-md border border-border bg-background",
                "px-2.5 py-1.5 text-sm text-foreground",
                "placeholder:text-muted-foreground",
                "focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none",
                "transition-colors"
              )}
            />
            <div className="grid grid-cols-4 gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={c}
                  className={cn(
                    "h-8 w-full rounded-md transition-transform hover:scale-110",
                    color === c &&
                      "ring-2 ring-white ring-offset-1 ring-offset-popover"
                  )}
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      className="mx-auto size-3 text-white drop-shadow"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!name.trim()}
              onClick={() => {
                if (name.trim()) {
                  onSave(name.trim(), color)
                  onOpenChange(false)
                }
              }}
              className={cn(
                "w-full rounded-md px-3 py-1.5 text-sm font-medium",
                "bg-primary text-primary-foreground",
                "transition-colors hover:bg-primary/90",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              Save changes
            </button>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

// ─────────────────────────────────────────────
// ColumnMenuController
// Composes Menu + EditPopover + DeleteDialog with internal open state.
// Reads editable/collapsed from KanbanColumnContext — renders nothing
// when the column is not editable or is collapsed.
// ─────────────────────────────────────────────

function KanbanColumnMenuController({
  defaultName,
  defaultColor,
  onRename,
  onMoveLeft,
  onMoveRight,
  onDelete,
  canMoveLeft = true,
  canMoveRight = true,
}: KanbanColumnMenuControllerProps) {
  const { editable, collapsed } = useKanbanColumn()
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  if (!editable || collapsed) return null

  return (
    <>
      <KanbanColumnMenu
        onEdit={() => setEditOpen(true)}
        onMoveLeft={onMoveLeft}
        onMoveRight={onMoveRight}
        onDelete={onDelete ? () => setDeleteOpen(true) : undefined}
        canMoveLeft={canMoveLeft}
        canMoveRight={canMoveRight}
      />
      <KanbanColumnEditPopover
        open={editOpen}
        onOpenChange={setEditOpen}
        defaultName={defaultName}
        defaultColor={defaultColor}
        onSave={onRename}
      />
      {onDelete && (
        <KanbanColumnDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          columnTitle={defaultName}
          onConfirm={onDelete}
        />
      )}
    </>
  )
}

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────

export {
  KanbanColumn,
  KanbanColumnAction,
  KanbanColumnContent,
  KanbanColumnDeleteDialog,
  KanbanColumnEditPopover,
  KanbanColumnFooter,
  KanbanColumnHeader,
  KanbanColumnMenu,
  KanbanColumnMenuController,
  KanbanColumnTitle,
  KanbanColumnToggle,
  useKanbanColumn,
}
