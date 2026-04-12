"use client"

import React from "react"

import { KanbanBoard } from "./primitives/kanban-board"
import {
  KanbanAddCard,
  KanbanBadge,
  KanbanCard,
  KanbanCardDescription,
  KanbanCardFooter,
  KanbanCardHeader,
  KanbanCardList,
  KanbanCardTitle,
  KanbanDropZone,
} from "./primitives/kanban-card"
import {
  KanbanColumn,
  KanbanColumnAction,
  KanbanColumnContent,
  KanbanColumnFooter,
  KanbanColumnHeader,
  KanbanColumnTitle,
  KanbanColumnToggle,
} from "./primitives/kanban-column"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Card = {
  id: string
  title: string
  description: string
  due: string
}

type Column = {
  id: string
  title: string
  variant: "default" | "ghost" | "bordered"
  collapsible?: boolean
  cards: Card[]
}

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    variant: "default" as const,
    cards: [
      {
        id: "1",
        title: "Design System",
        description: "Create a comprehensive design system for the new product",
        due: "Tomorrow",
      },
      {
        id: "2",
        title: "User Research",
        description:
          "Conduct user interviews and gather feedback from existing customers",
        due: "This week",
      },
      {
        id: "3",
        title: "Prototype",
        description: "Build an interactive prototype for the onboarding flow",
        due: "Next week",
      },
      {
        id: "4",
        title: "MVP Features",
        description:
          "Define and prioritize the minimum viable product features",
        due: "Next month",
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    variant: "bordered" as const,
    collapsible: false,
    cards: [
      {
        id: "5",
        title: "API Integration",
        description:
          "Connect frontend with backend services and handle error states",
        due: "Today",
      },
      {
        id: "6",
        title: "Auth Flow",
        description: "Implement OAuth2 login with Google and GitHub",
        due: "Today",
      },
    ],
  },

  {
    id: "done",
    title: "Done",
    variant: "bordered" as const,
    cards: [
      {
        id: "8",
        title: "Setup CI/CD",
        description: "Configure GitHub Actions for automated deployments",
        due: "Last week",
      },
      {
        id: "9",
        title: "Database Schema",
        description: "Design and migrate initial schema for users and projects",
        due: "Last week",
      },
    ],
  },
  {
    id: "review",
    title: "In Review",
    variant: "default" as const,
    cards: [
      {
        id: "7",
        title: "Landing Page",
        description: "Review copy and visual design before handoff",
        due: "Yesterday",
      },
    ],
  },
]

// ─────────────────────────────────────────────
// Example
// ─────────────────────────────────────────────

export function KanbanBoardExample() {
  const [columns, setColumns] = React.useState<Column[]>(initialColumns)

  // Saved before drag starts; restored on cancel/empty-space drop
  const columnsBeforeDragRef = React.useRef<Column[] | null>(null)

  function handleDragStart() {
    columnsBeforeDragRef.current = columns
  }

  function handleDragCancel() {
    if (columnsBeforeDragRef.current !== null) {
      setColumns(columnsBeforeDragRef.current)
      columnsBeforeDragRef.current = null
    }
  }

  // Used for both onCardDragOver (optimistic) and onCardMove (final).
  // Finds the card wherever it currently lives — safe after optimistic moves.
  function handleCardMove(
    cardId: string,
    _fromColumnId: string,
    toColumnId: string,
    newIndex: number
  ) {
    setColumns((prev) => {
      let card: Card | undefined
      let actualFrom = ""
      for (const col of prev) {
        const found = col.cards.find((c) => c.id === cardId)
        if (found) {
          card = found
          actualFrom = col.id
          break
        }
      }
      if (!card) return prev

      return prev.map((col) => {
        if (col.id === actualFrom && col.id === toColumnId) {
          // Same-column reorder
          const cards = col.cards.filter((c) => c.id !== cardId)
          const insertAt = Math.min(newIndex, cards.length)
          cards.splice(insertAt, 0, card!)
          return { ...col, cards }
        }
        if (col.id === actualFrom) {
          return { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
        }
        if (col.id === toColumnId) {
          const cards = [...col.cards]
          const insertAt = Math.min(newIndex, cards.length)
          cards.splice(insertAt, 0, card!)
          return { ...col, cards }
        }
        return col
      })
    })
  }

  function renderDragOverlay(activeCardId: string) {
    const card = columns
      .flatMap((c) => c.cards)
      .find((c) => c.id === activeCardId)
    if (!card) return null
    return (
      <KanbanCard className="rotate-2 shadow-xl">
        <KanbanCardHeader>
          <KanbanCardTitle>{card.title}</KanbanCardTitle>
        </KanbanCardHeader>
        <KanbanCardDescription>{card.description}</KanbanCardDescription>
        <KanbanCardFooter>
          <span className="text-xs text-muted-foreground">Due: {card.due}</span>
        </KanbanCardFooter>
      </KanbanCard>
    )
  }

  return (
    <KanbanBoard
      spacing="md"
      maxOpen={2}
      columns={columns.map((c) => ({ id: c.id, collapsible: c.collapsible }))}
      className="border border-dashed border-gray-100/20"
      onCardMove={handleCardMove}
      onCardDragOver={handleCardMove}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      allowReorder
      renderDragOverlay={renderDragOverlay}
    >
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          id={column.id}
          variant={column.variant}
          collapsible={column.collapsible ?? true}
          cardCount={column.cards.length}
        >
          <KanbanColumnHeader>
            <KanbanColumnTitle>{column.title}</KanbanColumnTitle>
            <KanbanColumnAction>
              <KanbanBadge>{column.cards.length}</KanbanBadge>
              <KanbanColumnToggle />
            </KanbanColumnAction>
          </KanbanColumnHeader>

          <KanbanColumnContent>
            <KanbanCardList
              columnId={column.id}
              items={column.cards.map((c) => c.id)}
            >
              {column.cards.map((card) => (
                <KanbanCard key={card.id} id={card.id} draggable>
                  <KanbanCardHeader>
                    <KanbanCardTitle>{card.title}</KanbanCardTitle>
                  </KanbanCardHeader>
                  <KanbanCardDescription>
                    {card.description}
                  </KanbanCardDescription>
                  <KanbanCardFooter>
                    <span className="text-xs text-muted-foreground">
                      Due: {card.due}
                    </span>
                  </KanbanCardFooter>
                </KanbanCard>
              ))}

              {column.id === "in-progress" && <KanbanDropZone />}
            </KanbanCardList>

            <KanbanColumnFooter>
              <KanbanAddCard onClick={() => {}} />
            </KanbanColumnFooter>
          </KanbanColumnContent>
        </KanbanColumn>
      ))}
    </KanbanBoard>
  )
}
