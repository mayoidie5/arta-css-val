import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Label } from './ui/label';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label: string;
  required?: boolean;
  maxDate?: Date;
}

export function CustomDatePicker({ value, onChange, label, required = false, maxDate }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setCurrentMonth(date.getMonth());
        setCurrentYear(date.getFullYear());
      }
    }
  }, [value]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateSelect = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const maxDateToUse = maxDate || new Date();
    
    if (date <= maxDateToUse) {
      setSelectedDate(date);
      const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      onChange(formattedDate);
      setIsOpen(false);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const maxDateToUse = maxDate || new Date();
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    if (new Date(nextYear, nextMonth, 1) <= maxDateToUse) {
      setCurrentMonth(nextMonth);
      setCurrentYear(nextYear);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const maxDateToUse = maxDate || new Date();
    
    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-2" />
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentMonth && 
        selectedDate.getFullYear() === currentYear;
      const isDisabled = date > maxDateToUse;
      const isToday = new Date().toDateString() === date.toDateString();
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          disabled={isDisabled}
          className={`p-2 text-sm rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-secondary ${
            isSelected
              ? 'bg-secondary text-secondary-foreground font-bold shadow-md'
              : isToday
              ? 'bg-blue-50 border-2 border-secondary text-secondary font-semibold'
              : isDisabled
              ? 'text-muted-foreground/30 cursor-not-allowed'
              : 'hover:bg-muted text-foreground'
          }`}
          aria-label={`${monthNames[currentMonth]} ${day}, ${currentYear}`}
          aria-pressed={isSelected}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  const formatDisplayDate = () => {
    if (!selectedDate) return 'Select a date';
    return selectedDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const canGoNext = () => {
    const maxDateToUse = maxDate || new Date();
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    return new Date(nextYear, nextMonth, 1) <= maxDateToUse;
  };

  return (
    <div className="space-y-2">
      <Label className="text-primary">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal border-border h-12 ${
              !value && 'text-muted-foreground'
            }`}
            aria-label={`${label}, ${formatDisplayDate()}`}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {formatDisplayDate()}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4 bg-white rounded-lg shadow-lg border border-border">
            {/* Month/Year Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                className="h-8 w-8 p-0"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="font-semibold text-primary">
                {monthNames[currentMonth]} {currentYear}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                disabled={!canGoNext()}
                className="h-8 w-8 p-0"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {dayNames.map(day => (
                <div key={day} className="text-xs font-semibold text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendarDays()}
            </div>
            
            {/* Helper text */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Click a date to select
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <p className="text-xs text-muted-foreground italic">Please select the date of your transaction.</p>
    </div>
  );
}
