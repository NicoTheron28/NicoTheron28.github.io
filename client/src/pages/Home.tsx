import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { TimePicker } from "@/components/ScrollWheel";
import { TimetableDisplay } from "@/components/TimetableDisplay";
import { Settings2, BookOpen, ChevronDown, Eye, EyeOff, Bell, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface UserSubject {
  subject: string;
  room: string;
  teacher: string;
}

export default function Home() {
  const [startTime, setStartTime] = useState("07:30");
  const [isCalculated, setIsCalculated] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showClassDetails, setShowClassDetails] = useState(true);
  const calcSectionRef = useRef<HTMLDivElement>(null);
  
  // Timetable Settings
  const [periodCount, setPeriodCount] = useState(8);
  const [pouseCount, setPouseCount] = useState(1);
  const [pouseDuur, setPouseDuur] = useState(30);
  const [breakAfter, setBreakAfter] = useState(4);
  const [eindTyd, setEindTyd] = useState("13:50");
  const [startPeriod, setStartPeriod] = useState(1);
  const [endPeriod, setEndPeriod] = useState(8);

  // User Subjects (Stored in LocalStorage)
  const [userSubjects] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('wesvalia_user_subjects_v2');
    return saved ? JSON.parse(saved) : {};
  });

  const { data: settings } = useQuery<{ currentDay: number, startTime: string, endTime: string, startPeriod: number, endPeriod: number }>({
    queryKey: ['/api/settings'],
  });

  const [localDay, setLocalDay] = useState<number>(1);

  const { data: motd } = useQuery<{ content: string }>({
    queryKey: ['/api/message'],
  });

  const { data: latestSchedule } = useQuery<any>({
    queryKey: ['/api/get-latest-schedule'],
  });

  useEffect(() => {
    if (settings?.currentDay) {
      setLocalDay(settings.currentDay);
    }
  }, [settings]);

  useEffect(() => {
    const activeData = latestSchedule || settings;
    if (activeData?.startTime) {
      setStartTime(activeData.startTime);
    }
    if (activeData?.endTime) {
      setEindTyd(activeData.endTime);
    }
    
    // Handle the "periods" string (e.g. "5-8")
    if (latestSchedule?.periods) {
      const [start, end] = latestSchedule.periods.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        setStartPeriod(start);
        setEndPeriod(end);
        setPeriodCount(end - start + 1);
      }
    } else if (settings?.startPeriod && settings?.endPeriod) {
      setStartPeriod(settings.startPeriod);
      setEndPeriod(settings.endPeriod);
      setPeriodCount(settings.endPeriod - settings.startPeriod + 1);
    }
  }, [settings, latestSchedule]);

  const handleScrollDown = () => {
    calcSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden">
      <AnimatePresence>
        {motd?.content && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-primary text-primary-foreground py-2 px-4 shadow-md flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 justify-center flex-1">
              <Bell className="w-4 h-4 text-gold animate-bounce" />
              <p className="text-sm font-medium">{motd.content}</p>
            </div>
            <Link href="/vakke">
              <Button variant="ghost" size="icon" className="rounded-full text-gold hover:bg-white/10 shrink-0">
                <BookOpen className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="h-screen flex flex-col items-center justify-center py-12 px-4 relative">
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
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex items-center gap-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Vandag is
              </p>
              <Select value={localDay.toString()} onValueChange={(v) => setLocalDay(parseInt(v))}>
                <SelectTrigger className="h-7 w-24 bg-primary/10 border-none text-primary font-bold text-xs uppercase tracking-widest">
                  <SelectValue placeholder="Dag" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((day) => (
                    <SelectItem key={day} value={day.toString()} className="text-xs uppercase tracking-widest">
                      Dag {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
                  <p className="text-muted-foreground text-sm">Kies hoe laat die skooldag begin het.</p>
                </div>

                <div className="py-4">
                  <TimePicker 
                    initialTime={startTime} 
                    onTimeChange={setStartTime} 
                  />
                </div>

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

                        <div className="space-y-2">
                          <div className="flex justify-between items-end">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duur van Pouse</label>
                            <span className="text-sm font-display font-bold text-primary">{pouseDuur} min</span>
                          </div>
                          <input 
                            type="range" min="15" max="60" step="5"
                            value={pouseDuur}
                            onChange={(e) => setPouseDuur(parseInt(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>

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
                  onClick={() => setIsCalculated(true)}
                  className="px-8 py-4 bg-primary text-gold rounded-full text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all active:scale-95 w-full max-w-xs"
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
                className="w-full space-y-6"
              >
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => setIsCalculated(false)}
                    className="text-sm text-muted-foreground hover:text-primary underline decoration-dotted underline-offset-4"
                  >
                    Verander Stellings
                  </button>
                  <button 
                    onClick={() => setShowClassDetails(!showClassDetails)}
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1.5"
                  >
                    {showClassDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showClassDetails ? "Versteek" : "Wys"}
                  </button>
                </div>

                <TimetableDisplay 
                  startTime={startTime} 
                  periodCount={periodCount}
                  pouseCount={pouseCount}
                  pouseDuur={pouseDuur}
                  breakAfter={breakAfter}
                  eindTyd={eindTyd}
                  userSubjects={showClassDetails ? userSubjects : {}}
                  currentDay={localDay}
                  startPeriodOffset={startPeriod}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

    </div>
  );
}
