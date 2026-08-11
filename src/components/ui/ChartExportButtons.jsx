import { memo } from 'react';
import { Download, FileDown } from 'lucide-react';
import { exportChartPNG, exportCSV } from '../../utils/chartExport';

/**
 * PNG / CSV export buttons for a chart container.
 * Pass `chartRef` pointing to a DOM node that wraps a Recharts SVG,
 * a `filename` prefix, and optionally `csvData` to enable CSV export.
 */
const ChartExportButtons = memo(({ chartRef, filename, csvData = null, align = 'right' }) => {
  return (
    <div className={`flex gap-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <button
        onClick={() => exportChartPNG(chartRef.current, `${filename}.png`)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30 hover:bg-cyan-400/10 transition-all"
        aria-label="Export chart as PNG"
      >
        <Download size={11} aria-hidden="true" /> PNG
      </button>
      {csvData && (
        <button
          onClick={() => exportCSV(csvData, `${filename}.csv`)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-emerald-400 hover:border-emerald-400/30 hover:bg-emerald-400/10 transition-all"
          aria-label="Export data as CSV"
        >
          <FileDown size={11} aria-hidden="true" /> CSV
        </button>
      )}
    </div>
  );
});

export default ChartExportButtons;
