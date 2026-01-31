import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TimePicker } from "@/components/ScrollWheel";
import { TimetableDisplay } from "@/components/TimetableDisplay";
import { Settings2, BookOpen, ChevronDown, X, Eye, EyeOff, Bell, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const [showClassDetails, setShowClassDetails] = useState(true);
  const calcSectionRef = useRef<HTMLDivElement>(null);
  
  // Timetable Settings
  const [periodCount, setPeriodCount] = useState(8);
  const [pouseCount, setPouseCount] = useState(1);
  const [pouseDuur, setPouseDuur] = useState(30);
  const [breakAfter, setBreakAfter] = useState(4);
  const [eindTyd, setEindTyd] = useState("13:50");

  // User Subjects (Stored in LocalStorage)
  const [userSubjects, setUserSubjects] = useState<Record<string, UserSubject>>(() => {
    const saved = localStorage.getItem('wesvalia_user_subjects');
    return saved ? JSON.parse(saved) : {};
  });

  const { data: settings } = useQuery<{ currentDay: number }>({
    queryKey: ['/api/settings'],
  });

  const { data: motd } = useQuery<{ content: string }>({
    queryKey: ['/api/message'],
  });

  const currentDay = settings?.currentDay || 1;

  useEffect(() => {
    localStorage.setItem('wesvalia_user_subjects', JSON.stringify(userSubjects));
  }, [userSubjects]);

  const handleSubjectChange = (period: number, field: keyof UserSubject, value: string) => {
    const key = `day${currentDay}_p${period}`;
    setUserSubjects(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { subject: "", room: "", teacher: "" }),
        [field]: value
      }
    }));
  };

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
            className="fixed top-0 left-0 right-0 z-[100] bg-primary text-primary-foreground py-2 px-4 shadow-md flex items-center justify-center gap-3"
          >
            <Bell className="w-4 h-4 text-gold animate-bounce" />
            <p className="text-sm font-medium">{motd.content}</p>
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
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Vandag is <span className="text-primary">Dag {currentDay}</span>
            </p>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSubjectsOpen(true)}
              className="rounded-full hover:bg-primary/10 text-primary"
            >
              <BookOpen className="w-5 h-5" />
            </Button>
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
                  currentDay={currentDay}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Subjects Modal */}
      <AnimatePresence>
        {isSubjectsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-2 z-10">
                <div>
                  <h3 className="text-xl font-bold text-primary">My Vakke - Dag {currentDay}</h3>
                  <p className="text-xs text-muted-foreground">Vul jou vakbesonderhede hier in</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsSubjectsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {Array.from({ length: periodCount }).map((_, i) => {
                  const pNum = i + 1;
                  const key = `day${currentDay}_p${pNum}`;
                  const data = userSubjects[key] || { subject: "", room: "", teacher: "" };
                  
                  return (
                    <div key={pNum} className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-full bg-primary text-gold text-[10px] flex items-center justify-center font-bold">
                          {pNum}
                        </span>
                        <h4 className="text-sm font-bold text-foreground">Periode {pNum}</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Input 
                          placeholder="Vak (bv. Wiskunde)" 
                          value={data.subject}
                          onChange={(e) => handleSubjectChange(pNum, 'subject', e.target.value)}
                          className="bg-white border-none shadow-sm h-10"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input 
                            placeholder="Klas (bv. B1)" 
                            value={data.room}
                            onChange={(e) => handleSubjectChange(pNum, 'room', e.target.value)}
                            className="bg-white border-none shadow-sm h-10"
                          />
                          <Input 
                            placeholder="Onderwyser" 
                            value={data.teacher}
                            onChange={(e) => handleSubjectChange(pNum, 'teacher', e.target.value)}
                            className="bg-white border-none shadow-sm h-10"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button 
                onClick={() => setIsSubjectsOpen(false)}
                className="w-full mt-8 h-14 rounded-2xl bg-primary text-gold font-bold text-lg shadow-lg"
              >
                Klaar
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
