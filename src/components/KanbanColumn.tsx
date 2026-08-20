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
      className={`flex flex-col rounded-md bg-paper-dim/60 border p-3 sm:p-3.5 w-full min-w-0 transition-all duration-200 ${
        isDragOver
          ? 'border-ledger bg-ledger/10 ring-2 ring-ledger/20 shadow-md scale-[1.01]'
          : 'border-ink/8'
      }`}
    >
      {/* Column Header — folder tab */}
      <div className="flex items-center justify-between mb-1 px-1">
        <div className="flex items-baseline space-x-2 min-w-0">
          <h3 className="font-display font-semibold text-ink text-base truncate">
            {stage.title}
          </h3>
          <motion.span 
            key={jobs.length}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="font-ledger-mono text-[10px] font-semibold text-ink-soft shrink-0"
          >
            {jobs.length}
          </motion.span>
        </div>

        <button
          onClick={() => onAddJobForStage(stage.id)}
          className="p-1 rounded-md text-ink-soft hover:text-ink hover:bg-ink/5 transition-colors cursor-pointer shrink-0"
          title={`Add to ${stage.title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Colored rule = the folder tab's "color coding" */}
      <div className={`h-[3px] rounded-full mb-2.5 ${
        stage.id === 'wishlist' ? 'bg-slate' :
        stage.id === 'applied' ? 'bg-ledger' :
        stage.id === 'interview' ? 'bg-plum' :
        stage.id === 'offer' ? 'bg-brass' : 'bg-stamp'
      }`} />

      {/* Subtitle / Description */}
      <p className="text-[11px] text-ink-soft/70 mb-3 px-1 truncate">
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
              className="h-28 border-2 border-dashed border-ink/12 rounded-md flex flex-col items-center justify-center text-center p-3 text-ink-soft/60"
            >
              <p className="text-xs font-medium">No applications</p>
              <p className="text-[10px] text-ink-soft/50 mt-0.5">Drag cards here or click +</p>
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
        className="mt-3 w-full py-2 px-3 rounded-md border border-dashed border-ink/15 hover:border-ink/30 text-xs font-medium text-ink-soft hover:text-ink hover:bg-white/60 flex items-center justify-center transition-all cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5 mr-1" />
        Add Card
      </button>
    </motion.div>
  );
};
