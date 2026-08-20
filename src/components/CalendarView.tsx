import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Building2, MapPin, CheckCircle, AlertCircle, ArrowUpRight } from 'lucide-react';
import { JobApplication } from '../types';

interface CalendarViewProps {
  applications: JobApplication[];
  onSelectJob: (job: JobApplication) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ applications, onSelectJob }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewTab, setViewTab] = useState<'month' | 'agenda'>('month');

  // Extract all calendar events (Interview Rounds + Follow-up Dates + Date Applied)
  const events = useMemo(() => {
    const list: {
      id: string;
      dateStr: string;
      date: Date;
      type: 'interview' | 'followup' | 'applied';
      title: string;
      subtitle: string;
      job: JobApplication;
      completed?: boolean;
    }[] = [];

    applications.forEach((job) => {
      // 1. Interview Rounds
      (job.interviewRounds || []).forEach((round) => {
        if (round.date) {
          const d = new Date(round.date);
          if (!isNaN(d.getTime())) {
            list.push({
              id: `int-${job.id}-${round.id}`,
              dateStr: round.date,
              date: d,
              type: 'interview',
              title: `${job.company} — ${round.title}`,
              subtitle: job.position,
              job,
              completed: round.completed,
            });
          }
        }
      });

      // 2. Follow-Up Dates
      if (job.followUpDate) {
        const d = new Date(job.followUpDate);
        if (!isNaN(d.getTime())) {
          list.push({
            id: `fup-${job.id}`,
            dateStr: job.followUpDate,
            date: d,
            type: 'followup',
            title: `Follow Up: ${job.company}`,
            subtitle: job.position,
            job,
          });
        }
      }
    });

    return list.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [applications]);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const goToday = () => {
    setCurrentDate(new Date());
  };

  const monthYearStr = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Month Grid Calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = useMemo(() => {
    const days: { dayNumber: number; dateStr: string; isCurrentMonth: boolean; events: typeof events }[] = [];

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthFormatted = String(month + 1).padStart(2, '0');
      const dayFormatted = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthFormatted}-${dayFormatted}`;

      const dayEvents = events.filter((e) => e.dateStr === dateStr);
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        events: dayEvents,
      });
    }

    return days;
  }, [year, month, daysInMonth, events]);

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-paper/80 backdrop-blur-md p-4 rounded-2xl border border-ink/10 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-ledger/10 text-ledger">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-ink">{monthYearStr}</h3>
            <p className="text-xs text-ink-soft">
              {events.length} tracked events & deadlines across all applications
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-paper-dim rounded-lg p-0.5 border border-ink/10 flex items-center">
            <button
              onClick={() => setViewTab('month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                viewTab === 'month' ? 'bg-white text-ink shadow-xs' : 'text-ink-soft hover:text-ink'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewTab('agenda')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                viewTab === 'agenda' ? 'bg-white text-ink shadow-xs' : 'text-ink-soft hover:text-ink'
              }`}
            >
              Agenda Timeline
            </button>
          </div>

          <button
            onClick={goToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-paper border border-ink/10 text-ink hover:bg-paper-dim transition-colors cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center space-x-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg border border-ink/10 text-ink-soft hover:text-ink hover:bg-paper-dim transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-ink/10 text-ink-soft hover:text-ink hover:bg-paper-dim transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View: Month Grid */}
      {viewTab === 'month' && (
        <div className="bg-paper rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
          {/* Day Names */}
          <div className="grid grid-cols-7 border-b border-ink/10 bg-paper-dim/60 text-center py-2.5 text-xs font-semibold text-ink-soft">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-ink/10 min-h-[500px]">
            {/* Blank leading days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="bg-paper-dim/20 min-h-[90px] p-2" />
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day) => {
              const isToday = day.dateStr === todayStr;
              return (
                <div
                  key={day.dateStr}
                  className={`min-h-[100px] p-2 transition-colors flex flex-col justify-between ${
                    isToday ? 'bg-ledger-soft/30' : 'hover:bg-paper-dim/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-ledger text-white'
                          : 'text-ink-soft'
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    {day.events.length > 0 && (
                      <span className="text-[10px] font-medium text-ink-soft">
                        {day.events.length} {day.events.length === 1 ? 'event' : 'events'}
                      </span>
                    )}
                  </div>

                  {/* Day Events */}
                  <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-hide">
                    {day.events.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => onSelectJob(evt.job)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer truncate transition-transform hover:scale-[1.02] ${
                          evt.type === 'interview'
                            ? evt.completed
                              ? 'bg-plum-soft text-plum border border-plum/30 line-through opacity-70'
                              : 'bg-plum text-white shadow-xs'
                            : 'bg-brass-soft text-brass border border-brass/30'
                        }`}
                        title={`${evt.title} (${evt.subtitle})`}
                      >
                        {evt.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View: Agenda Timeline */}
      {viewTab === 'agenda' && (
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="bg-paper rounded-2xl border border-ink/10 p-12 text-center text-ink-soft">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-ink-soft/40" />
              <p className="text-sm font-medium text-ink">No upcoming interview rounds or follow-up dates.</p>
              <p className="text-xs text-ink-soft mt-1">Add interview rounds or follow-up dates in job cards to track them here.</p>
            </div>
          ) : (
            events.map((evt) => {
              const isPast = new Date(evt.dateStr) < new Date(todayStr);
              const isToday = evt.dateStr === todayStr;

              return (
                <div
                  key={evt.id}
                  onClick={() => onSelectJob(evt.job)}
                  className="bg-paper hover:bg-paper-dim/40 rounded-xl p-4 border border-ink/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all hover:translate-x-1"
                >
                  <div className="flex items-start space-x-3.5">
                    <div
                      className={`p-2.5 rounded-xl flex-shrink-0 ${
                        evt.type === 'interview'
                          ? 'bg-plum-soft text-plum'
                          : 'bg-brass-soft text-brass'
                      }`}
                    >
                      {evt.type === 'interview' ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <CalendarIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-semibold text-ink">{evt.title}</h4>
                        {isToday && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-ledger text-white">
                            Today
                          </span>
                        )}
                        {isPast && !evt.completed && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-stamp-soft text-stamp">
                            Past Due
                          </span>
                        )}
                        {evt.completed && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-ledger-soft text-ledger">
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-ink-soft mt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {evt.job.company}
                        </span>
                        {evt.job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {evt.job.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <span className="text-xs font-semibold text-ink-soft">
                      {new Date(evt.dateStr).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="p-1.5 rounded-lg bg-ink/5 text-ink-soft">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
