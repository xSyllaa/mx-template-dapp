"use client";

import * as React from "react";
import { format } from "date-fns";
import { DatePicker } from "./DatePicker";
import { TimePicker } from "./TimePicker";

interface DateTimePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  startDate?: Date;
  endDate?: Date;
  isStartDatePicker?: boolean;
}

export function DateTimePicker({
  date,
  onDateChange,
  placeholder = "Sélectionner une date et heure",
  className,
  disabled = false,
  startDate,
  endDate,
  isStartDatePicker = false,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [selectedTime, setSelectedTime] = React.useState<Date | undefined>(date);

  // Update internal state when date prop changes
  React.useEffect(() => {
    setSelectedDate(date);
    setSelectedTime(date);
  }, [date]);

  const handleDateChange = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
    
    if (newDate && selectedTime) {
      // Combine the new date with existing time
      const combinedDate = new Date(newDate);
      combinedDate.setHours(selectedTime.getHours());
      combinedDate.setMinutes(selectedTime.getMinutes());
      combinedDate.setSeconds(0);
      combinedDate.setMilliseconds(0);
      onDateChange(combinedDate);
    } else if (newDate) {
      // If no time is selected, set to current time
      const now = new Date();
      const combinedDate = new Date(newDate);
      combinedDate.setHours(now.getHours());
      combinedDate.setMinutes(now.getMinutes());
      combinedDate.setSeconds(0);
      combinedDate.setMilliseconds(0);
      onDateChange(combinedDate);
    } else {
      onDateChange(undefined);
    }
  };

  const handleTimeChange = (newTime: Date | undefined) => {
    setSelectedTime(newTime);
    
    if (selectedDate && newTime) {
      // Combine the existing date with new time
      const combinedDate = new Date(selectedDate);
      combinedDate.setHours(newTime.getHours());
      combinedDate.setMinutes(newTime.getMinutes());
      combinedDate.setSeconds(0);
      combinedDate.setMilliseconds(0);
      onDateChange(combinedDate);
    }
  };

  const formatDateTime = (date: Date) => {
    return format(date, "dd/MM/yyyy HH:mm");
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-[var(--mvx-text-color-primary)] block mb-2">
            Date
          </label>
          <DatePicker
            date={selectedDate}
            onDateChange={handleDateChange}
            placeholder="Sélectionner une date"
            disabled={disabled}
            startDate={startDate}
            endDate={endDate}
            isStartDatePicker={isStartDatePicker}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--mvx-text-color-primary)] block mb-2">
            Heure
          </label>
          <TimePicker
            time={selectedTime}
            onTimeChange={handleTimeChange}
            placeholder="Sélectionner une heure"
            disabled={disabled}
          />
        </div>
      </div>
      
      {date && (
        <div className="mt-2 text-sm text-[var(--mvx-text-color-secondary)]">
          Sélectionné : {formatDateTime(date)}
        </div>
      )}
    </div>
  );
}