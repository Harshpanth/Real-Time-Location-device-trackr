import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import AlertFeed from '../components/Alert/AlertFeed';

export default function Alerts() {
  return (
    <div className="h-full flex flex-col p-6 overflow-auto bg-surface-950">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-semibold text-white flex items-center gap-2">
          <Bell className="text-brand-400" />
          Alerts & Notifications
        </h2>
        <p className="text-sm text-slate-400 mt-1">View your recent geofence activity and device events.</p>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-surface-900 border border-surface-700 rounded-xl p-6"
      >
        <AlertFeed />
      </motion.div>
    </div>
  );
}