"use client";

import * as React from "react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "../../lib/utils";

interface TimePickerProps {
  time?: Date;
  onTimeChange: (time: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function TimePicker({
  time,
  onTimeChange,
  placeholder = "Sélectionner une heure",
  className,
  disabled = false,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [hours, setHours] = React.useState<string>("00");
  const [minutes, setMinutes] = React.useState<string>("00");

  // Initialize time values when time prop changes
  React.useEffect(() => {
    if (time) {
      setHours(time.getHours().toString().padStart(2, "0"));
      setMinutes(time.getMinutes().toString().padStart(2, "0"));
    } else {
      setHours("00");
      setMinutes("00");
    }
  }, [time]);

  const handleHourChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 23) {
      setHours(numValue.toString().padStart(2, "0"));
    }
  };

  const handleMinuteChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 59) {
      setMinutes(numValue.toString().padStart(2, "0"));
    }
  };

  const handleConfirm = () => {
    const newTime = new Date();
    newTime.setHours(parseInt(hours, 10));
    newTime.setMinutes(parseInt(minutes, 10));
    newTime.setSeconds(0);
    newTime.setMilliseconds(0);
    onTimeChange(newTime);
    setOpen(false);
  };

  const handleCancel = () => {
    if (time) {
      setHours(time.getHours().toString().padStart(2, "0"));
      setMinutes(time.getMinutes().toString().padStart(2, "0"));
    } else {
      setHours("00");
      setMinutes("00");
    }
    setOpen(false);
  };

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !time && "text-[var(--mvx-text-color-secondary)]",
            className
          )}
          style={{
            backgroundColor: 'var(--mvx-bg-color-secondary)',
            borderColor: 'var(--mvx-border-color-secondary)',
            color: 'var(--mvx-text-color-primary)',
          }}
        >
          {time ? formatTime(time) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-4"
        align="start"
        side="bottom"
        sideOffset={4}
        style={{
          backgroundColor: 'var(--mvx-bg-color-secondary)',
          borderColor: 'var(--mvx-border-color-secondary)',
          color: 'var(--mvx-text-color-primary)',
        }}
      >
        <div className="space-y-4">
          <div className="text-sm font-medium text-[var(--mvx-text-color-primary)]">
            Sélectionner l'heure
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-[var(--mvx-text-color-secondary)] block mb-1">
                Heures
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => handleHourChange(e.target.value)}
                className="w-full px-3 py-2 text-center bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
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
                onChange={(e) => handleMinuteChange(e.target.value)}
                className="w-full px-3 py-2 text-center bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
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
