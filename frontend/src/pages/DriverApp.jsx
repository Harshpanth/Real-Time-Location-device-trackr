import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Activity, Navigation2, CheckCircle2, XCircle, AlertCircle, MapPin, Signal } from 'lucide-react';

export default function DriverApp() {
  const [searchParams] = useSearchParams();
  const queryKey = searchParams.get('key');
  
  const [deviceKey, setDeviceKey] = useState(queryKey || localStorage.getItem('trackr_driver_key') || '');

  useEffect(() => {
    if (queryKey) {
      localStorage.setItem('trackr_driver_key', queryKey);
    }
  }, [queryKey]);
  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState('offline'); // offline, connecting, online, error
  const [errorMsg, setErrorMsg] = useState('');
  
  const [stats, setStats] = useState({ lat: 0, lng: 0, speed: 0, accuracy: 0 });
  const [sessionData, setSessionData] = useState({ updates: 0, startTime: null });

  const socketRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => stopTracking();
  }, []);

  const startTracking = () => {
    if (!deviceKey.trim()) {
      setErrorMsg('Please enter a valid Device Key');
      return;
    }
    
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      return;
    }

    localStorage.setItem('trackr_driver_key', deviceKey);
    setStatus('connecting');
    setErrorMsg('');

    // Connect to Socket.IO backend with Device Key (matching simulator logic)
    // Connecting to "/" means it uses the Vite proxy or same-origin in production
    socketRef.current = io('/', {
      auth: { deviceKey: deviceKey },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });

    socketRef.current.on('connect', () => {
      setStatus('online');
      setSessionData({ updates: 0, startTime: new Date() });
      
      // Start GPS Watch
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed, accuracy, heading, altitude } = position.coords;
          
          setStats({ lat: latitude, lng: longitude, speed, accuracy });
          setSessionData(prev => ({ ...prev, updates: prev.updates + 1 }));

          // Emit to backend exactly like simulator
          socketRef.current.emit('location:update', {
            lat: latitude,
            lng: longitude,
            speed: (speed || 0), // speed is in m/s
            accuracy: (accuracy || 0),
            heading: (heading || 0),
            altitude: (altitude || 0)
          });
        },
        (error) => {
          console.error(error);
          if (error.code === 1) {
            setErrorMsg('GPS Permission Denied. Please allow location access in your browser settings.');
            stopTracking();
          } else {
            setErrorMsg(`GPS Error: ${error.message}`);
          }
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    });

    socketRef.current.on('connect_error', (err) => {
      setStatus('error');
      setErrorMsg(`Connection Failed: ${err.message}`);
      stopTracking(true);
    });

    socketRef.current.on('disconnect', () => {
      if (status === 'online') {
         setStatus('offline');
      }
    });

    setIsTracking(true);
  };

  const stopTracking = (keepError = false) => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsTracking(false);
    setStatus('offline');
    if (!keepError) setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background ambient light */}
      <div className={`absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-20 pointer-events-none transition-colors duration-1000 ${status === 'online' ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900 via-gray-950 to-gray-950' : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-gray-950 to-gray-950'}`}></div>

      <div className="flex-1 w-full max-w-md mx-auto p-6 flex flex-col items-center justify-center relative z-10 space-y-8">
        
        {/* Header */}
        <div className="text-center w-full">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-2">Driver Tracker</h1>
          <p className="text-sm text-gray-400">Broadcast physical GPS to dashboard</p>
        </div>

        {/* Status Indicator */}
        <div className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-full border ${
          status === 'online' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
          status === 'connecting' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
          status === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
          'bg-gray-800/50 border-gray-700 text-gray-500'
        }`}>
          {status === 'online' && <CheckCircle2 className="w-5 h-5 animate-pulse" />}
          {status === 'connecting' && <Activity className="w-5 h-5 animate-spin" />}
          {status === 'error' && <XCircle className="w-5 h-5" />}
          {status === 'offline' && <Signal className="w-5 h-5" />}
          <span className="font-medium tracking-wide uppercase text-sm">
            {status}
          </span>
        </div>

        {/* Input Card */}
        <div className="w-full bg-gray-900/60 backdrop-blur-md rounded-2xl p-6 border border-gray-800 shadow-xl">
          <label className="block text-sm font-medium text-gray-400 mb-2">Device Key</label>
          <input
            type="text"
            value={deviceKey}
            onChange={(e) => setDeviceKey(e.target.value)}
            disabled={isTracking}
            placeholder="Paste device key here..."
            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50"
          />

          {errorMsg && (
            <div className="mt-4 flex items-start space-x-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            {isTracking ? (
              <button
                onClick={() => stopTracking()}
                className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold transition shadow-lg shadow-red-500/20"
              >
                <XCircle className="w-6 h-6" />
                <span>Stop Sharing</span>
              </button>
            ) : (
              <button
                onClick={startTracking}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition shadow-lg shadow-blue-500/20 group"
              >
                <Navigation2 className="w-6 h-6 group-hover:animate-bounce" />
                <span>Start Sharing Location</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Card (Only shown when tracking) */}
        {isTracking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-gray-900/60 backdrop-blur-md rounded-2xl p-5 border border-gray-800 shadow-xl grid grid-cols-2 gap-4"
          >
            <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800">
              <div className="text-gray-400 text-xs uppercase font-semibold mb-1 tracking-wider">Speed</div>
              <div className="text-2xl text-white font-mono">
                {stats.speed !== null ? (stats.speed * 3.6).toFixed(1) : '0.0'}
                <span className="text-sm font-sans ml-1 text-gray-500">km/h</span>
              </div>
            </div>
            <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800">
              <div className="text-gray-400 text-xs uppercase font-semibold mb-1 tracking-wider">Accuracy</div>
              <div className="text-2xl text-white font-mono">
                {stats.accuracy !== null ? stats.accuracy.toFixed(0) : '-'}
                <span className="text-sm font-sans ml-1 text-gray-500">m</span>
              </div>
            </div>
            <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800 col-span-2 flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-xs uppercase font-semibold mb-1 tracking-wider flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>Current Pos</span>
                </div>
                <div className="text-sm text-gray-300 font-mono">
                  {stats.lat ? stats.lat.toFixed(6) : 'Searching...'},<br/>
                  {stats.lng ? stats.lng.toFixed(6) : ''}
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-xs uppercase font-semibold mb-1 tracking-wider">Updates</div>
                <div className="text-lg text-white font-mono">{sessionData.updates}</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
