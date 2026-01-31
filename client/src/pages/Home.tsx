import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TimePicker } from "@/components/ScrollWheel";
import { TimetableDisplay } from "@/components/TimetableDisplay";
import { Settings2, BookOpen, ChevronDown, X, Eye, EyeOff, Bell } from "lucide-react";
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
      
      <main ref={calcSectionRef} className="container max-w-lg mx-auto px-4 pt-24 space-y-8 min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-2"
        >
          <h2 className="text-3xl font-display font-bold text-primary tracking-tight">
            Maak jou Rooster
          </h2>
          <p className="text-muted-foreground font-medium">
            Vandag is <span className="text-primary font-bold">Dag {currentDay}</span>
          </p>
        </motion.div>

        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm rounded-3xl">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Kies Begintyd
              </label>
              <TimePicker initialTime={startTime} onTimeChange={setStartTime} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsSubjectsOpen(true)}
                className="rounded-2xl border-primary/20 hover:border-primary h-12 gap-2"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                Vakke
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsSettingsOpen(true)}
                className="rounded-2xl border-primary/20 hover:border-primary h-12 gap-2"
              >
                <Settings2 className="w-4 h-4 text-primary" />
                Verstel
              </Button>
            </div>

            <Button
              onClick={() => setIsCalculated(true)}
              className="w-full h-14 rounded-2xl bg-primary text-gold font-bold text-lg shadow-lg hover:bg-primary/90"
            >
              Wys Rooster
            </Button>
          </CardContent>
        </Card>

        {isCalculated && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClassDetails(!showClassDetails)}
                className="text-muted-foreground hover:text-primary gap-2"
              >
                {showClassDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showClassDetails ? "Versteek Vakke" : "Wys Vakke"}
              </Button>
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
      </main>

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

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
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
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-primary">Verstellings</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Aantal Periodes: {periodCount}</label>
                  <input 
                    type="range" min="1" max="12" value={periodCount} 
                    onChange={(e) => setPeriodCount(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Aantal Pouses: {pouseCount}</label>
                  <div className="flex gap-2">
                    {[0, 1, 2].map(n => (
                      <Button 
                        key={n}
                        variant={pouseCount === n ? "default" : "outline"}
                        onClick={() => setPouseCount(n)}
                        className="flex-1 rounded-xl"
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
                </div>

                {pouseCount > 0 && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pouse Duur: {pouseDuur} min</label>
                    <input 
                      type="range" min="15" max="60" step="5" value={pouseDuur} 
                      onChange={(e) => setPouseDuur(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Eindtyd: {eindTyd}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["13:40", "13:50", "14:00", "14:15", "14:30", "15:00"].map(t => (
                      <Button 
                        key={t}
                        variant={eindTyd === t ? "default" : "outline"}
                        onClick={() => setEindTyd(t)}
                        className="text-xs h-10 rounded-xl"
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-full mt-8 h-14 rounded-2xl bg-primary text-gold font-bold text-lg shadow-lg"
              >
                Pas Toe
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
