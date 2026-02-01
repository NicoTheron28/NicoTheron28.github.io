import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SUBJECTS_LIST = [
  "Afrikaans",
  "Engels",
  "Wiskunde",
  "Lewenswetenskappe",
  "Fisiesewetenskappe",
  "LO",
  "Ekonomie",
  "Kuns",
  "Musiek",
  "IT"
];

const COLORS = [
  { name: "Maroon", value: "#800000" },
  { name: "Goud", value: "#FFD700" },
  { name: "Swart", value: "#000000" },
  { name: "Wit", value: "#FFFFFF" },
  { name: "Grys", value: "#808080" },
  { name: "Blou", value: "#0000FF" },
  { name: "Groen", value: "#008000" },
  { name: "Rooi", value: "#FF0000" },
];

interface SubjectEntry {
  subject: string;
  color: string;
}

export default function Subjects() {
  const [activeDay, setActiveDay] = useState(1);
  const [subjects, setSubjects] = useState<Record<string, SubjectEntry>>(() => {
    const saved = localStorage.getItem('wesvalia_user_subjects_v2');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('wesvalia_user_subjects_v2', JSON.stringify(subjects));
  }, [subjects]);

  const handleSubjectChange = (day: number, period: number, field: keyof SubjectEntry, value: string) => {
    const key = `day${day}_p${period}`;
    setSubjects(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { subject: "", color: "#FFFFFF" }),
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-primary font-display">My Vakke</h1>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3, 4, 5, 6].map(day => (
            <Button
              key={day}
              variant={activeDay === day ? "default" : "outline"}
              onClick={() => setActiveDay(day)}
              className="shrink-0 rounded-full"
            >
              Dag {day}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => {
            const pNum = i + 1;
            const key = `day${activeDay}_p${pNum}`;
            const data = subjects[key] || { subject: "", color: "#FFFFFF" };

            return (
              <motion.div
                key={`${activeDay}-${pNum}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-white border border-border shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-gold text-[10px] flex items-center justify-center font-bold">
                      {pNum}
                    </span>
                    <h4 className="text-sm font-bold text-foreground">Periode {pNum}</h4>
                  </div>
                  <div 
                    className="w-6 h-6 rounded-full border border-border" 
                    style={{ backgroundColor: data.color }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Select 
                    value={data.subject} 
                    onValueChange={(val) => handleSubjectChange(activeDay, pNum, 'subject', val)}
                  >
                    <SelectTrigger className="bg-muted/30 border-none h-10 text-xs">
                      <SelectValue placeholder="Kies Vak" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS_LIST.map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={data.color} 
                    onValueChange={(val) => handleSubjectChange(activeDay, pNum, 'color', val)}
                  >
                    <SelectTrigger className="bg-muted/30 border-none h-10 text-xs">
                      <SelectValue placeholder="Kleur" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLORS.map(color => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: color.value }} />
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xs px-4">
          <Link href="/">
            <Button className="w-full h-14 rounded-full bg-primary text-gold font-bold text-lg shadow-xl flex items-center gap-2">
              <Save className="w-5 h-5" />
              Stoor Vakke
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
