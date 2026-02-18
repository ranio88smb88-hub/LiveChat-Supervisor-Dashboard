
import React, { useState } from 'react';
import { SupervisorStatus } from '../types';

interface Props {
  status: SupervisorStatus;
  monitoringEnabled: boolean;
  onToggleMonitoring: () => void;
  onOpenSettings: () => void;
}

const SupervisorPanel: React.FC<Props> = ({ status, monitoringEnabled, onToggleMonitoring, onOpenSettings }) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setRel({
        x: e.pageX - position.x,
        y: e.pageY - position.y
      });
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.pageX - rel.x,
      y: e.pageY - rel.y
    });
    e.stopPropagation();
    e.preventDefault();
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="fixed z-50 transition-shadow"
      style={{ left: position.x, bottom: position.y }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div 
        onMouseDown={onMouseDown}
        className={`w-64 bg-slate-900 border-2 rounded-2xl shadow-2xl flex flex-col overflow-hidden select-none ${
          isDragging ? 'border-blue-400 cursor-grabbing' : 'border-slate-700'
        }`}
      >
        {/* Drag Handle & Header */}
        <div className="drag-handle bg-slate-800 p-3 flex justify-between items-center cursor-grab">
          <span className="text-white text-xs font-black tracking-tighter uppercase flex items-center gap-2">
            <i className={`fas fa-circle text-[8px] ${monitoringEnabled ? 'text-green-500 animate-pulse' : 'text-red-500'}`}></i>
            Live Supervisor
          </span>
          <div className="flex gap-2">
            <button onClick={onOpenSettings} className="text-slate-400 hover:text-white transition-colors">
              <i className="fas fa-cog text-xs"></i>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 p-3 gap-2">
          <div className="bg-slate-800 p-2 rounded-lg text-center">
            <div className="text-blue-400 text-lg font-bold">{status.activeChatsCount}</div>
            <div className="text-[9px] text-slate-500 uppercase font-bold">Active</div>
          </div>
          <div className={`p-2 rounded-lg text-center ${status.delayedChatsCount > 0 ? 'bg-red-900/40' : 'bg-slate-800'}`}>
            <div className={`${status.delayedChatsCount > 0 ? 'text-red-500' : 'text-slate-400'} text-lg font-bold`}>
              {status.delayedChatsCount}
            </div>
            <div className="text-[9px] text-slate-500 uppercase font-bold">Delayed</div>
          </div>
          <div className={`p-2 rounded-lg text-center col-span-2 ${status.criticalChatsCount > 0 ? 'bg-orange-900/40' : 'bg-slate-800'}`}>
            <div className={`${status.criticalChatsCount > 0 ? 'text-orange-500' : 'text-slate-400'} text-lg font-bold`}>
              {status.criticalChatsCount}
            </div>
            <div className="text-[9px] text-slate-500 uppercase font-bold">Priority/Keywords</div>
          </div>
        </div>

        {/* Status & Toggle */}
        <div className="p-3 bg-slate-800/50 border-t border-slate-700 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">Monitoring: <b className={monitoringEnabled ? 'text-green-400' : 'text-red-400'}>{monitoringEnabled ? 'ON' : 'OFF'}</b></span>
          <button 
            onClick={onToggleMonitoring}
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
              monitoringEnabled 
                ? 'bg-red-600 hover:bg-red-500 text-white' 
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            {monitoringEnabled ? 'STOP' : 'START'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupervisorPanel;
