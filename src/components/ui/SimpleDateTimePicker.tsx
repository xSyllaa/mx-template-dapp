"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "../../lib/utils";

interface SimpleDateTimePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SimpleDateTimePicker({
  date,
  onDateChange,
  placeholder = "Sélectionner une date et heure",
  className,
  disabled = false,
}: SimpleDateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [hours, setHours] = React.useState<string>("00");
  const [minutes, setMinutes] = React.useState<string>("00");
  const [seconds, setSeconds] = React.useState<string>("00");

  // Initialize time values when date changes
  React.useEffect(() => {
    if (date) {
      setSelectedDate(date);
      setHours(date.getHours().toString().padStart(2, "0"));
      setMinutes(date.getMinutes().toString().padStart(2, "0"));
      setSeconds(date.getSeconds().toString().padStart(2, "0"));
    }
  }, [date]);

  const handleDateSelect = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
  };

  const handleTimeChange = (field: "hours" | "minutes" | "seconds", value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;

    let clampedValue = numValue;
    switch (field) {
      case "hours":
        clampedValue = Math.max(0, Math.min(23, numValue));
        setHours(clampedValue.toString().padStart(2, "0"));
        break;
      case "minutes":
        clampedValue = Math.max(0, Math.min(59, numValue));
        setMinutes(clampedValue.toString().padStart(2, "0"));
        break;
      case "seconds":
        clampedValue = Math.max(0, Math.min(59, numValue));
        setSeconds(clampedValue.toString().padStart(2, "0"));
        break;
    }
  };

  const handleConfirm = () => {
    if (selectedDate) {
      const finalDate = new Date(selectedDate);
      finalDate.setHours(parseInt(hours, 10));
      finalDate.setMinutes(parseInt(minutes, 10));
      finalDate.setSeconds(parseInt(seconds, 10));
      onDateChange(finalDate);
    }
    setOpen(false);
  };

  const handleCancel = () => {
    if (date) {
      setSelectedDate(date);
      setHours(date.getHours().toString().padStart(2, "0"));
      setMinutes(date.getMinutes().toString().padStart(2, "0"));
      setSeconds(date.getSeconds().toString().padStart(2, "0"));
    } else {
      setSelectedDate(undefined);
      setHours("00");
      setMinutes("00");
      setSeconds("00");
    }
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
        className="w-80 p-0"
        align="start"
        side="bottom"
        sideOffset={4}
        style={{
          backgroundColor: 'var(--mvx-bg-color-secondary)',
          borderColor: 'var(--mvx-border-color-secondary)',
          color: 'var(--mvx-text-color-primary)',
        }}
      >
        <div className="p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
        </div>
        
        <div className="px-3 pb-3">
          <div className="border-t border-[var(--mvx-border-color-secondary)] pt-3">
            <div className="text-sm font-medium mb-3 text-[var(--mvx-text-color-primary)]">
              Heure
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-[var(--mvx-text-color-secondary)] block mb-1">
                  Heures
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => handleTimeChange("hours", e.target.value)}
                  className="w-full px-2 py-1 text-center bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-[var(--mvx-text-color-secondary)] block mb-1">
                  Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => handleTimeChange("minutes", e.target.value)}
                  className="w-full px-2 py-1 text-center bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-[var(--mvx-text-color-secondary)] block mb-1">
                  Secondes
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => handleTimeChange("seconds", e.target.value)}
                  className="w-full px-2 py-1 text-center bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
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
              Valider
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
