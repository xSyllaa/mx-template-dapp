"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check } from "lucide-react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "../../lib/utils";
import { TimePicker } from "./datetime-picker";

interface ThemeDateTimePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ThemeDateTimePicker({
  date,
  onDateChange,
  placeholder = "Sélectionner une date et heure",
  className,
  disabled = false,
}: ThemeDateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date | undefined>(date);

  // Update temp date when date prop changes
  React.useEffect(() => {
    setTempDate(date);
  }, [date]);

  const handleSelect = (newDay: Date | undefined) => {
    if (!newDay) return;
    
    if (!tempDate) {
      setTempDate(newDay);
      return;
    }
    
    // Preserve the time from the existing date
    const newDate = new Date(newDay);
    newDate.setHours(tempDate.getHours());
    newDate.setMinutes(tempDate.getMinutes());
    newDate.setSeconds(tempDate.getSeconds());
    
    setTempDate(newDate);
  };

  const handleTimeChange = (newDate: Date | undefined) => {
    if (newDate) {
      setTempDate(newDate);
    }
  };

  const handleConfirm = () => {
    onDateChange(tempDate);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempDate(date);
    setOpen(false);
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
          {date ? format(date, "dd/MM/yyyy HH:mm:ss") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 z-50"
        align="start"
        side="bottom"
        sideOffset={4}
        style={{
          backgroundColor: 'var(--mvx-bg-color-secondary)',
          borderColor: 'var(--mvx-border-color-secondary)',
          color: 'var(--mvx-text-color-primary)',
        }}
      >
        <Calendar
          mode="single"
          selected={tempDate}
          onSelect={handleSelect}
          initialFocus
        />
        <div className="p-3 border-t border-[var(--mvx-border-color-secondary)]">
          <TimePicker 
            setDate={handleTimeChange} 
            date={tempDate} 
          />
          <div className="flex gap-2 mt-3 pt-2 border-t border-[var(--mvx-border-color-secondary)]">
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="flex-1"
              style={{
                backgroundColor: 'var(--mvx-bg-color-primary)',
                borderColor: 'var(--mvx-border-color-secondary)',
                color: 'var(--mvx-text-color-primary)',
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              size="sm"
              className="flex-1"
              style={{
                backgroundColor: 'var(--mvx-text-accent-color)',
                color: 'white',
              }}
            >
              <Check className="w-4 h-4 mr-1" />
              Valider
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
