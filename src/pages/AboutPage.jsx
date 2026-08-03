import { motion } from 'motion/react';
import SectionHeader from '../components/ui/SectionHeader';
import { GitBranch, Satellite, Award, Target, ArrowRight, Database, Cpu, Globe, Layers, Brain, Rocket, Heart } from 'lucide-react';

const team = [
  { name: 'Lead ML Engineer', role: 'ConvLSTM + Attention architecture, model training & hyperparameter optimization, MERRA-2 integration', color: '#34d399' },
  { name: 'Frontend Developer', role: 'React + Vite + Leaflet + Recharts dashboard, data visualization, UX/UI design', color: '#22d3ee' },
  { name: 'Remote Sensing Specialist', role: 'Sentinel-5P TROPOMI processing, MODIS/VIIRS fire data pipeline, HCHO retrieval', color: '#fbbf24' },
  { name: 'Data Engineer', role: 'CPCB + IMD data fusion, preprocessing pipeline, spatial interpolation (TPS/kriging)', color: '#a78bfa' },
  { name: 'Backend / DevOps Engineer', role: 'FastAPI inference server, Docker containerization, CI/CD pipeline, NVIDIA NIM integration', color: '#fb7185' },
];

// Architecture diagram nodes
const ARCH_FLOW = [
  { title: 'Satellite Sources', icon: Satellite, color: '#22d3ee', items: ['Sentinel-5P TROPOMI', 'MODIS Terra/Aqua', 'VIIRS S-NPP', 'INSAT-3DR'] },
  { title: 'Ground Data', icon: Database, color: '#34d399', items: ['CPCB CAAQMS', 'IMD Reanalysis', '847 stations'] },
  { title: 'Processing', icon: Layers, color: '#a78bfa', items: ['GEE Exports', 'Spatial Join', 'Feature Engineering'] },
  { title: 'ML Models', icon: Cpu, color: '#fbbf24', items: ['ConvLSTM + Attention', 'XGBoost HCHO Classifier', 'LSTM Forecast'] },
  { title: 'Visualization', icon: Globe, color: '#fb7185', items: ['React Dashboard', 'Leaflet Maps', 'Recharts'] },
];

