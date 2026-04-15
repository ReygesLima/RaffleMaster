
import React from 'react';
import { X, FileText, Layout, CheckCircle2 } from 'lucide-react';
import { PDFLayout } from '../services/pdfService';

interface LayoutModalProps {
  onSelect: (layout: PDFLayout) => void;
  onClose: () => void;
}

const LayoutModal: React.FC<LayoutModalProps> = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="w-full max-w-2xl bg-[#15162b] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-white">ESCOLHER LAYOUT</h2>
            <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mt-1">Selecione o formato de impressão do PDF</p>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-500 transition-all">
            <X size={24}/>
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Opção 25 A5 */}
          <button 
            onClick={() => onSelect('25_A5')}
            className="group relative flex flex-col items-center p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-indigo-600/10 hover:border-indigo-500/50 transition-all text-center"
          >
            <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Layout size={40} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">25 Números (A5)</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Ideal para impressões menores e econômicas. 25 cartelas por página A5.</p>
            <div className="mt-6 px-4 py-2 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400 border border-white/5">
              Recomendado
            </div>
          </button>

          {/* Opção 50 A4 */}
          <button 
            onClick={() => onSelect('50_A4')}
            className="group relative flex flex-col items-center p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-indigo-600/10 hover:border-indigo-500/50 transition-all text-center"
          >
            <div className="w-20 h-20 bg-emerald-600/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileText size={40} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">50 Números (A4)</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Máxima densidade. 50 cartelas por página A4. Ideal para grandes sorteios.</p>
            <div className="mt-6 px-4 py-2 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-white/5">
              Alta Densidade
            </div>
          </button>
        </div>

        <div className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-center">
          <p className="text-[10px] font-medium text-slate-500 flex items-center gap-2 italic">
            <CheckCircle2 size={12} className="text-indigo-500" /> 
            O PDF será gerado automaticamente após a seleção.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LayoutModal;
