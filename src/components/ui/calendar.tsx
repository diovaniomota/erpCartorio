"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: "rounded-md border bg-card",
        months: "flex flex-col gap-4",
        month: "space-y-4",
        caption_label: "text-sm font-medium",
        button_next: "rounded-md border p-1 hover:bg-muted",
        button_previous: "rounded-md border p-1 hover:bg-muted",
        day: "h-9 w-9 rounded-md text-sm hover:bg-muted",
        selected: "bg-primary text-primary-foreground hover:bg-primary",
        today: "bg-accent text-accent-foreground",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
