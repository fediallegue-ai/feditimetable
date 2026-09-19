import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  BookOpen,
  Hammer,
  Dumbbell,
  BookMarked,
  Users,
  ChevronRight,
  Check,
  Clock,
  MapPin,
  Home,
  X,
  Flame,
  Plus,
  Trash2,
  CalendarDays,
  ClipboardList,
  Target,
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/* Static data: fixed weekly commitments                                   */
/* ---------------------------------------------------------------------- */

const DAYS = [
  { key: "mon", label: "Mon", full: "Monday" },
  { key: "tue", label: "Tue", full: "Tuesday" },
  { key: "wed", label: "Wed", full: "Wednesday" },
  { key: "thu", label: "Thu", full: "Thursday" },
  { key: "fri", label: "Fri", full: "Friday" },
  { key: "sat", label: "Sat", full: "Saturday" },
  { key: "sun", label: "Sun", full: "Sunday" },
];

const WEEK = {
  mon: {
    wake: "06:45",
    leave: "07:30",
    blocks: [
      { time: "08:30–10:00", course: "Réseaux Multimédia", room: "Amphi", type: "Cours" },
      { time: "10:05–11:35", course: "Graphes et optimisation", room: "C4", type: "TD" },
      { time: "12:15–13:45", course: "Théorie de l'Information", room: "Labo17", type: "Cours" },
      { time: "13:50–15:20", course: "Théorie des langages et des Automates", room: "Labo2", type: "Cours" },
    ],
    home: "~16:00",
  },
  tue: {
    wake: "06:45",
    leave: "07:30",
    blocks: [
      { time: "08:30–10:00", course: "Probabilité et statistique", room: "Amphi", type: "Cours" },
      { time: "12:15–13:45", course: "Services des Réseaux", room: "Amphi", type: "Cours" },
      { time: "13:50–15:20", course: "Probabilité et statistique", room: "Labo18", type: "TD" },
    ],
    home: "~16:00",
    note: "Long gap 10:00–12:15 on campus",
  },
  wed: {
    wake: "06:45",
    leave: "07:30",
    blocks: [
      { time: "08:30–10:00", course: "Ingénierie des Bases de Données", room: "C8", type: "Cours" },
      { time: "10:05–11:35", course: "Conception des Systèmes d'Information", room: "C9", type: "Cours" },
      { time: "12:15–13:45", course: "Théorie des langages et des Automates", room: "C1", type: "TD" },
    ],
    home: "~14:25",
  },
  thu: { free: true },
  fri: {
    wake: "06:45",
    leave: "07:30",
    blocks: [
      { time: "08:30–10:00", course: "Conception des Systèmes d'Information", room: "C10", type: "TD" },
      { time: "10:05–11:35", course: "Graphes et optimisation", room: "Labo13", type: "TD" },
      { time: "12:15–13:45", course: "Programmation Java", room: "C3", type: "TD" },
      { time: "13:50–15:20", course: "Anglais 3", room: "C11", type: "Cours" },
    ],
    home: "~16:00",
  },
  sat: {
    online: true,
    blocks: [
      { time: "10:05–11:35", course: "Ingénierie des Bases de Données", room: "En ligne", type: "TD" },
      { time: "12:15–13:45", course: "Programmation Java", room: "En ligne", type: "TD" },
      { time: "13:50–15:20", course: "Programmation Java", room: "En ligne", type: "TD" },
    ],
  },
  sun: { free: true },
};

const SUBJECTS = [
  "Réseaux Multimédia",
  "Graphes et optimisation",
  "Théorie de l'Information",
  "Théorie des langages et des Automates",
  "Probabilité et statistique",
  "Services des Réseaux",
  "Ingénierie des Bases de Données",
  "Conception des Systèmes d'Information",
  "Programmation Java",
  "Anglais 3",
];

/* ---------------------------------------------------------------------- */
/* RPG layer                                                                */
/* ---------------------------------------------------------------------- */

const STAT_META = {
  wisdom: { label: "Wisdom", color: "#E8B84B", icon: Sparkles, tag: "meditation" },
  intellect: { label: "Intellect", color: "#6FA8DC", icon: BookOpen, tag: "study sessions" },
  craft: { label: "Craft", color: "#C4453D", icon: Hammer, tag: "Godot dev" },
  vitality: { label: "Vitality", color: "#5FBF7A", icon: Dumbbell, tag: "workouts" },
  insight: { label: "Insight", color: "#B98AE0", icon: BookMarked, tag: "reading" },
  bond: { label: "Bond", color: "#E88A6F", icon: Users, tag: "time with people" },
};

