import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  records: { record_date: string }[];
}

export default function Calendar({ currentDate, setCurrentDate, setSelectedDate, records }: CalendarProps) {
  const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startOfMonth.getDay());
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endOfMonth.getDay()));

  const recordDates = new Set(records.map(r => r.record_date));

  const dates = [];
  let currentDatePointer = new Date(startDate);
  while (currentDatePointer <= endDate) {
    dates.push(new Date(currentDatePointer));
    currentDatePointer.setDate(currentDatePointer.getDate() + 1);
  }

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h3 className="text-lg font-semibold">
          {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
        </h3>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2">
        {daysOfWeek.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dates.map((date, index) => {
          const dateString = date.toISOString().split('T')[0];
          const hasRecord = recordDates.has(dateString);
          return (
            <div key={index} className="relative pt-[100%]" onClick={() => setSelectedDate(date)}>
              <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-full cursor-pointer transition-colors hover:bg-blue-100 ${isToday(date) ? 'border-2 border-blue-500' : ''}`}>
                <span className={`${date.getMonth() !== currentDate.getMonth() ? 'text-gray-300' : 'text-gray-800'}`}>
                  {date.getDate()}
                </span>
                {hasRecord && <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1"></div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
