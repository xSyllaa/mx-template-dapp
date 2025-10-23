"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "./button";
import { CustomCalendar } from "./CustomCalendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "../../lib/utils";

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  startDate?: Date;
  endDate?: Date;
  isStartDatePicker?: boolean;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Sélectionner une date",
  className,
  disabled = false,
  startDate,
  endDate,
  isStartDatePicker = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onDateChange(selectedDate);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-[var(--mvx-text-color-secondary)]",
            className
          )}
          style={{
            backgroundColor: 'var(--mvx-bg-color-secondary)',
            borderColor: 'var(--mvx-border-color-secondary)',
            color: 'var(--mvx-text-color-primary)',
          }}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0"
        align="start"
        side="bottom"
        sideOffset={4}
        style={{
          backgroundColor: 'var(--mvx-bg-color-secondary)',
          borderColor: 'var(--mvx-border-color-secondary)',
          color: 'var(--mvx-text-color-primary)',
        }}
      >
        <CustomCalendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          startDate={startDate}
          endDate={endDate}
          isStartDatePicker={isStartDatePicker}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