const QUESTS = [
  { id: "meditate", label: "Meditate", stat: "wisdom", icon: Sparkles, hasDetail: false, defaultDetail: "Meditation" },
  { id: "study", label: "Study", stat: "intellect", icon: BookOpen, inputType: "select", prompt: "Which subject?" },
  { id: "godot", label: "Godot Dev", stat: "craft", icon: Hammer, hasDetail: false, defaultDetail: "Godot game dev" },
  { id: "workout", label: "Workout", stat: "vitality", icon: Dumbbell, hasDetail: true, prompt: "What kind of workout?" },
  { id: "read", label: "Read", stat: "insight", icon: BookMarked, hasDetail: true, prompt: "What are you reading?" },
  { id: "socialize", label: "Socialize", stat: "bond", icon: Users, hasDetail: true, prompt: "Who / what with?" },
];

const HOME_TASKS = [
  { id: "dinner", label: "Dinner" },
  { id: "dishes", label: "Dishes" },
  { id: "mealprep", label: "Meal prep" },
  { id: "shower", label: "Shower" },
  { id: "teeth", label: "Brush teeth" },
  { id: "skincare", label: "Skincare" },
  { id: "packbag", label: "Prep for tomorrow" },
  { id: "gaming", label: "Gaming" },
  { id: "chill", label: "Chill" },
];

const WEEKLY_TASKS = [
  { id: "tidyroom", label: "Tidy room" },
  { id: "laundry", label: "Laundry" },
  { id: "groceries", label: "Groceries" },
];

const RANKS = [
  { min: 0, title: "Drifter" },
  { min: 8, title: "Initiate" },
  { min: 18, title: "Operative" },
  { min: 32, title: "Adept" },
  { min: 50, title: "Ascendant" },
  { min: 75, title: "Apex" },
];

const DURATIONS = [15, 25, 45, 60, 90];
const DAILY_QUEST_CAP = 3;

/* ---------------------------------------------------------------------- */
/* Helpers                                                                  */
/* ---------------------------------------------------------------------- */

function levelInfo(xp) {
  let level = 1;
  let floorXP = 0;
  let span = 100;
  while (xp >= floorXP + span) {
    floorXP += span;
    level += 1;
    span = 100 + (level - 1) * 40;
  }
  return { level, into: xp - floorXP, span };
}

function todayKey() {
  const map = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[new Date().getDay()];
}

