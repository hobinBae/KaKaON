import { useState, ChangeEvent } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];

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

const initialBusinessHours: BusinessHours = daysOfWeek.reduce((acc, day) => {
  acc[day] = {
    isClosed: false,
    timeSlots: [{ start: '09:00', end: '18:00' }],
  };
  return acc;
}, {} as BusinessHours);

export function BusinessHoursForm() {
  const [businessHours, setBusinessHours] = useState(initialBusinessHours);

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

  const removeTimeSlot = (day: string, index: number) => {
    const newTimeSlots = [...businessHours[day].timeSlots];
    if (newTimeSlots.length > 1) {
      newTimeSlots.splice(index, 1);
      setBusinessHours((prev) => ({
          ...prev,
          [day]: {
              ...prev[day],
              timeSlots: newTimeSlots,
          },
      }));
    }
  };


  return (
    <div className="space-y-4 col-span-2">
      <h3 className="text-sm text-[#717182] mb-2 block">영업시간 설정</h3>
      <div className="space-y-2 border p-3 rounded-md">
        {daysOfWeek.map((day) => (
          <div key={day} className="grid grid-cols-[auto_1fr] items-center gap-x-2 pl-2">
            <div className="w-10 flex items-center">
                <Label htmlFor={`holiday-${day}`} className="font-semibold">{day}</Label>
            </div>
            <div className="flex-grow space-y-2">
              {businessHours[day].isClosed ? (
                 <div className="flex items-center h-10">
                    <Checkbox
                        id={`holiday-${day}`}
                        checked={businessHours[day].isClosed}
                        onCheckedChange={() => handleHolidayToggle(day)}
                        className="mr-2"
                    />
                    <Label htmlFor={`holiday-${day}`} className="text-gray-500">휴무일</Label>
                </div>
              ) : (
                businessHours[day].timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center space-x-2">
                    {index === 0 && (
                         <Checkbox
                            id={`holiday-${day}`}
                            checked={businessHours[day].isClosed}
                            onCheckedChange={() => handleHolidayToggle(day)}
                            className="mr-4"
                        />
                    )}
                    <Input
                        type="time"
                        value={slot.start}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleTimeChange(day, index, 'start', e.target.value)}
                        disabled={businessHours[day].isClosed}
                        className="w-full"
                        style={{ marginLeft: index > 0 ? '28px' : '0' }}
                    />
                    <span>~</span>
                    <Input
                        type="time"
                        value={slot.end}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleTimeChange(day, index, 'end', e.target.value)}
                        disabled={businessHours[day].isClosed}
                        className="w-full"
                    />
                    {businessHours[day].timeSlots.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removeTimeSlot(day, index)} className="h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                    </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
