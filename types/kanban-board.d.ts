import { useRender } from "@base-ui/react";

export interface KanbanBoardProps extends useRender.ComponentProps<"div"> {
  spacing?: "none" | "sm" | "md" | "lg"
}