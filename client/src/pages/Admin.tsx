import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Lock, Save, MessageSquare, CalendarDays, Settings2, Minus, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Settings {
  currentDay: number;
  startTime: string;
  endTime: string;
  startPeriod: number;
  endPeriod: number;
  pouseCount: number;
  pouseDuur: number;
  breakAfter: number;
}

export default function Admin() {
  const [adminKey, setAdminKey] = useState("");
  const [content, setContent] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("1");
  const [startTime, setStartTime] = useState("07:30");
  const [endTime, setEndTime] = useState("13:50");
  const [startPeriod, setStartPeriod] = useState<number>(1);
  const [endPeriod, setEndPeriod] = useState<number>(8);
  const [pouseCount, setPouseCount] = useState<number>(1);
  const [pouseDuur, setPouseDuur] = useState<number>(30);
  const [breakAfter, setBreakAfter] = useState<number>(4);
  const { toast } = useToast();

  const { data: motd } = useQuery<{ content: string }>({
    queryKey: ['/api/message'],
  });

  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  useEffect(() => {
    if (settings) {
      setSelectedDay(settings.currentDay.toString());
      setStartTime(settings.startTime || "07:30");
      setEndTime(settings.endTime || "13:50");
      setStartPeriod(settings.startPeriod || 1);
      setEndPeriod(settings.endPeriod || 8);
      setPouseCount(settings.pouseCount ?? 1);
      setPouseDuur(settings.pouseDuur ?? 30);
      setBreakAfter(settings.breakAfter ?? 4);
    }
  }, [settings]);

  const messageMutation = useMutation({
    mutationFn: async (data: { content: string; adminKey: string }) => {
      const res = await apiRequest("POST", "/api/message", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/message"] });
      if (data && data.content) {
        localStorage.setItem('wesvalia_motd', JSON.stringify(data));
      }
      toast({ title: "Sukses!", description: "Boodskap is opgedateer." });
    },
    onError: () => {
      toast({ title: "Fout", description: "Ongeldige wagwoord of bedienerfout.", variant: "destructive" });
    },
  });

  const settingsMutation = useMutation({
    mutationFn: async (data: { day: number; startTime: string; endTime: string; startPeriod: number; endPeriod: number; pouseCount: number; pouseDuur: number; breakAfter: number; adminKey: string }) => {
      const res = await apiRequest("POST", "/api/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Sukses!", description: "Rooster-instellings opgedateer." });
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon nie instellings opdateer nie.", variant: "destructive" });
    },
  });

  const handleUpdateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    messageMutation.mutate({ content, adminKey });
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    settingsMutation.mutate({
      day: parseInt(selectedDay),
      startTime,
      endTime,
      startPeriod,
      endPeriod,
      pouseCount,
      pouseDuur,
      breakAfter,
      adminKey,
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        <Card className="border-border shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-display font-bold text-primary">
              Admin Paneel
            </CardTitle>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-2">
                <Lock className="w-3 h-3" /> Admin Wagwoord
              </label>
              <Input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Tik jou geheime sleutel in"
                className="bg-muted/50 text-center"
                required
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-8">

            {/* Rooster Instellings */}
            <form onSubmit={handleUpdateSettings} className="space-y-5 pt-6 border-t border-border">
              <div className="flex items-center gap-2 mb-1">
                <Settings2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rooster Instellings</span>
              </div>

              {/* Current Day */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <CalendarDays className="w-3 h-3" /> Vandag se Dag
                </label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="bg-muted/50 border-none font-bold text-primary">
                    <SelectValue placeholder="Kies Dag" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        Dag {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start & End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Begin Tyd</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-muted/50 rounded-lg p-2 font-mono text-center font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Eind Tyd</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-muted/50 rounded-lg p-2 font-mono text-center font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                  />
                </div>
              </div>

              {/* Start & End Period */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Begin Periode</label>
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-1 border border-border">
                    <button type="button" onClick={() => setStartPeriod(Math.max(1, startPeriod - 1))} className="p-2 hover:bg-white rounded-md transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-display font-bold text-primary text-sm">{startPeriod}</span>
                    <button type="button" onClick={() => setStartPeriod(Math.min(endPeriod, startPeriod + 1))} className="p-2 hover:bg-white rounded-md transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Eind Periode</label>
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-1 border border-border">
                    <button type="button" onClick={() => setEndPeriod(Math.max(startPeriod, endPeriod - 1))} className="p-2 hover:bg-white rounded-md transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-display font-bold text-primary text-sm">{endPeriod}</span>
                    <button type="button" onClick={() => setEndPeriod(Math.min(12, endPeriod + 1))} className="p-2 hover:bg-white rounded-md transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pouse Count */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aantal Pouses</label>
                <div className="flex items-center justify-between bg-muted/50 rounded-lg p-1 border border-border">
                  <button type="button" onClick={() => setPouseCount(Math.max(0, pouseCount - 1))} className="p-2 hover:bg-white rounded-md transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-display font-bold text-primary">{pouseCount}</span>
                  <button type="button" onClick={() => setPouseCount(Math.min(2, pouseCount + 1))} className="p-2 hover:bg-white rounded-md transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {pouseCount > 0 && (
                <>
                  {/* Break After */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {pouseCount === 1 ? "Pouse Na Periode" : "Eerste Pouse Na Periode"}
                    </label>
                    <div className="flex items-center justify-between bg-muted/50 rounded-lg p-1 border border-border">
                      <button type="button" onClick={() => setBreakAfter(Math.max(1, breakAfter - 1))} className="p-2 hover:bg-white rounded-md transition-colors">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-display font-bold text-primary">{breakAfter}</span>
                      <button type="button" onClick={() => setBreakAfter(Math.min(8, breakAfter + 1))} className="p-2 hover:bg-white rounded-md transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Pouse Duur */}
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
                </>
              )}

              <Button
                type="submit"
                className="w-full bg-primary text-gold hover:bg-primary/90"
                disabled={settingsMutation.isPending}
              >
                {settingsMutation.isPending ? "Besig..." : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Stoor Rooster Instellings
                  </>
                )}
              </Button>
            </form>

            {/* MOTD Update */}
            <form onSubmit={handleUpdateMessage} className="space-y-4 pt-6 border-t border-border">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> Boodskap van die Dag
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={motd?.content || "Tik die nuwe boodskap hier..."}
                  className="min-h-[100px] bg-muted/50"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-gold hover:bg-primary/90"
                disabled={messageMutation.isPending}
              >
                {messageMutation.isPending ? "Besig..." : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Opdateer Boodskap
                  </>
                )}
              </Button>
            </form>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
