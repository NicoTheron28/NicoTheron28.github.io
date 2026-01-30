import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Settings2, Minus, Plus, Bell } from 'lucide-react';
import { TimePicker } from '@/components/ScrollWheel';
import { TimetableDisplay } from '@/components/TimetableDisplay';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const [startTime, setStartTime] = useState("07:30");
  const [isCalculated, setIsCalculated] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced Settings State
  const [pouseCount, setPouseCount] = useState(1);
  const [pouseDuur, setPouseDuur] = useState(30);
  const [eindTyd, setEindTyd] = useState("13:50");
  const [periodCount, setPeriodCount] = useState(8);
  const [breakAfter, setBreakAfter] = useState(4); // Default break after period 4

  const calcSectionRef = useRef<HTMLDivElement>(null);

  const { data: motd } = useQuery<{ content: string }>({
    queryKey: ['/api/message'],
  });

  const handleScrollDown = () => {
    calcSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCalculate = () => {
    setIsCalculated(true);
  };

  return (
    <div className="min-h-screen bg-background font-body overflow-x-hidden">
      {/* MOTD Banner */}
      <AnimatePresence>
        {motd?.content && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-primary text-primary-foreground py-2 px-4 shadow-md flex items-center justify-center gap-3"
          >
            <Bell className="w-4 h-4 text-gold animate-bounce" />
            <p className="text-sm font-medium">{motd.content}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1: HERO */}
      <section className="h-screen flex flex-col items-center justify-center py-12 px-4 relative">
        {/* Main Title */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold text-primary tracking-tight">
            Wesvalia
          </h1>
          <h1 className="text-4xl md:text-6xl font-display text-primary/80 italic">
            Kloktye
          </h1>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          onClick={handleScrollDown}
          className="cursor-pointer flex flex-col items-center gap-2 mb-8 text-muted-foreground hover:text-primary transition-colors absolute bottom-12"
        >
          <span className="text-xs uppercase tracking-widest font-medium">Begin</span>
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* SECTION 2: CALCULATOR */}
      <section 
        ref={calcSectionRef}
        className="min-h-screen py-12 px-4 bg-muted/30 flex flex-col items-center justify-start pt-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            {!isCalculated ? (
              <motion.div
                key="input"
                exit={{ opacity: 0, y: -50, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-display font-semibold text-foreground">Kies Begin Tyd</h2>
                  <p className="text-muted-foreground">Kies hoe laat die skooldag begin het.</p>
                </div>

                <div className="py-4">
                  <TimePicker 
                    initialTime={startTime} 
                    onTimeChange={setStartTime} 
                  />
                </div>

                {/* Advanced Settings Toggle */}
                <div className="w-full">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4 mx-auto"
                  >
                    <Settings2 className={`w-4 h-4 transition-transform duration-300 ${showAdvanced ? 'rotate-90' : ''}`} />
                    Gevorderde Stellings
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white rounded-2xl p-4 border border-border shadow-sm space-y-4 mb-6"
                      >
                        {/* Pouses Count */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aantal Pouses</label>
                          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-1">
                            <button 
                              onClick={() => setPouseCount(Math.max(0, pouseCount - 1))}
                              className="p-2 hover:bg-white rounded-md transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-display font-bold text-primary">{pouseCount}</span>
                            <button 
                              onClick={() => setPouseCount(Math.min(2, pouseCount + 1))}
                              className="p-2 hover:bg-white rounded-md transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Period Count */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aantal Periodes</label>
                          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-1">
                            <button 
                              onClick={() => {
                                const newCount = Math.max(1, periodCount - 1);
                                setPeriodCount(newCount);
                                if (breakAfter > newCount) setBreakAfter(newCount);
                              }}
                              className="p-2 hover:bg-white rounded-md transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-display font-bold text-primary">{periodCount}</span>
                            <button 
                              onClick={() => setPeriodCount(Math.min(12, periodCount + 1))}
                              className="p-2 hover:bg-white rounded-md transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Break Position - Animated Pop Up */}
                        <AnimatePresence>
                          {pouseCount > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="space-y-2 overflow-hidden"
                            >
                              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {pouseCount === 1 ? "Pouse na periode" : "Eerste pouse na periode"}
                              </label>
                              <div className="flex items-center justify-between bg-muted/50 rounded-lg p-1">
                                <button 
                                  onClick={() => setBreakAfter(Math.max(1, breakAfter - 1))}
                                  className="p-2 hover:bg-white rounded-md transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-display font-bold text-primary">{breakAfter}</span>
                                <button 
                                  onClick={() => setBreakAfter(Math.min(periodCount - 1, breakAfter + 1))}
                                  className="p-2 hover:bg-white rounded-md transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Pouse Duur */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-end">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duur van Pouse</label>
                            <span className="text-sm font-display font-bold text-primary">{pouseDuur} min</span>
                          </div>
                          <input 
                            type="range" 
                            min="15" 
                            max="60" 
                            step="5"
                            value={pouseDuur}
                            onChange={(e) => setPouseDuur(parseInt(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>

                        {/* Eindtyd */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Eintyd v Dag</label>
                          <div className="flex justify-center">
                            <input 
                              type="time"
                              value={eindTyd}
                              onChange={(e) => setEindTyd(e.target.value)}
                              className="w-full max-w-[120px] bg-muted/50 rounded-lg p-2 font-mono text-center font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={handleCalculate}
                  className="px-8 py-4 bg-primary text-gold rounded-full text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all active:scale-95 text-primary-foreground w-full max-w-xs"
                >
                  Bereken Rooster
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="w-full"
              >
                 <div className="flex justify-center mb-8">
                   <button 
                     onClick={() => setIsCalculated(false)}
                     className="text-sm text-muted-foreground hover:text-primary underline decoration-dotted underline-offset-4"
                   >
                     Verander Stellings
                   </button>
                 </div>
                 <TimetableDisplay 
                   startTime={startTime} 
                   pouseCount={pouseCount}
                   pouseDuur={pouseDuur}
                   eindTyd={eindTyd}
                   periodCount={periodCount}
                   breakAfter={breakAfter}
                 />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>
    </div>
  );
}