function dateStr(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function sameDate(ts, ds) {
  return dateStr(new Date(ts)) === ds;
}

function diffDays(a, b) {
  const A = new Date(a + "T00:00:00");
  const B = new Date(b + "T00:00:00");
  return Math.round((A - B) / 86400000);
}

function daysUntil(ds) {
  return diffDays(ds, dateStr());
}

function emptyStats() {
  const s = {};
  Object.keys(STAT_META).forEach((k) => (s[k] = { xp: 0 }));
  return s;
}

function emptySubjects() {
  const s = {};
  SUBJECTS.forEach((name) => (s[name] = { confidence: 50 }));
  return s;
}

const STORAGE_KEY = "ascent-state";

/* ---------------------------------------------------------------------- */
/* Component                                                                */
/* ---------------------------------------------------------------------- */

export default function Ascent() {
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState(emptyStats());
  const [log, setLog] = useState([]);
  const [homeTasks, setHomeTasks] = useState({});
  const [weeklyTasks, setWeeklyTasks] = useState({});
  const [subjects, setSubjects] = useState(emptySubjects());
  const [events, setEvents] = useState([]);
  const [homework, setHomework] = useState([]);
  const [streak, setStreak] = useState(0);
  const [lastActiveDate, setLastActiveDate] = useState(null);
  const [lastDecayDate, setLastDecayDate] = useState(null);

  const [activeDay, setActiveDay] = useState(todayKey());
  const [openQuest, setOpenQuest] = useState(null);
  const [detailText, setDetailText] = useState("");
  const [minutes, setMinutes] = useState(25);
  const [flash, setFlash] = useState(null);
  const [showLog, setShowLog] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);
  const [addingHw, setAddingHw] = useState(false);
  const [evTitle, setEvTitle] = useState("");
  const [evDate, setEvDate] = useState("");
  const [hwTitle, setHwTitle] = useState("");
  const [hwSubject, setHwSubject] = useState(SUBJECTS[0]);
  const [hwDue, setHwDue] = useState("");

  const skipSave = useRef(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (res && res.value) {
          const p = JSON.parse(res.value);
          setStats(p.stats || emptyStats());
          setLog(p.log || []);
          setHomeTasks(p.homeTasks || {});
          setWeeklyTasks(p.weeklyTasks || {});
          setSubjects(p.subjects || emptySubjects());
          setEvents(p.events || []);
          setHomework(p.homework || []);

          const today = dateStr();
          let nextStreak = p.streak || 0;
          const lastActive = p.lastActiveDate || null;
          const lastDecay = p.lastDecayDate || null;

          if (lastDecay !== today) {
            if (lastActive) {
              const gap = diffDays(today, lastActive);
              const missed = Math.max(0, gap - 1);
              if (missed > 0) nextStreak = Math.max(0, nextStreak - missed * 0.5);
            }
          }
          setStreak(nextStreak);
          setLastActiveDate(lastActive);
          setLastDecayDate(today);
        } else {
          setLastDecayDate(dateStr());
        }
      } catch (e) {
        setLastDecayDate(dateStr());
      } finally {
        skipSave.current = false;
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (skipSave.current) return;
    (async () => {
      try {
        await window.storage.set(
          STORAGE_KEY,
          JSON.stringify({
            stats,
            log,
            homeTasks,
            weeklyTasks,
            subjects,
            events,
            homework,
            streak,
            lastActiveDate,
            lastDecayDate,
          }),
          false
        );
      } catch (e) {
        /* best effort */
      }
    })();
  }, [stats, log, homeTasks, weeklyTasks, subjects, events, homework, streak, lastActiveDate, lastDecayDate]);

  const totalLevel = Object.keys(stats).reduce((sum, k) => sum + levelInfo(stats[k].xp).level, 0);
  const rank = [...RANKS].reverse().find((r) => totalLevel >= r.min) || RANKS[0];

  const today = dateStr();
  const isThuToday = todayKey() === "thu";
  const questsUsedToday = log.filter((l) => sameDate(l.ts, today)).length;
  const cap = isThuToday ? Infinity : DAILY_QUEST_CAP;
  const capReached = questsUsedToday >= cap;

  function submitQuest(q) {
    if (capReached) return;
    const mins = Math.max(1, Math.min(600, Number(minutes) || 0));
    const detail = q.inputType === "select" ? detailText || SUBJECTS[0] : q.hasDetail ? detailText.trim() || q.label : q.defaultDetail;
    const prevLevel = levelInfo(stats[q.stat].xp).level;

    setStats((prev) => {
      const next = { ...prev, [q.stat]: { xp: prev[q.stat].xp + mins } };
      const newLevel = levelInfo(next[q.stat].xp).level;
      if (newLevel > prevLevel) {
        setFlash({ stat: q.stat, level: newLevel });
        setTimeout(() => setFlash(null), 2200);
      }
      return next;
    });

    setLog((prev) => [{ id: Date.now(), stat: q.stat, label: q.label, detail, minutes: mins, ts: Date.now() }, ...prev].slice(0, 80));

    if (lastActiveDate !== today) {
      setStreak((s) => s + 1);
      setLastActiveDate(today);
    }

    setOpenQuest(null);
    setDetailText("");
    setMinutes(25);
  }

  function toggleHomeTask(id) {
    setHomeTasks((prev) => {
      const day = { ...(prev[today] || {}) };
      day[id] = day[id] ? undefined : Date.now();
      return { ...prev, [today]: day };
    });
  }

  function toggleWeeklyTask(id) {
    setWeeklyTasks((prev) => {
      const wk = { ...(prev[today] || {}) };
      wk[id] = wk[id] ? undefined : Date.now();
      return { ...prev, [today]: wk };
    });
  }

  function adjustConfidence(name, delta) {
    setSubjects((prev) => {
      const cur = prev[name]?.confidence ?? 50;
      const next = Math.max(0, Math.min(100, cur + delta));
      return { ...prev, [name]: { confidence: next } };
    });
  }

  function subjectMinutes(name) {
    return log.filter((l) => l.stat === "intellect" && l.detail === name).reduce((s, l) => s + l.minutes, 0);
  }

  function homeworkDueCount(name) {
    return homework.filter((h) => h.subject === name && !h.done).length;
  }

  function addEvent() {
    if (!evTitle.trim() || !evDate) return;
    setEvents((prev) => [...prev, { id: Date.now(), title: evTitle.trim(), date: evDate }]);
    setEvTitle("");
    setEvDate("");
    setAddingEvent(false);
  }

  function addHomework() {
    if (!hwTitle.trim() || !hwDue) return;
    setHomework((prev) => [...prev, { id: Date.now(), title: hwTitle.trim(), subject: hwSubject, due: hwDue, done: false }]);
    setHwTitle("");
    setHwDue("");
    setAddingHw(false);
  }

  function toggleHomework(id) {
    setHomework((prev) => prev.map((h) => (h.id === id ? { ...h, done: !h.done } : h)));
  }

  function removeEvent(id) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }
  function removeHomework(id) {
    setHomework((prev) => prev.filter((h) => h.id !== id));
  }

  const day = WEEK[activeDay];
  const isToday = activeDay === todayKey();
  const isSundayNow = todayKey() === "sun";

  const todayLog = (() => {
    if (!isToday) return [];
    const items = [];
    log.filter((l) => sameDate(l.ts, today)).forEach((l) => items.push({ ts: l.ts, text: `${l.detail} — +${l.minutes}m ${STAT_META[l.stat].label}`, color: STAT_META[l.stat].color }));
    const dayTasks = homeTasks[today] || {};
    HOME_TASKS.forEach((t) => {
      if (dayTasks[t.id]) items.push({ ts: dayTasks[t.id], text: t.label, color: "#5FBF7A" });
    });
    if (isSundayNow) {
      const wk = weeklyTasks[today] || {};
      WEEKLY_TASKS.forEach((t) => {
        if (wk[t.id]) items.push({ ts: wk[t.id], text: t.label + " (weekly)", color: "#5FBF7A" });
      });
    }
    items.sort((a, b) => a.ts - b.ts);
    return items;
  })();

  const sortedSubjects = [...SUBJECTS].sort((a, b) => (subjects[a]?.confidence ?? 50) - (subjects[b]?.confidence ?? 50));
  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const sortedHomework = [...homework].sort((a, b) => (a.done === b.done ? a.due.localeCompare(b.due) : a.done ? 1 : -1));

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        .asc-display { font-family: 'Anton', sans-serif; letter-spacing: 0.01em; }
        .asc-mono { font-family: 'IBM Plex Mono', monospace; }
        .asc-questbtn { transition: transform 0.15s ease, border-color 0.15s ease; }
        .asc-questbtn:active { transform: scale(0.97); }
        .asc-questbtn:disabled { opacity: 0.35; }
        .asc-bar-fill { transition: width 0.5s ease; }
        @keyframes ascFlash {
          0% { opacity: 0; transform: translateY(6px) scale(0.96); }
          15% { opacity: 1; transform: translateY(0) scale(1); }
          85% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-6px) scale(0.98); }
        }
        .asc-flash { animation: ascFlash 2.2s ease forwards; }
        .asc-scroll::-webkit-scrollbar { display: none; }
        .asc-select { background: #0A0A0A; border: 1px solid #2A2A2A; color: #EDEBE6; border-radius: 3px; padding: 8px 9px; font-size: 12px; width: 100%; }
        .asc-datein { background: #0A0A0A; border: 1px solid #2A2A2A; color: #EDEBE6; border-radius: 3px; padding: 8px 9px; font-size: 12px; width: 100%; }
      `}</style>

      {flash && (
        <div className="asc-flash" style={styles.flashWrap}>
          <div style={{ ...styles.flashCard, borderColor: STAT_META[flash.stat].color }}>
            <span className="asc-mono" style={{ fontSize: 11, color: "#9a9a9a" }}>LEVEL UP</span>
            <span className="asc-display" style={{ fontSize: 22, color: STAT_META[flash.stat].color }}>
              {STAT_META[flash.stat].label} → Lv.{flash.level}
            </span>
          </div>
        </div>
      )}

      {/* header */}
      <div style={styles.header}>
        <div>
          <div className="asc-display" style={styles.title}>ASCENT</div>
          <div className="asc-mono" style={styles.subtitle}>{rank.title} · Rank {totalLevel}</div>
        </div>
        <div style={styles.streakWrap}>
          <Flame size={14} color="#E8894B" />
          <span className="asc-mono" style={{ fontSize: 12, color: "#EDEBE6" }}>{streak.toFixed(1)}</span>
        </div>
      </div>

      {/* stat rail */}
      <div style={styles.statRail} className="asc-scroll">
        {Object.entries(STAT_META).map(([key, meta]) => {
          const info = levelInfo(stats[key].xp);
          const pct = Math.round((info.into / info.span) * 100);
          const Icon = meta.icon;
          return (
            <div key={key} style={styles.statCard}>
              <div style={styles.statTop}>
                <Icon size={14} color={meta.color} />
                <span className="asc-mono" style={{ fontSize: 11, color: "#c9c9c9" }}>Lv.{info.level}</span>
              </div>
              <div className="asc-mono" style={{ fontSize: 12, color: "#EDEBE6", marginTop: 4 }}>{meta.label}</div>
              <div style={styles.barTrack}>
                <div className="asc-bar-fill" style={{ ...styles.barFill, width: `${pct}%`, background: meta.color }} />
              </div>
              <div className="asc-mono" style={{ fontSize: 9, color: "#6B6B6B", marginTop: 3 }}>{meta.tag}</div>
            </div>
          );
        })}
      </div>

      {/* day selector */}
      <div style={styles.dayRow}>
        {DAYS.map((d) => (
          <button
            key={d.key}
            onClick={() => setActiveDay(d.key)}
            className="asc-mono"
            style={{
              ...styles.dayBtn,
              borderColor: activeDay === d.key ? "#B3272C" : "#2A2A2A",
              color: activeDay === d.key ? "#EDEBE6" : "#7A7A7A",
              background: d.key === todayKey() ? "#171010" : "transparent",
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* timeline */}
      <div style={styles.section}>
        <div className="asc-display" style={styles.sectionTitle}>
          {DAYS.find((d) => d.key === activeDay).full}{isToday ? " · TODAY" : ""}
        </div>

        {day.free ? (
          <div className="asc-mono" style={styles.freeNote}>Open day — nothing fixed. Wake up whenever, go straight to the quest board.</div>
        ) : (
          <>
            {day.wake && (
              <div style={styles.timelineRow}>
                <Clock size={13} color="#6B6B6B" />
                <span className="asc-mono" style={styles.timelineTime}>{day.wake}</span>
                <span className="asc-mono" style={styles.timelineLabel}>Wake up</span>
              </div>
            )}
            {day.leave && (
              <div style={styles.timelineRow}>
                <Clock size={13} color="#6B6B6B" />
                <span className="asc-mono" style={styles.timelineTime}>{day.leave}</span>
                <span className="asc-mono" style={styles.timelineLabel}>Leave for uni</span>
              </div>
            )}
            {day.online && (
              <div style={styles.timelineRow}>
                <Clock size={13} color="#6B6B6B" />
                <span className="asc-mono" style={styles.timelineTime}>—</span>
                <span className="asc-mono" style={styles.timelineLabel}>Online — at home</span>
              </div>
            )}
            {day.blocks.map((b, i) => (
              <div key={i} style={styles.timelineRow}>
                <Clock size={13} color="#B3272C" />
                <span className="asc-mono" style={styles.timelineTime}>{b.time}</span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="asc-mono" style={styles.timelineLabel}>{b.course}</span>
                  <span className="asc-mono" style={{ fontSize: 10, color: "#6B6B6B", display: "flex", alignItems: "center", gap: 3 }}>
                    <MapPin size={9} /> {b.room} · {b.type}
                  </span>
                </div>
              </div>
            ))}
            {day.note && <div className="asc-mono" style={styles.dayNote}>{day.note}</div>}

            <div style={styles.slashWrap}>
              <div style={styles.slashLine} />
              <span className="asc-mono" style={styles.slashLabel}>
                <Home size={11} /> {day.online ? "QUEST BOARD OPENS" : `HOME ${day.home}`}
              </span>
              <div style={styles.slashLine} />
            </div>
          </>
        )}

        {/* live "today" log under the home marker */}
        {isToday && todayLog.length > 0 && (
          <div style={{ marginTop: 4 }}>
            {todayLog.map((it, i) => (
              <div key={i} style={styles.timelineRow}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: it.color, marginTop: 4, flexShrink: 0 }} />
                <span className="asc-mono" style={styles.timelineTime}>
                  {new Date(it.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="asc-mono" style={styles.timelineLabel}>{it.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* quest board */}
      <div style={styles.section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div className="asc-display" style={styles.sectionTitle}>Quest Board</div>
          <span className="asc-mono" style={{ fontSize: 10, color: capReached ? "#C4453D" : "#7A7A7A" }}>
            {isThuToday ? "unlimited · thursday" : `${questsUsedToday}/${DAILY_QUEST_CAP} today`}
          </span>
        </div>

        {capReached && (
          <div className="asc-mono" style={styles.freeNote}>
            Daily quests used up. Home tasks, homework and events are still open — rest, or come back tomorrow.
          </div>
        )}

        <div style={styles.questGrid}>
          {QUESTS.map((q) => {
            const meta = STAT_META[q.stat];
            const Icon = q.icon;
            const isOpen = openQuest === q.id;
            return (
              <div key={q.id} style={{ gridColumn: isOpen ? "1 / -1" : "auto" }}>
                <button
                  className="asc-questbtn"
                  disabled={capReached}
                  onClick={() => {
                    setOpenQuest(isOpen ? null : q.id);
                    setDetailText(q.inputType === "select" ? SUBJECTS[0] : "");
                    setMinutes(25);
                  }}
                  style={{ ...styles.questBtn, borderColor: isOpen ? meta.color : "#2A2A2A" }}
                >
                  <Icon size={16} color={meta.color} />
                  <span className="asc-mono" style={styles.questLabel}>{q.label}</span>
                  {isOpen ? <X size={13} color="#7A7A7A" /> : <ChevronRight size={13} color="#4A4A4A" />}
                </button>

                {isOpen && (
                  <div style={{ ...styles.questForm, borderColor: meta.color }}>
                    {q.inputType === "select" && (
                      <select className="asc-select asc-mono" value={detailText} onChange={(e) => setDetailText(e.target.value)}>
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                    {q.hasDetail && (
                      <input
                        className="asc-mono"
                        placeholder={q.prompt}
                        value={detailText}
                        onChange={(e) => setDetailText(e.target.value)}
                        style={styles.input}
                      />
                    )}
                    <div className="asc-mono" style={{ fontSize: 10, color: "#7A7A7A", marginTop: 8 }}>DURATION (minutes)</div>
                    <div style={styles.chipRow}>
                      {DURATIONS.map((d) => (
                        <button
                          key={d}
                          onClick={() => setMinutes(d)}
                          className="asc-mono"
                          style={{ ...styles.chip, borderColor: minutes === d ? meta.color : "#2A2A2A", color: minutes === d ? "#EDEBE6" : "#8A8A8A" }}
                        >
                          {d}
                        </button>
                      ))}
                      <input type="number" className="asc-mono" value={minutes} onChange={(e) => setMinutes(e.target.value)} style={styles.numInput} min={1} max={600} />
                    </div>
                    <button onClick={() => submitQuest(q)} className="asc-mono" style={{ ...styles.logBtn, background: meta.color }}>
                      LOG QUEST · +{minutes} XP
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* home tasks */}
      <div style={styles.section}>
        <div className="asc-display" style={styles.sectionTitle}>Home Tasks</div>
        <div style={styles.homeTaskRow}>
          {HOME_TASKS.map((t) => {
            const done = !!(homeTasks[today] || {})[t.id];
            return (
              <button
                key={t.id}
                onClick={() => toggleHomeTask(t.id)}
                className="asc-mono"
                style={{ ...styles.taskChip, borderColor: done ? "#5FBF7A" : "#2A2A2A", color: done ? "#5FBF7A" : "#8A8A8A" }}
              >
                {done && <Check size={11} />} {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* weekly tasks — sunday only */}
      {activeDay === "sun" && (
        <div style={styles.section}>
          <div className="asc-display" style={styles.sectionTitle}>Weekly Tasks</div>
          {!isSundayNow && (
            <div className="asc-mono" style={{ fontSize: 10, color: "#6B6B6B", marginBottom: 8 }}>Preview — unlocks on Sunday</div>
          )}
          <div style={styles.homeTaskRow}>
            {WEEKLY_TASKS.map((t) => {
              const done = !!(weeklyTasks[today] || {})[t.id];
              return (
                <button
                  key={t.id}
                  disabled={!isSundayNow}
                  onClick={() => toggleWeeklyTask(t.id)}
                  className="asc-mono"
                  style={{ ...styles.taskChip, borderColor: done ? "#5FBF7A" : "#2A2A2A", color: done ? "#5FBF7A" : "#8A8A8A", opacity: isSundayNow ? 1 : 0.5 }}
                >
                  {done && <Check size={11} />} {t.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* subjects dashboard */}
      <div style={styles.section}>
        <div className="asc-display" style={styles.sectionTitle}><Target size={14} style={{ marginRight: 4 }} />Subjects</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sortedSubjects.map((name) => {
            const conf = subjects[name]?.confidence ?? 50;
            const color = conf < 40 ? "#C4453D" : conf < 70 ? "#E8B84B" : "#5FBF7A";
            const mins = subjectMinutes(name);
            const hwCount = homeworkDueCount(name);
            return (
              <div key={name} style={styles.subjectRow}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="asc-mono" style={{ fontSize: 11.5, color: "#EDEBE6" }}>{name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button onClick={() => adjustConfidence(name, -10)} className="asc-mono" style={styles.smallStep}>−</button>
                    <span className="asc-mono" style={{ fontSize: 10, color, width: 26, textAlign: "center" }}>{conf}%</span>
                    <button onClick={() => adjustConfidence(name, 10)} className="asc-mono" style={styles.smallStep}>+</button>
                  </div>
                </div>
                <div style={styles.barTrack}>
                  <div className="asc-bar-fill" style={{ ...styles.barFill, width: `${conf}%`, background: color }} />
                </div>
                <div className="asc-mono" style={{ fontSize: 9, color: "#6B6B6B", marginTop: 3 }}>
                  {mins}m studied{hwCount > 0 ? ` · ${hwCount} homework pending` : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* events */}
      <div style={styles.section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div className="asc-display" style={styles.sectionTitle}><CalendarDays size={14} style={{ marginRight: 4 }} />Events</div>
          <button onClick={() => setAddingEvent((s) => !s)} className="asc-mono" style={styles.addBtn}>
            {addingEvent ? <X size={13} /> : <Plus size={13} />}
          </button>
        </div>
        {addingEvent && (
          <div style={{ ...styles.questForm, borderColor: "#B3272C", marginBottom: 8 }}>
            <input className="asc-mono" placeholder="Event title" value={evTitle} onChange={(e) => setEvTitle(e.target.value)} style={styles.input} />
            <input type="date" className="asc-datein asc-mono" value={evDate} onChange={(e) => setEvDate(e.target.value)} style={{ ...styles.input, marginTop: 6 }} />
            <button onClick={addEvent} className="asc-mono" style={{ ...styles.logBtn, background: "#B3272C" }}>ADD EVENT</button>
          </div>
        )}
        {sortedEvents.length === 0 && !addingEvent && (
          <div className="asc-mono" style={{ fontSize: 11, color: "#5A5A5A" }}>Nothing on the horizon.</div>
        )}
        {sortedEvents.map((e) => {
          const du = daysUntil(e.date);
          return (
            <div key={e.id} style={styles.listRow}>
              <span className="asc-mono" style={{ fontSize: 11, color: "#EDEBE6", flex: 1 }}>{e.title}</span>
              <span className="asc-mono" style={{ fontSize: 10, color: du < 0 ? "#C4453D" : du <= 2 ? "#E8B84B" : "#7A7A7A" }}>
                {du < 0 ? "past" : du === 0 ? "today" : `in ${du}d`}
              </span>
              <button onClick={() => removeEvent(e.id)} style={styles.iconBtn}><Trash2 size={12} color="#5A5A5A" /></button>
            </div>
          );
        })}
      </div>

      {/* homework */}
      <div style={styles.section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div className="asc-display" style={styles.sectionTitle}><ClipboardList size={14} style={{ marginRight: 4 }} />Homework</div>
          <button onClick={() => setAddingHw((s) => !s)} className="asc-mono" style={styles.addBtn}>
            {addingHw ? <X size={13} /> : <Plus size={13} />}
          </button>
        </div>
        {addingHw && (
          <div style={{ ...styles.questForm, borderColor: "#6FA8DC", marginBottom: 8 }}>
            <input className="asc-mono" placeholder="Assignment title" value={hwTitle} onChange={(e) => setHwTitle(e.target.value)} style={styles.input} />
            <select className="asc-select asc-mono" value={hwSubject} onChange={(e) => setHwSubject(e.target.value)} style={{ marginTop: 6 }}>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input type="date" className="asc-datein asc-mono" value={hwDue} onChange={(e) => setHwDue(e.target.value)} style={{ ...styles.input, marginTop: 6 }} />
            <button onClick={addHomework} className="asc-mono" style={{ ...styles.logBtn, background: "#6FA8DC" }}>ADD HOMEWORK</button>
          </div>
        )}
        {sortedHomework.length === 0 && !addingHw && (
          <div className="asc-mono" style={{ fontSize: 11, color: "#5A5A5A" }}>Nothing pending.</div>
        )}
        {sortedHomework.map((h) => {
          const du = daysUntil(h.due);
          return (
            <div key={h.id} style={styles.listRow}>
              <button onClick={() => toggleHomework(h.id)} style={styles.iconBtn}>
                <Check size={13} color={h.done ? "#5FBF7A" : "#3A3A3A"} />
              </button>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", opacity: h.done ? 0.4 : 1 }}>
                <span className="asc-mono" style={{ fontSize: 11, color: "#EDEBE6", textDecoration: h.done ? "line-through" : "none" }}>{h.title}</span>
                <span className="asc-mono" style={{ fontSize: 9, color: "#6B6B6B" }}>{h.subject}</span>
              </div>
              {!h.done && (
                <span className="asc-mono" style={{ fontSize: 10, color: du < 0 ? "#C4453D" : du <= 2 ? "#E8B84B" : "#7A7A7A" }}>
                  {du < 0 ? "overdue" : du === 0 ? "today" : `${du}d`}
                </span>
              )}
              <button onClick={() => removeHomework(h.id)} style={styles.iconBtn}><Trash2 size={12} color="#5A5A5A" /></button>
            </div>
          );
        })}
      </div>

      {/* quest log */}
      <div style={styles.section}>
        <button onClick={() => setShowLog((s) => !s)} className="asc-mono" style={styles.logToggle}>
          {showLog ? "Hide" : "Show"} full quest log ({log.length})
        </button>
        {showLog && (
          <div style={styles.logList}>
            {log.length === 0 && <div className="asc-mono" style={{ fontSize: 11, color: "#5A5A5A" }}>No quests logged yet.</div>}
            {log.map((l) => (
              <div key={l.id} style={styles.logRow}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: STAT_META[l.stat].color, flexShrink: 0 }} />
                <span className="asc-mono" style={{ fontSize: 11, color: "#C9C9C9", flex: 1 }}>{l.detail}</span>
                <span className="asc-mono" style={{ fontSize: 10, color: "#6B6B6B" }}>{l.minutes}m</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loaded && <div className="asc-mono" style={{ fontSize: 10, color: "#4A4A4A", textAlign: "center", padding: 12 }}>loading saved progress…</div>}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Styles                                                                   */
/* ---------------------------------------------------------------------- */

const styles = {
  page: { background: "#0A0A0A", color: "#EDEBE6", minHeight: "100%", padding: "16px 14px 32px", maxWidth: 480, margin: "0 auto" },
  flashWrap: { position: "fixed", top: 14, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 50, pointerEvents: "none" },
  flashCard: { background: "#141414", border: "1px solid", borderRadius: 4, padding: "8px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, boxShadow: "0 4px 24px rgba(0,0,0,0.5)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  title: { fontSize: 30, color: "#EDEBE6", lineHeight: 1 },
  subtitle: { fontSize: 11, color: "#B3272C", marginTop: 4 },
  streakWrap: { display: "flex", alignItems: "center", gap: 5, border: "1px solid #2A2A2A", borderRadius: 4, padding: "6px 10px", height: 16 },
  statRail: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 18 },
  statCard: { background: "#131313", border: "1px solid #232323", borderRadius: 4, padding: "9px 10px", minWidth: 108, flexShrink: 0 },
  statTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  barTrack: { height: 4, background: "#232323", borderRadius: 2, marginTop: 6, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 2 },
  dayRow: { display: "flex", gap: 6, marginBottom: 18 },
  dayBtn: { flex: 1, border: "1px solid", borderRadius: 4, padding: "7px 0", fontSize: 11, background: "transparent" },
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 15, color: "#EDEBE6", display: "flex", alignItems: "center" },
  freeNote: { fontSize: 12, color: "#7A7A7A", background: "#131313", border: "1px dashed #2A2A2A", borderRadius: 4, padding: "12px 10px" },
  timelineRow: { display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", borderBottom: "1px solid #1A1A1A" },
  timelineTime: { fontSize: 11, color: "#9A9A9A", width: 82, flexShrink: 0 },
  timelineLabel: { fontSize: 12, color: "#EDEBE6" },
  dayNote: { fontSize: 10, color: "#B3272C", marginTop: 6 },
  slashWrap: { display: "flex", alignItems: "center", gap: 8, margin: "14px 0 4px" },
  slashLine: { flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #B3272C, transparent)" },
  slashLabel: { fontSize: 10, color: "#B3272C", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" },
  questGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  questBtn: { width: "100%", display: "flex", alignItems: "center", gap: 8, background: "#131313", border: "1px solid", borderRadius: 4, padding: "10px 10px" },
  questLabel: { fontSize: 11.5, color: "#EDEBE6", flex: 1, textAlign: "left" },
  questForm: { marginTop: 6, background: "#101010", border: "1px solid", borderRadius: 4, padding: 10 },
  input: { width: "100%", background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 3, padding: "8px 9px", color: "#EDEBE6", fontSize: 12, boxSizing: "border-box" },
  chipRow: { display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap", alignItems: "center" },
  chip: { border: "1px solid", borderRadius: 3, padding: "5px 9px", fontSize: 11, background: "transparent" },
  numInput: { width: 56, background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 3, padding: "5px 6px", color: "#EDEBE6", fontSize: 11 },
  logBtn: { width: "100%", marginTop: 10, border: "none", borderRadius: 3, padding: "9px 0", fontSize: 11, color: "#0A0A0A", fontWeight: 700 },
  homeTaskRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  taskChip: { border: "1px solid", borderRadius: 3, padding: "7px 12px", fontSize: 11, background: "transparent", display: "flex", alignItems: "center", gap: 5 },
  logToggle: { fontSize: 11, color: "#7A7A7A", background: "transparent", border: "none", padding: 0 },
  logList: { marginTop: 10, display: "flex", flexDirection: "column", gap: 7 },
  logRow: { display: "flex", alignItems: "center", gap: 8 },
  subjectRow: { background: "#131313", border: "1px solid #232323", borderRadius: 4, padding: "9px 10px" },
  smallStep: { border: "1px solid #2A2A2A", background: "transparent", color: "#8A8A8A", borderRadius: 3, width: 20, height: 20, fontSize: 12, lineHeight: 1 },
  addBtn: { border: "1px solid #2A2A2A", background: "transparent", color: "#EDEBE6", borderRadius: 4, padding: 5 },
  listRow: { display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #1A1A1A" },
  iconBtn: { background: "transparent", border: "none", padding: 2, display: "flex", alignItems: "center" },
};
