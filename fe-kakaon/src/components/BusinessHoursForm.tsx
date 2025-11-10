import { useState, useEffect, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];

// 시간/분 옵션 생성
const hoursOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutesOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

// --- 커스텀 시간 선택 컴포넌트 ---
interface TimePickerProps {
  value: string;
  onChange: (newTime: string) => void;
  disabled?: boolean;
}

const TimePicker = ({ value, onChange, disabled }: TimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, minute] = value.split(':');
  
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  // Popover가 열릴 때 현재 값으로 스크롤
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const selectedHour = hourRef.current?.querySelector(`[data-hour="${hour}"]`);
        selectedHour?.scrollIntoView({ block: 'center' });
        const selectedMinute = minuteRef.current?.querySelector(`[data-minute="${minute}"]`);
        selectedMinute?.scrollIntoView({ block: 'center' });
      }, 100);
    }
  }, [isOpen, hour, minute]);

  const handleHourChange = (newHour: string) => {
    onChange(`${newHour}:${minute}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange(`${hour}:${newMinute}`);
    setIsOpen(false); // 분을 선택하면 바로 닫기
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-24 justify-start font-normal", disabled && "opacity-50 cursor-not-allowed")}
          disabled={disabled}
        >
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex">
        <div ref={hourRef} className="flex flex-col h-48 overflow-y-auto scrollbar-hide">
          {hoursOptions.map((h) => (
            <Button
              key={h}
              variant={h === hour ? 'default' : 'ghost'}
              data-hour={h}
              onClick={() => handleHourChange(h)}
              className="rounded-none"
            >
              {h}
            </Button>
          ))}
        </div>
        <div ref={minuteRef} className="flex flex-col h-48 overflow-y-auto scrollbar-hide border-l">
          {minutesOptions.map((m) => (
            <Button
              key={m}
              variant={m === minute ? 'default' : 'ghost'}
              data-minute={m}
              onClick={() => handleMinuteChange(m)}
              className="rounded-none"
            >
              {m}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};


// --- BusinessHoursForm ---

type TimeSlot = {
  start: string;
  end: string;
};

type DayOpeningHours = {
  isClosed: boolean;
  timeSlots: TimeSlot[];
};

type BusinessHours = {
  [key: string]: DayOpeningHours;
};

export type BusinessHoursState = BusinessHours;

const initialBusinessHours: BusinessHoursState = daysOfWeek.reduce((acc, day) => {
  acc[day] = {
    isClosed: false,
    timeSlots: [{ start: '09:00', end: '18:00' }],
  };
  return acc;
}, {} as BusinessHoursState);

interface BusinessHoursFormProps {
  initialState?: BusinessHoursState | null;
  onStateChange: (newState: BusinessHoursState) => void;
}

export function BusinessHoursForm({ initialState, onStateChange }: BusinessHoursFormProps) {
  const [businessHours, setBusinessHours] = useState(initialState ?? initialBusinessHours);

  useEffect(() => {
    onStateChange(businessHours);
  }, [businessHours, onStateChange]);

  const handleHolidayToggle = (day: string) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isClosed: !prev[day].isClosed,
      },
    }));
  };

  const handleTimeChange = (day: string, index: number, field: 'start' | 'end', value: string) => {
    const newTimeSlots = [...businessHours[day].timeSlots];
    newTimeSlots[index][field] = value;
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: newTimeSlots,
      },
    }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm text-[#717182] mb-2 block">영업시간 설정</h3>
      <div className="space-y-3 border p-4 rounded-md">
        {daysOfWeek.map((day) => (
          <div key={day} className="flex items-center gap-3">
            <Label className="w-8 flex-shrink-0 font-semibold text-base">{day}</Label>
            <div className="flex-1 flex items-center gap-2">
              <TimePicker
                  value={businessHours[day].timeSlots[0].start}
                  onChange={(value) => handleTimeChange(day, 0, 'start', value)}
                  disabled={businessHours[day].isClosed}
              />
              <span>~</span>
              <TimePicker
                  value={businessHours[day].timeSlots[0].end}
                  onChange={(value) => handleTimeChange(day, 0, 'end', value)}
                  disabled={businessHours[day].isClosed}
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Label htmlFor={`holiday-${day}`} className="text-sm text-gray-600">
                <span className="sm:hidden">휴무</span>
                <span className="hidden sm:inline">휴무일 지정</span>
              </Label>
              <Checkbox
                  id={`holiday-${day}`}
                  checked={businessHours[day].isClosed}
                  onCheckedChange={() => handleHolidayToggle(day)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
