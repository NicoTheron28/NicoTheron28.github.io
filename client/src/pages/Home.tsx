import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { TimePicker } from '@/components/ScrollWheel';
import { TimetableDisplay } from '@/components/TimetableDisplay';
import badgeUrl from '@assets/Wesvalia_1_1768581137191.png';

export default function Home() {
  const [startTime, setStartTime] = useState("07:30");
  const [isCalculated, setIsCalculated] = useState(false);
  const calcSectionRef = useRef<HTMLDivElement>(null);

  const handleScrollDown = () => {
    calcSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCalculate = () => {
    setIsCalculated(true);
  };

  return (
    <div className="min-h-screen bg-background font-body overflow-x-hidden">
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
          className="cursor-pointer flex flex-col items-center gap-2 mb-8 text-muted-foreground hover:text-primary transition-colors"
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
                className="flex flex-col items-center gap-8"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-display font-semibold text-foreground">Kies Begin Tyd</h2>
                  <p className="text-muted-foreground">Kies hoe laat die skooldag begin het.</p>
                </div>

                <div className="py-8">
                  <TimePicker 
                    initialTime={startTime} 
                    onTimeChange={setStartTime} 
                  />
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
                     Verander Tyd
                   </button>
                 </div>
                 <TimetableDisplay startTime={startTime} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>
    </div>
  );
}
