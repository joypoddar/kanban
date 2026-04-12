import React from "react"

// import { ColumnPanel } from "@/components/kanban/column"
import { KanbanBoardExample } from "@/components/kanban/board-example"

const Kanban = () => {
  return (
    <div className="mx-auto h-screen max-w-7xl p-8">
      {/* <ColumnPanel /> */}
      <KanbanBoardExample />
    </div>
  )
}

export default Kanban
