import React, { useState } from 'react';
import { JobApplication, STAGES, StageId } from '../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  applications: JobApplication[];
  onAddJobForStage: (stageId: StageId) => void;
  onEditJob: (job: JobApplication) => void;
  onDeleteJob: (id: string) => void;
  onMoveStage: (id: string, newStage: StageId) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  onAddJobForStage,
  onEditJob,
  onDeleteJob,
  onMoveStage,
}) => {
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [activeStageFilter, setActiveStageFilter] = useState<StageId | 'all'>('all');

  const handleDragStart = (_e: React.DragEvent, id: string) => {
    setDraggedJobId(id);
  };

  const handleDropJob = (targetStageId: StageId) => {
    if (draggedJobId) {
      onMoveStage(draggedJobId, targetStageId);
      setDraggedJobId(null);
    }
  };

  const visibleStages = activeStageFilter === 'all' 
    ? STAGES 
    : STAGES.filter(s => s.id === activeStageFilter);

  return (
    <div className="w-full space-y-3">
      {/* Quick Mobile / Small Screen Column Focus Switcher */}
      <div className="xl:hidden flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveStageFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
            activeStageFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All 5 Columns
        </button>
        {STAGES.map((s) => {
          const count = applications.filter(a => a.stage === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStageFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center space-x-1.5 cursor-pointer transition-all ${
                activeStageFilter === s.id
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{s.title}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeStageFilter === s.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Column Grid Container - Fluid on large screens, scrollable on narrow screens */}
      <div className="w-full overflow-x-auto pb-6 transition-all duration-200">
        <div className={`grid gap-3.5 sm:gap-4 items-start ${
          activeStageFilter !== 'all' 
            ? 'grid-cols-1 max-w-lg mx-auto'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 min-w-[280px] xl:min-w-0 w-full'
        }`}>
          {visibleStages.map((stage) => {
            const stageJobs = applications.filter((app) => app.stage === stage.id);
            return (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                jobs={stageJobs}
                onAddJobForStage={onAddJobForStage}
                onEditJob={onEditJob}
                onDeleteJob={onDeleteJob}
                onMoveStage={onMoveStage}
                onDragStart={handleDragStart}
                onDropJob={handleDropJob}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
