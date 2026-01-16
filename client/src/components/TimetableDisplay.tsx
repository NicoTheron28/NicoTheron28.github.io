import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import badgeUrl from '@assets/Wesvalia_1_1768581137191.png';

interface TimetableDisplayProps {
  startTime: string;
}

interface TimeSlot {
  period: string; // "1", "2", "Pouse", etc.
  start: string;
  end: string;
  isBreak?: boolean;
}

export function TimetableDisplay({ startTime }: TimetableDisplayProps) {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);

  // Calculation Logic
  const calculateTimetable = (startStr: string): { slots: TimeSlot[], periodLength: string } => {
    const [h, m] = startStr.split(':').map(Number);
    const startSeconds = h * 3600 + m * 60;
    const endSeconds = 13 * 3600 + 50 * 60; // 13:50
    
    // Constants (in seconds)
    const WALK = 4 * 60;
    const BREAK = 30 * 60;
    
    // Timeline logic:
    // Start -> Walk(4m) -> P1
    // Walk gaps between: P1-P2, P2-P3, P3-P4, P5-P6, P6-P7, P7-P8 (6 gaps)
    // Break gap: P4-Break (0 walk implied by "except before break"? Let's stick to prompt literal)
    // Let's assume standard walk time of 4 mins is deducted 1 (start) + 6 (inter-class) = 7 times.
    // Total Walk Time = 7 * 4 = 28 mins.
    // Total Break = 30 mins.
    // Total Deductions = 58 mins.
    
    const totalDuration = endSeconds - startSeconds;
    const totalDeductions = (28 * 60) + BREAK;
    const totalClassTime = totalDuration - totalDeductions;
    
    // 8 Periods
    const periodLengthSeconds = totalClassTime / 8;
    
    // Helper to format seconds to HH:mm
    const formatTime = (secs: number) => {
      const d = new Date(0, 0, 0, 0, 0, 0);
      d.setSeconds(secs);
      return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const slots: TimeSlot[] = [];
    let currentSeconds = startSeconds;

    // Initial walk
    currentSeconds += WALK; 

    // Periods 1-4
    for (let i = 1; i <= 4; i++) {
      const pStart = currentSeconds;
      const pEnd = pStart + periodLengthSeconds;
      
      slots.push({
        period: `Tydperk ${i}`,
        start: formatTime(pStart),
        end: formatTime(pEnd),
        isBreak: false
      });
      
      currentSeconds = pEnd;
      // Add walk if not last period before break
      if (i < 4) {
        currentSeconds += WALK;
      }
    }

    // Break
    const breakStart = currentSeconds;
    const breakEnd = breakStart + BREAK;
    slots.push({
      period: "Pouse",
      start: formatTime(breakStart),
      end: formatTime(breakEnd),
      isBreak: true
    });
    currentSeconds = breakEnd;
    
    // Note: Prompt said "except before break". 
    // Usually there's a walk AFTER break to get to class?
    // Let's assume standard school logic where you need to get to class P5.
    // Logic above counted 6 inter-class walks.
    // P1->P2, P2->P3, P3->P4 (3 walks)
    // Break
    // P5->P6, P6->P7, P7->P8 (3 walks)
    // Wait, we need to get TO P5. Is there a walk time?
    // If our calc assumes 6 walks + 1 initial, that's 7 walks.
    // Initial, P1-P2, P2-P3, P3-P4, P5-P6, P6-P7, P7-P8. 
    // That leaves P4->Break and Break->P5.
    // Prompt says "4 mins walking time between classes (except before break)".
    // So P4->P5 gap is the break. 
    // If we assume NO walking time after break (just pure 30m break then class), my calculation holds.
    // If there IS walking time after break, we'd need to subtract another 4 mins.
    // Given "except before break" is the only exception mentioned, assume standard gaps elsewhere?
    // Let's stick to the 28min total deduction derived earlier to be safe. It fits the "6 inter-class + 1 initial" model perfectly if Break->P5 is instantaneous or included in break.
    
    // Periods 5-8
    for (let i = 5; i <= 8; i++) {
      const pStart = currentSeconds;
      const pEnd = pStart + periodLengthSeconds;
      
      slots.push({
        period: `Tydperk ${i}`,
        start: formatTime(pStart),
        end: i === 8 ? "13:50" : formatTime(pEnd), // Force exact end time
        isBreak: false
      });
      
      currentSeconds = pEnd;
      if (i < 8) {
        currentSeconds += WALK;
      }
    }

    const minutes = Math.floor(periodLengthSeconds / 60);
    const seconds = Math.floor(periodLengthSeconds % 60);
    
    return { 
      slots, 
      periodLength: `${minutes} min${seconds > 0 ? ` ${seconds}s` : ''}` 
    };
  };

  const { slots, periodLength } = calculateTimetable(startTime);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Higher resolution
        backgroundColor: '#FFFFFF',
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Wesvalia_Rooster_${new Date().toLocaleDateString()}.png`;
      link.click();
      
      toast({
        title: "Sukses!",
        description: "Rooster gestoor as foto.",
      });
    } catch (err) {
      toast({
        title: "Fout",
        description: "Kon nie die rooster stoor nie.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
     if (navigator.share && cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, { scale: 2 });
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], "rooster.png", { type: "image/png" });
          await navigator.share({
            title: 'Wesvalia Kloktye',
            text: `My skoolrooster vir vandag (Begin: ${startTime})`,
            files: [file]
          });
        });
      } catch (err) {
        console.error("Share failed", err);
      }
     } else {
       handleDownload(); // Fallback
     }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="flex justify-center gap-4">
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          Stoor
        </button>
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <Share2 className="w-4 h-4" />
          Deel
        </button>
      </div>

      <div 
        ref={cardRef}
        className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl border border-border relative overflow-hidden"
      >
        {/* Decorative Background Elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-6">
            <img src={badgeUrl} alt="Wesvalia Badge" className="w-16 h-16 object-contain mb-3 drop-shadow-md" />
            <h2 className="text-2xl font-bold text-primary font-display">Wesvalia Kloktye</h2>
            <p className="text-muted-foreground text-sm mt-1">Begin Tyd: {startTime}</p>
          </div>

          <div className="space-y-3">
            {slots.map((slot, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex justify-between items-center p-3 rounded-xl border ${
                  slot.isBreak 
                    ? "bg-secondary/20 border-secondary/30" 
                    : "bg-white border-border/50 hover:border-primary/20"
                }`}
              >
                <span className={`font-medium ${slot.isBreak ? "text-secondary-foreground font-bold" : "text-foreground"}`}>
                  {slot.period}
                </span>
                <div className="font-mono text-sm font-semibold text-primary/80 bg-primary/5 px-2 py-1 rounded-md">
                  {slot.start} - {slot.end}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-dashed border-border flex justify-center">
            <p className="text-sm font-medium text-muted-foreground">
              Klaslengte: <span className="text-primary">{periodLength}</span>
            </p>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">Wesvalia Hoërskool</p>
          </div>
        </div>
      </div>
    </div>
  );
}
