import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/ui/SectionHeader';
import { GitBranch, Satellite, Award, Target, ArrowRight, Database, Cpu, Globe, Layers, Brain, Rocket, Heart, CloudSun } from 'lucide-react';

const team = [
  { name: 'Frontend Developer', role: 'React + Vite + Tailwind dashboard, Leaflet maps, Recharts visualizations, UX/UI design', color: '#22d3ee' },
  { name: 'ML Engineer', role: 'Fire intensity regressor and severity classifier experiments (LightGBM, XGBoost) on NASA FIRMS data', color: '#34d399' },
  { name: 'Remote Sensing Specialist', role: 'NASA FIRMS fire integration, Sentinel-5P TROPOMI HCHO reference maps', color: '#fbbf24' },
  { name: 'Data Engineer', role: 'WAQI + Open-Meteo CAMS integration, reference record curation, AQI scale handling', color: '#a78bfa' },
  { name: 'Backend / DevOps Engineer', role: 'Optional FastAPI inference server, Supabase auth, deployment', color: '#fb7185' },
];

// Architecture diagram nodes — how this build actually works
const ARCH_FLOW = [
  { title: 'Data Sources', icon: Database, color: '#22d3ee', items: ['WAQI stations', 'Open-Meteo CAMS', 'NASA FIRMS', 'Reference records'] },
  { title: 'Processing', icon: Layers, color: '#34d399', items: ['AQI scale conversion', 'Station pairing (100 km)', 'FRP features', 'Log₁₊ transform'] },
  { title: 'ML Experiments', icon: Cpu, color: '#fbbf24', items: ['LightGBM FRP regressor', 'XGBoost severity classifier'] },
  { title: 'Forecast', icon: CloudSun, color: '#a78bfa', items: ['CAMS atmospheric model', '7-day outlook'] },
  { title: 'Visualization', icon: Globe, color: '#fb7185', items: ['React Dashboard', 'Leaflet Maps', 'Recharts'] },
];

export default function AboutPage() {
  return (
    <div className="p-4 md:p-6 space-y-10">
      <SectionHeader
        eyebrow="About This Project"
        title="AQI24 — Air Quality Intelligence"
        description="Current air quality, forecasts and satellite-derived fire activity for every city in India — built on verifiable, clearly-labelled data."
        accent="cyan"
      />

      {/* Project overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target size={20} className="text-cyan-400" aria-hidden="true" />
            <h3 className="font-semibold text-white">Why AQI24 exists</h3>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Air pollution affects hundreds of millions of people in India, yet ground monitoring stations cover only a few hundred locations.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            AQI24 pairs nearby station readings with an atmospheric forecast and satellite-derived fire activity, so anyone can check the air quality around them — and understand where the numbers come from.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award size={20} className="text-amber-400" aria-hidden="true" />
            <h3 className="font-semibold text-white">What&rsquo;s in this build</h3>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Current readings', desc: 'Nearest-station AQI from WAQI, with the station name and distance always shown', color: '#22d3ee' },
              { title: '7-day forecast', desc: 'Air quality outlook from the Open-Meteo CAMS atmospheric model, clearly labelled as a forecast', color: '#34d399' },
              { title: 'Fire activity', desc: 'Satellite fire detections from NASA FIRMS with fire intensity, not a severity judgement', color: '#fbbf24' },
              { title: 'Reference records', desc: 'Historical charts are labelled as modelled references whenever they are not current measurements', color: '#a78bfa' },
              { title: 'ML experiments', desc: 'A fire-intensity regressor and severity classifier trained on NASA FIRMS detections — clearly scoped as experiments', color: '#fb7185' },
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

      {/* Planned next steps */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="panel p-6"
        style={{ borderColor: 'rgba(52,211,153,0.15)', background: 'rgba(52,211,153,0.03)' }}>
        <div className="flex items-center gap-3 mb-4">
          <Rocket size={20} className="text-emerald-400" aria-hidden="true" />
          <h3 className="font-semibold text-white">Planned next steps</h3>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed mb-4">
          The 7-day outlook today comes from the Open-Meteo CAMS atmospheric model. We plan to train AQI24&rsquo;s own AQI forecasting model, served from a Python backend, and to explore GPU-accelerated inference for larger-scale deployment.
        </p>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { title: 'AQI forecasting model', desc: 'Train an AQI24 model on CPCB station readings to complement the CAMS forecast', icon: Brain, color: '#34d399' },
            { title: 'Python inference backend', desc: 'FastAPI service that loads trained models and serves predictions to the dashboard', icon: Cpu, color: '#22d3ee' },
            { title: 'Operational deployment', desc: 'Containers and orchestration to run larger-scale inference if needed', icon: Layers, color: '#fbbf24' },
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
            { cat: 'ML Experiments', items: ['Python 3.11', 'LightGBM FRP Regressor', 'XGBoost Classifier', 'scikit-learn'] },
            { cat: 'Data Sources', items: ['WAQI API', 'Open-Meteo CAMS', 'NASA FIRMS', 'Sentinel-5P TROPOMI reference'] },
            { cat: 'Infrastructure', items: ['Vite static build', 'Optional FastAPI backend', 'Supabase auth', 'GitHub Actions CI'] },
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
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/research" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-300 transition-all hover:text-white border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50">
          <GitBranch size={16} aria-hidden="true" />
          Research &amp; Data
        </Link>
        <Link to="/research/indicators" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-300 transition-all hover:text-white border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50">
          <Satellite size={16} className="text-cyan-400" aria-hidden="true" />
          Air quality indicators
        </Link>
      </div>

      {/* Footer */}
      <div className="text-center py-6 border-t border-slate-800/40">
        <div className="text-xs font-mono text-slate-600">AQI<span className="text-cyan-400/60">24</span> · Air Quality Intelligence Platform · Built for India</div>
        <div className="text-xs font-mono text-slate-600 mt-2">© 2026 Dino Coders · Built with <Heart size={10} className="inline text-rose-400/60" aria-hidden="true" /> for climate action</div>
      </div>
    </div>
  );
}