export default function AboutPage() {
  return (
    <div className="p-4 md:p-6 space-y-10">
      <SectionHeader
        eyebrow="About This Project"
        title="AQI24 — Air Quality Intelligence"
        description="Surface AQI & HCHO Hotspot Identification using Satellite Data"
        accent="cyan"
      />

      {/* Project overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target size={20} className="text-cyan-400" aria-hidden="true" />
            <h3 className="font-semibold text-white">Problem Statement</h3>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            India faces a severe air quality crisis, with over 1.4 billion people exposed to pollution levels exceeding WHO guidelines.
            Traditional ground-based monitoring covers only ~850 locations — leaving vast rural regions unmonitored.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            AQI24 addresses this gap by fusing multi-sensor satellite observations with CPCB ground data
            and AI models to generate nationwide 1-km AQI grids and identify biomass-burning-linked HCHO hotspots
            in near real time.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award size={20} className="text-amber-400" aria-hidden="true" />
            <h3 className="font-semibold text-white">Innovation Highlights</h3>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Multi-sensor Fusion', desc: 'First integration of Sentinel-5P HCHO + MODIS AOD + VIIRS fire + CPCB ground for India-wide AQI', color: '#22d3ee' },
              { title: 'ConvLSTM + Attention', desc: 'Spatiotemporal deep learning model capturing spatial convolution patterns and temporal recurrence with multi-satellite attention weighting', color: '#34d399' },
              { title: 'HCHO Source Attribution', desc: 'ML-based source separation distinguishing biomass burning from biogenic and industrial HCHO', color: '#a78bfa' },
              { title: 'Temporal Forecasting', desc: 'LSTM 6-hour ahead AQI predictions enabling early warning for sensitive populations', color: '#fbbf24' },
              { title: 'Open Data Stack', desc: 'Entirely built on freely available Copernicus, NASA EARTHDATA, and CPCB open datasets', color: '#fb7185' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: item.color }} />
                <div>
                  <span className="font-medium text-white">{item.title} — </span>
                  <span className="text-slate-400">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Architecture diagram */}
      <div>
        <SectionHeader eyebrow="System Architecture" title="Data Pipeline Flow" accent="violet" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="panel p-6">
          <div className="grid md:grid-cols-5 gap-4 items-stretch">
            {ARCH_FLOW.map((node, i) => {
              const Icon = node.icon;
              return (
                <div key={node.title} className="relative">
                  {i < ARCH_FLOW.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-slate-700">
                      <ArrowRight size={16} aria-hidden="true" />
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-xl p-4 h-full"
                    style={{ background: `${node.color}08`, border: `1px solid ${node.color}18` }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${node.color}15`, border: `1px solid ${node.color}25` }}>
                        <Icon size={15} style={{ color: node.color }} aria-hidden="true" />
                      </div>
                      <span className="text-xs font-bold text-white">{node.title}</span>
                    </div>
                    <div className="space-y-1">
                      {node.items.map((item, j) => (
                        <div key={j} className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full" style={{ background: node.color }} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Team */}
      <div>
        <div className="text-xs font-mono tracking-widest text-cyan-400 mb-4">DINO CODERS — THE TEAM</div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="panel p-5"
              style={{ borderColor: `${member.color}20` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: `${member.color}20`, border: `1px solid ${member.color}40` }}>
                  {String.fromCodePoint(0x1F9D1)}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{member.name}</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Future Scope — NVIDIA NIM */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="panel p-6"
        style={{ borderColor: 'rgba(52,211,153,0.15)', background: 'rgba(52,211,153,0.03)' }}>
        <div className="flex items-center gap-3 mb-4">
          <Rocket size={20} className="text-emerald-400" aria-hidden="true" />
          <h3 className="font-semibold text-white">Future Scope: NVIDIA NIM Integration</h3>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed mb-4">
          The next evolution of AQI24 targets deployment of the ConvLSTM + Attention model as an NVIDIA NIM (NVIDIA Inference Microservice) container.
          This enables GPU-accelerated inference for real-time, nationwide 1-km AQI prediction at scale — reducing latency from minutes to seconds
          and supporting operational deployment for government environmental agencies.
        </p>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { title: 'GPU-Accelerated Inference', desc: 'NVIDIA TensorRT optimization for ConvLSTM + Attention model serving', icon: Cpu, color: '#34d399' },
            { title: 'Scalable Microservice', desc: 'NIM container orchestration with Kubernetes for auto-scaling demand spikes', icon: Layers, color: '#22d3ee' },
            { title: 'Real-Time API', desc: 'Sub-second AQI prediction API for integration with public alert systems', icon: Rocket, color: '#fbbf24' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-xl p-3" style={{ background: `${item.color}08`, border: `1px solid ${item.color}15` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} style={{ color: item.color }} aria-hidden="true" />
                  <span className="text-xs font-semibold text-white">{item.title}</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Tech stack */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="panel p-6">
        <div className="text-sm font-semibold text-white mb-4">Technology Stack</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { cat: 'Frontend', items: ['React 19 + Vite', 'Tailwind CSS v4', 'Framer Motion', 'Leaflet + React-Leaflet', 'Recharts'] },
            { cat: 'ML / Backend', items: ['Python 3.11', 'ConvLSTM + Attention (PyTorch)', 'XGBoost HCHO Classifier', 'FastAPI', 'NumPy / PandPy'] },
            { cat: 'Remote Sensing', items: ['ESA SNAP / Sentinelsat', 'NASA EarthData', 'GDAL / Rasterio', 'Google Earth Engine', 'netCDF4 / HDF5'] },
            { cat: 'Infrastructure', items: ['Docker', 'GeoServer', 'PostgreSQL + PostGIS', 'AWS S3 (data lake)', 'GitHub Actions CI'] },
          ].map((stack) => (
            <div key={stack.cat} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-xs font-mono text-cyan-400 mb-2">{stack.cat}</div>
              {stack.items.map((item) => (
                <div key={item} className="text-xs text-slate-400 py-0.5">{item}</div>
              ))}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Links */}
      <div className="flex items-center gap-3">
        <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-300 transition-all hover:text-white border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50">
          <GitBranch size={16} />
          Source Code
        </a>
        <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-300 transition-all hover:text-white border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50">
          <Satellite size={16} className="text-cyan-400" aria-hidden="true" />
          Project Overview
        </a>
      </div>

      {/* Footer */}
      <div className="text-center py-6 border-t border-slate-800/40">
        <div className="text-xs font-mono text-slate-600">AQI<span className="text-cyan-400/60">24</span> · Air Quality Intelligence Platform · Built for India</div>
        <div className="text-xs font-mono text-slate-600 mt-2">© 2026 Dino Coders · Built with <Heart size={10} className="inline text-rose-400/60" aria-hidden="true" /> for climate action</div>
      </div>
    </div>
  );
}
