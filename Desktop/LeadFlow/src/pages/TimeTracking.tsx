import { useState } from "react";
import { DailyGoals } from "@/components/DailyGoals";
import { TimeTracker } from "@/components/TimeTracker";
import { TimeTrackingHistory, FilterContext, DateFilter } from "@/components/TimeTrackingHistory";

export default function TimeTracking() {
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");

  return (
    <FilterContext.Provider value={{ dateFilter, setDateFilter }}>
      <div className="flex flex-col gap-6 py-6">
        <DailyGoals />
        <div className="grid gap-6 md:grid-cols-2">
          <TimeTracker />
          <TimeTrackingHistory />
        </div>
      </div>
    </FilterContext.Provider>
  );
} 