"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./variants";

// 각 날짜 셀의 내용을 구성하는 커스텀 컴포넌트
function DayContent({ date }: { date: Date }) {
  return (
    <div className="flex flex-col h-full p-2 text-left">
      <span className="font-medium self-start">{date.getDate()}</span>
      <div className="flex-1 flex flex-col justify-end text-xs mt-1 space-y-0.5">
        {/* 향후 데이터 표시를 위한 공간 */}
        <div className="text-gray-400 truncate">가게: -</div>
        <div className="text-gray-400 truncate">배달: -</div>
        <div className="text-gray-600 font-semibold truncate">총: -</div>
      </div>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("size-full", className)}
      classNames={{
        // 컨테이너
        months: "size-full flex",
        month: "flex flex-col size-full",
        
        // 헤더 (월, 이전/다음 버튼)
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-lg font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        
        // 날짜 그리드
        table: "w-full h-full border-collapse flex flex-col",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-full flex-1 font-normal text-sm text-center",
        row: "flex w-full mt-2 flex-1",
        cell: "flex-1 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:border-l border-t border-r border-b",
        
        // 각 날짜 요소
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-full p-0 font-normal aria-selected:opacity-100 rounded-none"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "day-outside text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        // 커스텀 DayContent 컴포넌트를 사용하여 각 날짜를 렌더링
        Day: ({ date }) => <DayContent date={date} />,
        IconLeft: ({ ...props }) => <ChevronLeft className="size-4" {...props} />,
        IconRight: ({ ...props }) => <ChevronRight className="size-4" {...props} />,
      }}
      numberOfMonths={1}
      fixedWeeks
      formatters={{
        formatWeekdayName: (day) => format(day, "E"),
      }}
      {...props}
    />
  );
}

export { Calendar };
