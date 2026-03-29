"use client"

import { cn } from "@/lib/utils"
import React from "react"

function ColumnPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="column-panel"
      className={cn(
        "min-h-56 max-w-2xs border border-dotted border-gray-50",
        className
      )}
      {...props}
    />
  )
}

function ColumnHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="column-header"
      className={cn(
        "flex items-center justify-between rounded-tl-lg rounded-tr-lg bg-gray-100 px-4 py-2 text-sm font-medium",
        className
      )}
      {...props}
    />
  )
}

function ColumnContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="column-content"
      className={cn("flex flex-col gap-4 p-4", className)}
      {...props}
    />
  )
}

function ColumnFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="column-footer"
      className={cn(
        "flex items-center justify-center rounded-br-lg rounded-bl-lg bg-gray-100 px-4 py-2 text-sm font-medium",
        className
      )}
      {...props}
    />
  )
}

function ColumnTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="column-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function ColumnAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="column-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function ColumnToggle({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="column-toggle"
      className={cn(
        "rounded-md p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-gray-100",
        className
      )}
      {...props}
    />
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
