import { Component } from 'react';
import { motion } from 'motion/react';
import { TriangleAlert as AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
    this.setState({ errorInfo: info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.4 }}
          className="min-h-[300px] flex flex-col items-center justify-center p-8 rounded-2xl text-center max-w-lg mx-auto"
          style={{ background: 'rgba(251,113,133,0.04)', border: '1px solid rgba(251,113,133,0.12)' }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)' }}>
            <AlertTriangle size={24} className="text-rose-400" aria-hidden="true" />
          </div>
          <div className="text-base font-semibold text-white mb-1">Something went wrong</div>
          <div className="text-xs text-slate-500 mb-5 max-w-sm">
            {this.state.error?.message || 'An unexpected error occurred while rendering this section.'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 transition-all"
              style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.18)' }}
            >
              <RefreshCw size={12} aria-hidden="true" />
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <RotateCcw size={12} aria-hidden="true" />
              Reload Page
            </button>
          </div>
        </motion.div>
      );
    }
    return this.props.children;
  }
}
