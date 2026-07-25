import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Star, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  ArrowUpDown,
  CheckSquare,
  Square,
  Flame
} from 'lucide-react';
import { JobApplication, STAGES, StageId } from '../types';
import { downloadIcsFile } from '../utils/icsExport';

interface TableViewProps {
  applications: JobApplication[];
  onEditJob: (job: JobApplication) => void;
  onDeleteJob: (id: string) => void;
  onMoveStage: (id: string, newStage: StageId) => void;
}

type SortField = 'company' | 'position' | 'stage' | 'dateApplied' | 'followUpDate' | 'rating' | 'priority';

export const TableView: React.FC<TableViewProps> = ({
  applications,
  onEditJob,
  onDeleteJob,
  onMoveStage,
}) => {
  const [sortField, setSortField] = useState<SortField>('dateApplied');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedApplications = [...applications].sort((a, b) => {
    if (sortField === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const pA = priorityOrder[a.priority || 'medium'];
      const pB = priorityOrder[b.priority || 'medium'];
      return sortAsc ? pA - pB : pB - pA;
    }

    if (sortField === 'rating') {
      const numA = a.rating || 0;
      const numB = b.rating || 0;
      return sortAsc ? numA - numB : numB - numA;
    }

    let valA = a[sortField] || '';
    let valB = b[sortField] || '';

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return 0;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === applications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applications.map(a => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchStageChange = (newStage: StageId) => {
    selectedIds.forEach(id => onMoveStage(id, newStage));
    setSelectedIds([]);
  };

  return (
    <div className="bg-white border border-black/6 rounded-2xl shadow-2xs overflow-hidden">
      {/* Batch Action Bar if items selected */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between text-xs">
          <span className="font-medium">
            {selectedIds.length} application{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center space-x-3">
            <span className="text-slate-400">Move selected to:</span>
            <div className="flex space-x-1.5">
              {STAGES.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleBatchStageChange(s.id)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  {s.title}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-white underline ml-2 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4 w-10">
                <button onClick={toggleSelectAll} className="cursor-pointer text-slate-400 hover:text-slate-700">
                  {selectedIds.length === applications.length && applications.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/60" onClick={() => handleSort('company')}>
                <div className="flex items-center">
                  Company
                  <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/60" onClick={() => handleSort('position')}>
                <div className="flex items-center">
                  Position
                  <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/60" onClick={() => handleSort('stage')}>
                <div className="flex items-center">
                  Stage
                  <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/60" onClick={() => handleSort('dateApplied')}>
                <div className="flex items-center">
                  Applied Date
                  <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/60" onClick={() => handleSort('followUpDate')}>
                <div className="flex items-center">
                  Follow Up
                  <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4">Location & Salary</th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/60" onClick={() => handleSort('priority')}>
                <div className="flex items-center">
                  Priority
                  <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {sortedApplications.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  No applications found.
                </td>
              </tr>
            ) : (
              sortedApplications.map((job) => {
                const stageCfg = STAGES.find(s => s.id === job.stage) || STAGES[1];
                const isSelected = selectedIds.includes(job.id);

                return (
                  <tr 
                    key={job.id} 
                    className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <button onClick={() => toggleSelect(job.id)} className="cursor-pointer text-slate-400 hover:text-slate-700">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <span>{job.company}</span>
                        {job.jobUrl && (
                          <a 
                            href={job.jobUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-slate-400 hover:text-blue-600"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800">
                      {job.position}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={job.stage}
                        onChange={(e) => onMoveStage(job.id, e.target.value as StageId)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer ${stageCfg.color}`}
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {job.dateApplied || '—'}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {job.followUpDate ? (
                        <div className="flex items-center space-x-1.5">
                          <span className={job.followUpDate <= new Date().toISOString().slice(0, 10) ? 'text-amber-700 font-semibold' : ''}>
                            {job.followUpDate}
                          </span>
                          <button
                            onClick={() => downloadIcsFile(job)}
                            title="Download .ics Calendar File"
                            className="p-1 rounded hover:bg-slate-100 text-blue-600 transition-colors cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : '—'}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      <div>{job.location || '—'}</div>
                      {job.salary && <div className="text-emerald-700 font-medium text-[11px]">{job.salary}</div>}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col space-y-1">
                        <div>
                          {job.priority === 'high' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <Flame className="w-2.5 h-2.5 mr-0.5 fill-rose-500 text-rose-500" />
                              High
                            </span>
                          )}
                          {job.priority === 'medium' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Medium
                            </span>
                          )}
                          {job.priority === 'low' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              Low
                            </span>
                          )}
                        </div>
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${star <= (job.rating || 0) ? 'fill-amber-400' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onEditJob(job)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteJob(job.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
