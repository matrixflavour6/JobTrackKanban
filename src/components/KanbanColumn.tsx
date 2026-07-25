import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import { JobApplication, StageConfig, StageId } from '../types';
import { JobCard } from './JobCard';

interface KanbanColumnProps {
  stage: StageConfig;
  jobs: JobApplication[];
  onAddJobForStage: (stageId: StageId) => void;
  onEditJob: (job: JobApplication) => void;
  onDeleteJob: (id: string) => void;
  onMoveStage: (id: string, newStage: StageId) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDropJob: (stageId: StageId) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stage,
  jobs,
  onAddJobForStage,
  onEditJob,
  onDeleteJob,
  onMoveStage,
  onDragStart,
  onDropJob,
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDropJob(stage.id);
  };

  return (
    <motion.div
      layout
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-2xl bg-slate-200/40 border p-3.5 min-w-[260px] sm:min-w-[280px] xl:min-w-0 w-full transition-all duration-200 ${
        isDragOver
          ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20 shadow-md scale-[1.01]'
          : 'border-black/5'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs ${stage.color}`}>
            {stage.title}
          </span>
          <motion.span 
            key={jobs.length}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-[11px] font-semibold text-slate-500 bg-white/80 border border-black/5 px-2 py-0.5 rounded-full shadow-2xs"
          >
            {jobs.length}
          </motion.span>
        </div>

        <button
          onClick={() => onAddJobForStage(stage.id)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          title={`Add to ${stage.title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Subtitle / Description */}
      <p className="text-[11px] text-slate-400 mb-3 px-1 truncate">
        {stage.description}
      </p>

      {/* Cards Scroll Container */}
      <div className="flex-1 space-y-3 min-h-[160px] overflow-y-auto pr-0.5 max-h-[calc(100vh-250px)]">
        <AnimatePresence mode="popLayout">
          {jobs.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-28 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-3 text-slate-400"
            >
              <p className="text-xs font-medium">No applications</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Drag cards here or click +</p>
            </motion.div>
          ) : (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={onEditJob}
                onDelete={onDeleteJob}
                onMoveStage={onMoveStage}
                onDragStart={onDragStart}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Quick Add Button */}
      <button
        onClick={() => onAddJobForStage(stage.id)}
        className="mt-3 w-full py-2 px-3 rounded-xl border border-dashed border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-white flex items-center justify-center transition-all cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5 mr-1" />
        Add Card
      </button>
    </motion.div>
  );
};
