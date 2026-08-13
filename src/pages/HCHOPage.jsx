import { motion } from 'motion/react';
import { TriangleAlert as AlertTriangle, Info, Activity } from 'lucide-react';
import HCHOMap from '../components/map/HCHOMap';
import PageHeader from '../components/ui/PageHeader';
import { getHCHOHotspotsForYear } from '../utils/timelineUtils';
import { formatHCHO } from '../utils/aqiUtils';
import { ModeledDataBanner, PanelTitle, EmptyState } from '../components/ui/Shared';

export default function HCHOPage({ selectedYear = 'Live' }) {
  const hotspots = getHCHOHotspotsForYear(selectedYear);
  const safeHotspots = Array.isArray(hotspots) ? hotspots : [];
  const maxHotspot = safeHotspots.length
    ? [...safeHotspots].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0]
    : null;
  const maxVal = safeHotspots.length ? Math.max(...safeHotspots.map(h => h.value ?? 0)) : 1;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        eyebrow={`Tropospheric HCHO — ${selectedYear === 'Live' ? 'Sentinel-5P reference' : `${selectedYear} reference`}`}
        title="Formaldehyde Column Density Hotspots"
        description="Tropospheric HCHO column density — a proxy for biomass burning, crop residue, and industrial VOC emissions, retrieved from the Sentinel-5P TROPOMI sensor."
        accent="violet"
      >
        {maxHotspot && (
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Peak column ({selectedYear})</span>
            <span className="text-lg font-black font-mono text-cyan-400">{formatHCHO(maxHotspot.value)} mol/cm²</span>
          </div>
        )}
      </PageHeader>

      {/* Data quality banner */}
      {selectedYear === 'Live' ? (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-xs"
          style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)' }}>
          <Info size={14} className="text-cyan-400 mt-0.5 shrink-0" aria-hidden="true" />
          <span className="text-slate-400">
            Reference geometry from Sentinel-5P TROPOMI. Real-time HCHO ingestion requires Copernicus Open Access Hub credentials.
          </span>
        </div>
      ) : (
        <ModeledDataBanner />
      )}

      <div className="grid md:grid-cols-4 gap-6">
        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-3 rounded-2xl overflow-hidden shadow-2xl"
          style={{ border: '1px solid rgba(34,211,238,0.15)' }}
        >
          <HCHOMap hotspots={safeHotspots} selectedYear={selectedYear} />
        </motion.div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="panel panel-hover p-5 flex-1">
            <PanelTitle title="Top regions by HCHO" subtitle={selectedYear === 'Live' ? 'Reference · S5P TROPOMI' : `Reference · ${selectedYear}`} />
            {safeHotspots.length === 0 ? (
              <EmptyState title="No hotspots" message={`No HCHO hotspot data for ${selectedYear}`} icon={Activity} />
            ) : (
              <div className="space-y-3">
                {safeHotspots.slice(0, 6).map((h, i) => {
                  const pct = maxVal > 0 ? ((h.value ?? 0) / maxVal) * 100 : 0;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ x: 2 }}
                    >
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <span className="text-slate-300 font-medium truncate max-w-[120px]">#{i + 1} {h.region}</span>
                        <span className="text-cyan-400 font-mono font-bold text-[11px]">{formatHCHO(h.value)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5" role="progressbar"
                        aria-label={`${h.region} HCHO intensity`} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: i * 0.07, duration: 0.5, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: `rgba(34,211,238,${0.3 + (h.intensity ?? 0.5) * 0.7})` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-600 font-mono mt-0.5">{h.source}</div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="panel p-5">
            <PanelTitle title="What does HCHO tell us?" mono={false} />
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              Formaldehyde (HCHO) is a VOC oxidation product used as a proxy for biomass burning and petrochemical activity.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Elevated HCHO over the Indo-Gangetic Plain during Oct–Nov indicates crop residue burning. Over NE India in May–June it signals forest fires.
            </p>
          </div>

          <div className="panel p-5">
            <PanelTitle title="About the data" />
            <div className="text-[11px] text-slate-500 font-mono leading-relaxed space-y-1">
              <div>Sensor: Sentinel-5P TROPOMI</div>
              <div>Product: L2 HCHO column</div>
              <div>QA filter: qa_value ≥ 0.75</div>
              <div>Units: ×10¹⁵ mol/cm²</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
