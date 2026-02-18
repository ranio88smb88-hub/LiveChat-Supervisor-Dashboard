
import React, { useState } from 'react';
import { Settings } from '../types';

interface Props {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<Props> = ({ settings, onSave, onClose }) => {
  const [form, setForm] = useState<Settings>(settings);
  const [keywordInput, setKeywordInput] = useState("");

  const handleAddKeyword = () => {
    if (keywordInput && !form.keywords.includes(keywordInput.toLowerCase())) {
      setForm({ ...form, keywords: [...form.keywords, keywordInput.toLowerCase()] });
      setKeywordInput("");
    }
  };

  const removeKeyword = (k: string) => {
    setForm({ ...form, keywords: form.keywords.filter(kw => kw !== k) });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <i className="fas fa-sliders text-blue-400"></i>
            Local Settings
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><i className="fas fa-times"></i></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Timer Duration */}
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">
              Reply Deadline (Seconds)
            </label>
            <input 
              type="number" 
              value={form.timerDuration}
              onChange={(e) => setForm({ ...form, timerDuration: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl">
            <div>
              <div className="text-white font-bold">Sound Notifications</div>
              <div className="text-xs text-slate-500">Play alert when keywords detected</div>
            </div>
            <button 
              onClick={() => setForm({ ...form, enableSound: !form.enableSound })}
              className={`w-12 h-6 rounded-full transition-colors relative ${form.enableSound ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.enableSound ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          {/* Keywords List */}
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">
              Target Keywords
            </label>
            <div className="flex gap-2 mb-3">
              <input 
                type="text" 
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                placeholder="Add keyword..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
              />
              <button 
                onClick={handleAddKeyword}
                className="bg-blue-600 px-4 rounded-lg text-white font-bold text-sm"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.keywords.map(k => (
                <span key={k} className="bg-slate-700 text-slate-200 px-3 py-1 rounded-full text-xs flex items-center gap-2">
                  {k}
                  <button onClick={() => removeKeyword(k)} className="text-slate-500 hover:text-red-400">
                    <i className="fas fa-times text-[10px]"></i>
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-900/50 flex gap-3">
          <button 
            onClick={() => { onSave(form); onClose(); }}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
          >
            Save Configuration
          </button>
          <button 
            onClick={onClose}
            className="px-6 bg-slate-700 text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
