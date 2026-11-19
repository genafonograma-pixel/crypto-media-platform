import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdPlacement from '../components/AdPlacement';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Club { name: string; logo: string; difficulty: 'easy' | 'hard' }
type Difficulty = 'easy' | 'hard' | 'mixed';
type Screen = 'home' | 'quiz' | 'result';
type AnswerState = 'idle' | 'correct' | 'wrong' | 'timeout';
interface Question { correct: Club; options: Club[] }

// ─── Club Data — High-res PNGs hosted locally in /quiz-logos/ (100% reliable) ──
const LOGO = (slug: string) => `/quiz-logos/${slug}.png`;

const CLUBS: Club[] = [
  // ── EASY ──────────────────────────────────────────────────────────────────
  { name: 'FC Barcelona',       difficulty: 'easy', logo: LOGO('barcelona')    },
  { name: 'Real Madrid',        difficulty: 'easy', logo: LOGO('real-madrid')  },
  { name: 'Manchester United',  difficulty: 'easy', logo: LOGO('man-united')   },
  { name: 'Liverpool FC',       difficulty: 'easy', logo: LOGO('liverpool')    },
  { name: 'Chelsea FC',         difficulty: 'easy', logo: LOGO('chelsea')      },
  { name: 'Arsenal FC',         difficulty: 'easy', logo: LOGO('arsenal')      },
  { name: 'Juventus',           difficulty: 'easy', logo: LOGO('juventus')     },
  { name: 'Bayern Munich',      difficulty: 'easy', logo: LOGO('bayern')       },
  { name: 'PSG',                difficulty: 'easy', logo: LOGO('psg')          },
  { name: 'AC Milan',           difficulty: 'easy', logo: LOGO('ac-milan')     },
  { name: 'Inter Milan',        difficulty: 'easy', logo: LOGO('inter-milan')  },
  { name: 'Manchester City',    difficulty: 'easy', logo: LOGO('man-city')     },
  { name: 'Tottenham Hotspur',  difficulty: 'easy', logo: LOGO('tottenham')    },
  { name: 'Borussia Dortmund',  difficulty: 'easy', logo: LOGO('dortmund')     },
  { name: 'Atletico Madrid',    difficulty: 'easy', logo: LOGO('atletico')     },
  { name: 'Ajax',               difficulty: 'easy', logo: LOGO('ajax')         },
  { name: 'FC Porto',           difficulty: 'easy', logo: LOGO('porto')        },
  { name: 'Benfica',            difficulty: 'easy', logo: LOGO('benfica')      },
  { name: 'AS Roma',            difficulty: 'easy', logo: LOGO('roma')         },
  { name: 'Napoli',             difficulty: 'easy', logo: LOGO('napoli')       },
  // ── HARD ──────────────────────────────────────────────────────────────────
  { name: 'RB Leipzig',         difficulty: 'hard', logo: LOGO('rb-leipzig')   },
  { name: 'Bayer Leverkusen',   difficulty: 'hard', logo: LOGO('leverkusen')   },
  { name: 'Feyenoord',          difficulty: 'hard', logo: LOGO('feyenoord')    },
  { name: 'Galatasaray',        difficulty: 'hard', logo: LOGO('galatasaray')  },
  { name: 'Fenerbahce',         difficulty: 'hard', logo: LOGO('fenerbahce')   },
  { name: 'Sporting CP',        difficulty: 'hard', logo: LOGO('sporting-cp')  },
  { name: 'Lazio',              difficulty: 'hard', logo: LOGO('lazio')        },
  { name: 'Marseille',          difficulty: 'hard', logo: LOGO('marseille')    },
  { name: 'Lyon',               difficulty: 'hard', logo: LOGO('lyon')         },
  { name: 'Sevilla FC',         difficulty: 'hard', logo: LOGO('sevilla')      },
  { name: 'Valencia CF',        difficulty: 'hard', logo: LOGO('valencia')     },
  { name: 'Villarreal CF',      difficulty: 'hard', logo: LOGO('villarreal')   },
  { name: 'Wolves',             difficulty: 'hard', logo: LOGO('wolves')       },
  { name: 'West Ham United',    difficulty: 'hard', logo: LOGO('west-ham')     },
  { name: 'Aston Villa',        difficulty: 'hard', logo: LOGO('aston-villa')  },
  { name: 'Eintracht Frankfurt',difficulty: 'hard', logo: LOGO('frankfurt')    },
  { name: 'Shakhtar Donetsk',   difficulty: 'hard', logo: LOGO('shakhtar')     },
  { name: 'Red Star Belgrade',  difficulty: 'hard', logo: LOGO('red-star')     },
  { name: 'Club Brugge',        difficulty: 'hard', logo: LOGO('club-brugge')  },
  { name: 'PSV Eindhoven',      difficulty: 'hard', logo: LOGO('psv')          },
  { name: 'Flamengo',           difficulty: 'hard', logo: LOGO('flamengo')     },
  { name: 'Boca Juniors',       difficulty: 'hard', logo: LOGO('boca-juniors') },
  { name: 'Celtic FC',          difficulty: 'hard', logo: LOGO('celtic')       },
  { name: 'Rangers FC',         difficulty: 'hard', logo: LOGO('rangers')      },
  { name: 'Anderlecht',         difficulty: 'hard', logo: LOGO('anderlecht')   },
];

const TOTAL_QUESTIONS = 10;
const TIME_LIMIT = 15;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(diff: Difficulty): Question[] {
  const pool =
    diff === 'easy' ? CLUBS.filter(c => c.difficulty === 'easy') :
    diff === 'hard' ? CLUBS.filter(c => c.difficulty === 'hard') :
    CLUBS;
  const selected = shuffle(pool).slice(0, TOTAL_QUESTIONS);
  return selected.map(correct => {
    const others = shuffle(CLUBS.filter(c => c.name !== correct.name)).slice(0, 3);
    return { correct, options: shuffle([correct, ...others]) };
  });
}

// ─── Shared styles ───────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: '#16161e',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
};
const BRAND = '#5B2EE8';
const ALERT = '#E5173F';

// ─── Timer ring ───────────────────────────────────────────────────────────────
function TimerRing({ timeLeft }: { timeLeft: number }) {
  const r = 20, circ = 2 * Math.PI * r;
  const pct = timeLeft / TIME_LIMIT;
  const color = pct > 0.5 ? BRAND : pct > 0.25 ? '#f59e0b' : ALERT;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width={52} height={52} viewBox="0 0 52 52">
        <circle cx={26} cy={26} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
        <circle cx={26} cy={26} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round" transform="rotate(-90 26 26)"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
        />
        <text x={26} y={26} textAnchor="middle" dominantBaseline="central"
          fill={pct <= 0.25 ? ALERT : '#fff'} fontSize={15} fontWeight={800}
          style={{ fontFamily: 'Archivo, Inter, system-ui' }}>
          {timeLeft}
        </text>
      </svg>
    </div>
  );
}

// ─── Blurred logo — unblurs on answer ────────────────────────────────────────
function LogoDisplay({ src, revealed }: { src: string; revealed: boolean }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'err'>('loading');
  useEffect(() => { setStatus('loading'); }, [src]);

  return (
    <div style={{ width: 170, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: -14, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91,46,232,0.2) 0%, transparent 70%)',
        opacity: revealed ? 0.7 : 0.3, transition: 'opacity 0.4s',
      }} />
      {status === 'err' ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)' }}>
          <div style={{ fontSize: 56 }}>🛡️</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>Badge unavailable</div>
        </div>
      ) : (
        <>
          {status === 'loading' && (
            <div style={{
              position: 'absolute', width: 110, height: 110, borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)', animation: 'quizPulse 1.4s ease-in-out infinite',
            }} />
          )}
          <img
            src={src} alt="Club badge"
            onLoad={() => setStatus('ok')}
            onError={() => setStatus('err')}
            style={{
              width: 150, height: 150, objectFit: 'contain',
              opacity: status === 'ok' ? 1 : 0,
              filter: revealed
                ? 'blur(0px) drop-shadow(0 8px 24px rgba(91,46,232,0.45))'
                : 'blur(13px) brightness(0.8)',
              transition: 'filter 0.5s ease, opacity 0.3s ease',
            }}
          />
        </>
      )}
    </div>
  );
}

// ─── Answer button ────────────────────────────────────────────────────────────
function AnswerButton({ club, answerState, isCorrect, isChosen, onClick, disabled }: {
  key?: React.Key;
  club: Club; answerState: AnswerState;
  isCorrect: boolean; isChosen: boolean;
  onClick: () => void; disabled: boolean;
}) {
  const revealed = answerState !== 'idle';
  const bg    = revealed && isCorrect  ? 'rgba(34,197,94,0.14)'
              : revealed && isChosen   ? 'rgba(229,23,63,0.14)'
              : 'rgba(255,255,255,0.04)';
  const bdr   = revealed && isCorrect  ? '1.5px solid rgba(34,197,94,0.5)'
              : revealed && isChosen   ? '1.5px solid rgba(229,23,63,0.5)'
              : '1.5px solid rgba(255,255,255,0.09)';
  const color = revealed && isCorrect  ? '#86efac'
              : revealed && isChosen   ? '#fca5a5'
              : 'rgba(255,255,255,0.82)';
  const icon  = revealed && isCorrect  ? '✓'
              : revealed && isChosen   ? '✗'
              : '';

  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: bg, border: bdr, borderRadius: 10,
      color, cursor: disabled ? 'default' : 'pointer',
      fontSize: 13, fontWeight: 600, fontFamily: 'Inter, system-ui',
      padding: '13px 14px', textAlign: 'left', transition: 'all 0.18s',
      width: '100%', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 6, outline: 'none',
    }}
    onMouseEnter={e => { if (!disabled) {
      const el = e.currentTarget as HTMLElement;
      el.style.background = 'rgba(91,46,232,0.14)';
      el.style.borderColor = 'rgba(91,46,232,0.4)';
      el.style.transform = 'translateY(-1px)';
    }}}
    onMouseLeave={e => { if (!disabled && answerState === 'idle') {
      const el = e.currentTarget as HTMLElement;
      el.style.background = bg; el.style.borderColor = 'rgba(255,255,255,0.09)'; el.style.transform = '';
    }}}>
      <span>{club.name}</span>
      {icon && <span style={{ fontWeight: 800, fontSize: 15, color: isCorrect ? '#22c55e' : ALERT }}>{icon}</span>}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const [screen, setScreen]           = useState<Screen>('home');
  const [difficulty, setDifficulty]   = useState<Difficulty>('easy');
  const [questions, setQuestions]     = useState<Question[]>([]);
  const [current, setCurrent]         = useState(0);
  const [score, setScore]             = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak]           = useState(0);
  const [bestStreak, setBestStreak]   = useState(0);
  const [timeLeft, setTimeLeft]       = useState(TIME_LIMIT);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [chosenName, setChosenName]   = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const advanceQuestion = useCallback((nextIndex: number) => {
    if (nextIndex >= TOTAL_QUESTIONS) { setScreen('result'); return; }
    setCurrent(nextIndex);
    setAnswerState('idle');
    setChosenName(null);
    setFeedbackMsg('');
    setTimeLeft(TIME_LIMIT);
  }, []);

  // Timer
  useEffect(() => {
    if (screen !== 'quiz' || answerState !== 'idle') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          stopTimer();
          setAnswerState('timeout');
          setStreak(0);
          setFeedbackMsg(`⏰ Time's up! It was ${questions[current]?.correct.name}`);
          setTimeout(() => advanceQuestion(current + 1), 2000);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return stopTimer;
  }, [screen, answerState, current, questions, stopTimer, advanceQuestion]);

  // Preload next logo
  useEffect(() => {
    if (screen === 'quiz' && current + 1 < questions.length) {
      const img = new Image();
      img.src = questions[current + 1].correct.logo;
    }
  }, [screen, current, questions]);

  function startQuiz() {
    const qs = buildQuestions(difficulty);
    setQuestions(qs); setCurrent(0); setScore(0); setCorrectCount(0);
    setStreak(0); setBestStreak(0); setTimeLeft(TIME_LIMIT);
    setAnswerState('idle'); setChosenName(null); setFeedbackMsg('');
    setScreen('quiz');
  }

  function handleAnswer(club: Club) {
    if (answerState !== 'idle') return;
    stopTimer();
    const q = questions[current];
    const isCorrect = club.name === q.correct.name;
    setChosenName(club.name);
    if (isCorrect) {
      const tBonus = Math.round((timeLeft / TIME_LIMIT) * 50);
      const newStreak = streak + 1;
      const sBonus = Math.min(newStreak - 1, 5) * 10;
      const pts = 100 + tBonus + sBonus;
      setScore(s => s + pts); setCorrectCount(c => c + 1);
      setStreak(newStreak); setBestStreak(b => Math.max(b, newStreak));
      setAnswerState('correct');
      const msgs = ['🔥 Brilliant!','✅ Correct!','🎯 Spot on!','⚡ Fast!','💪 Nice one!'];
      let msg = `${msgs[Math.floor(Math.random() * msgs.length)]} +${pts} pts`;
      if (newStreak >= 2) msg += `  🔥×${newStreak}`;
      setFeedbackMsg(msg);
    } else {
      setStreak(0); setAnswerState('wrong');
      setFeedbackMsg(`❌ It was ${q.correct.name}`);
    }
    setTimeout(() => advanceQuestion(current + 1), 1800);
  }

  const q = questions[current];
  const progress = screen === 'quiz' ? (current / TOTAL_QUESTIONS) * 100 : 0;
  const pct = correctCount / TOTAL_QUESTIONS;
  const stars = Math.round(pct * 5);
  const resultEmoji = pct === 1 ? '🏆' : pct >= 0.8 ? '🌟' : pct >= 0.6 ? '👏' : pct >= 0.4 ? '😅' : '😬';
  const resultTitle  = pct === 1 ? 'Perfect Score!' : pct >= 0.8 ? 'Excellent!' : pct >= 0.6 ? 'Well Done!' : pct >= 0.4 ? 'Not Bad!' : 'Keep Practicing!';

  const diffMap: { key: Difficulty; icon: string; label: string; desc: string }[] = [
    { key: 'easy',  icon: '🌟', label: 'Easy',  desc: 'Top 20 clubs' },
    { key: 'mixed', icon: '⚡', label: 'Mixed', desc: 'All clubs' },
    { key: 'hard',  icon: '🔥', label: 'Hard',  desc: '25 tricky clubs' },
  ];

  // ── Layout wrapper — 3-col on desktop: [skyscraper | quiz | skyscraper]
  return (
    <>
      <style>{`
        @keyframes quizFadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes quizPulse {
          0%,100% { opacity:0.35; } 50% { opacity:0.75; }
        }
        @keyframes starPop {
          0%  { transform:scale(0) rotate(-30deg); opacity:0; }
          70% { transform:scale(1.25) rotate(5deg); }
          100%{ transform:scale(1) rotate(0); opacity:1; }
        }
        .quiz-fadein { animation: quizFadeUp 0.32s ease both; }
        .star-anim   { display:inline-block; animation:starPop 0.4s ease both; }

        /* Skyscraper sidebar — only on large screens */
        .quiz-sidebar {
          display: none;
          width: 160px;
          flex-shrink: 0;
          padding-top: 32px;
        }
        @media (min-width: 1200px) {
          .quiz-outer   { display: flex !important; justify-content: center; align-items: flex-start; gap: 32px; }
          .quiz-sidebar { display: block; }
        }
        /* Mobile billboard — only on small screens */
        .quiz-mobile-ad { display: block; }
        @media (min-width: 1200px) {
          .quiz-mobile-ad { display: none; }
        }
      `}</style>

      <Header />

      <main style={{ minHeight: 'calc(100vh - 128px)', background: '#0d0d12', paddingBottom: 56 }}>

        {/* Page heading strip */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)', padding: '18px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚽</span>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'Archivo, Inter, system-ui', letterSpacing: '-0.02em' }}>
                Club Logo Quiz
              </h1>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                Guess the blurred badge · 4 choices · 15 seconds
              </p>
            </div>
          </div>
        </div>

        {/* 3-col layout wrapper */}
        <div className="quiz-outer" style={{ maxWidth: 1440, margin: '0 auto', padding: '0 16px' }}>

          {/* Left skyscraper */}
          <aside className="quiz-sidebar" style={{ position: 'sticky', top: 80 }}>
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, textAlign: 'center', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Advertisement
            </div>
            <AdPlacement format="skyscraper" />
          </aside>

          {/* Quiz column */}
          <div style={{ width: '100%', maxWidth: 540, padding: '32px 0 0' }}>

            {/* Mobile billboard ad — shown above quiz on small screens */}
            <div className="quiz-mobile-ad" style={{ marginBottom: 20 }}>
              <AdPlacement format="billboard" />
            </div>

            {/* ══ HOME ══ */}
            {screen === 'home' && (
              <div className="quiz-fadein" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ ...card, padding: '32px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 60, marginBottom: 14 }}>⚽</div>
                  <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'Archivo, Inter, system-ui' }}>
                    How well do you know<br />your club badges?
                  </h2>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.65 }}>
                    Logos are blurred — figure out the club from the shape alone.<br />
                    Build streaks for bonus points!
                  </p>
                </div>

                {/* Difficulty */}
                <div style={{ ...card, padding: '18px 20px' }}>
                  <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Select difficulty
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                    {diffMap.map(d => (
                      <button key={d.key} onClick={() => setDifficulty(d.key)} style={{
                        background: difficulty === d.key ? 'rgba(91,46,232,0.18)' : 'rgba(255,255,255,0.03)',
                        border: difficulty === d.key ? `1.5px solid ${BRAND}` : '1.5px solid rgba(255,255,255,0.08)',
                        borderRadius: 12, color: difficulty === d.key ? '#fff' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer', padding: '13px 8px', textAlign: 'center', transition: 'all 0.18s', outline: 'none',
                      }}>
                        <div style={{ fontSize: 20, marginBottom: 5 }}>{d.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{d.label}</div>
                        <div style={{ fontSize: 10, opacity: 0.55, marginTop: 2 }}>{d.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rules */}
                <div style={{ ...card, padding: '16px 20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
                    {[
                      ['📋','10 questions per round'],['⏱️','15 seconds per logo'],
                      ['🔍','Logos blurred — spot the shape'],['🔥','Streaks give bonus pts'],
                    ].map(([icon, text]) => (
                      <div key={text as string} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                        <span style={{ fontSize: 14 }}>{icon}</span>
                        <span style={{ lineHeight: 1.45 }}>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={startQuiz} style={{
                  background: `linear-gradient(135deg, ${BRAND}, #7c3aed)`,
                  border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer',
                  fontFamily: 'Archivo, Inter, system-ui', fontSize: 16, fontWeight: 800,
                  letterSpacing: '-0.01em', padding: '15px', width: '100%',
                  boxShadow: '0 8px 24px rgba(91,46,232,0.35)', transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 12px 32px rgba(91,46,232,0.5)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = '0 8px 24px rgba(91,46,232,0.35)'; }}>
                  🚀 Start Quiz
                </button>
              </div>
            )}

            {/* ══ QUIZ ══ */}
            {screen === 'quiz' && q && (
              <div key={current} className="quiz-fadein" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Top bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                    Question <span style={{ color: '#fff' }}>{current + 1}</span>
                    <span style={{ opacity: 0.4 }}> / {TOTAL_QUESTIONS}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {streak >= 2 && (
                      <span style={{
                        fontSize: 12, fontWeight: 700, color: '#fbbf24',
                        background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
                        borderRadius: 999, padding: '3px 10px',
                      }}>🔥 {streak} streak</span>
                    )}
                    <span style={{
                      background: `linear-gradient(135deg, ${BRAND}, #7c3aed)`,
                      borderRadius: 999, fontSize: 13, fontWeight: 700, color: '#fff', padding: '5px 14px',
                    }}>⭐ {score}</span>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 999, height: 5 }}>
                  <div style={{
                    height: 5, borderRadius: 999,
                    background: `linear-gradient(90deg, ${BRAND}, #7c3aed)`,
                    width: `${progress}%`, transition: 'width 0.4s ease',
                  }} />
                </div>

                {/* Logo card */}
                <div style={{ ...card, padding: '24px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: q.correct.difficulty === 'easy' ? BRAND : ALERT,
                      background: q.correct.difficulty === 'easy' ? 'rgba(91,46,232,0.12)' : 'rgba(229,23,63,0.1)',
                      border: `1px solid ${q.correct.difficulty === 'easy' ? 'rgba(91,46,232,0.3)' : 'rgba(229,23,63,0.25)'}`,
                      borderRadius: 999, padding: '4px 12px',
                    }}>
                      {q.correct.difficulty === 'easy' ? '🌟 Easy' : '🔥 Hard'}
                    </span>
                    <TimerRing timeLeft={timeLeft} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <LogoDisplay src={q.correct.logo} revealed={answerState !== 'idle'} />
                  </div>
                  <div style={{
                    minHeight: 22, textAlign: 'center', fontSize: 13, fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: answerState === 'correct' ? '#86efac' : answerState === 'wrong' ? '#fca5a5' : answerState === 'timeout' ? '#fbbf24' : 'transparent',
                    transition: 'color 0.2s',
                  }}>{feedbackMsg}</div>
                </div>

                {/* Answer buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {q.options.map(opt => (
                    <AnswerButton key={opt.name} club={opt} answerState={answerState}
                      isCorrect={opt.name === q.correct.name} isChosen={opt.name === chosenName}
                      onClick={() => handleAnswer(opt)} disabled={answerState !== 'idle'} />
                  ))}
                </div>

                {/* Mid-quiz mobile ad (shows after Q5) */}
                {current === 4 && (
                  <div className="quiz-mobile-ad">
                    <AdPlacement format="in-article" />
                  </div>
                )}
              </div>
            )}

            {/* ══ RESULT ══ */}
            {screen === 'result' && (
              <div className="quiz-fadein" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ ...card, padding: '32px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 56, marginBottom: 14 }}>{resultEmoji}</div>
                  <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'Archivo, Inter, system-ui' }}>
                    {resultTitle}
                  </h2>
                  <div style={{ margin: '10px 0', display: 'flex', gap: 4, justifyContent: 'center' }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className="star-anim"
                        style={{ fontSize: 26, animationDelay: `${i * 0.1}s`, color: i < stars ? '#fbbf24' : 'rgba(255,255,255,0.15)' }}>
                        {i < stars ? '⭐' : '☆'}
                      </span>
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                    {difficulty === 'easy' ? '🌟 Easy' : difficulty === 'hard' ? '🔥 Hard' : '⚡ Mixed'} · {TOTAL_QUESTIONS} questions
                  </p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  {[
                    { label: 'Score',       value: score,                      color: '#a78bfa' },
                    { label: 'Correct',     value: `${correctCount}/${TOTAL_QUESTIONS}`, color: '#86efac' },
                    { label: 'Best Streak', value: bestStreak,                 color: '#fbbf24' },
                  ].map(s => (
                    <div key={s.label} style={{ ...card, padding: '16px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontFamily: 'Archivo, Inter, system-ui' }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Accuracy bar */}
                <div style={{ ...card, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>
                    <span>Accuracy</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>{Math.round(pct * 100)}%</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 999, height: 7 }}>
                    <div style={{
                      height: 7, borderRadius: 999, width: `${pct * 100}%`, transition: 'width 0.8s ease',
                      background: pct >= 0.8 ? 'linear-gradient(90deg,#22c55e,#86efac)' : pct >= 0.5 ? `linear-gradient(90deg,${BRAND},#7c3aed)` : `linear-gradient(90deg,${ALERT},#f97316)`,
                    }} />
                  </div>
                </div>

                {/* Result mobile ad */}
                <div className="quiz-mobile-ad">
                  <AdPlacement format="in-article" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                  <button onClick={() => setScreen('home')} style={{
                    background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
                    fontFamily: 'Inter, system-ui', fontSize: 14, fontWeight: 700, padding: '13px', outline: 'none',
                    transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}>
                    🏠 Home
                  </button>
                  <button onClick={startQuiz} style={{
                    background: `linear-gradient(135deg, ${BRAND}, #7c3aed)`, border: 'none',
                    borderRadius: 12, color: '#fff', cursor: 'pointer',
                    fontFamily: 'Archivo, Inter, system-ui', fontSize: 14, fontWeight: 800,
                    padding: '13px', boxShadow: '0 6px 20px rgba(91,46,232,0.35)',
                    transition: 'all 0.15s', outline: 'none',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
                    🔄 Play Again
                  </button>
                </div>

                <div style={{ textAlign: 'center', paddingTop: 4 }}>
                  <Link to="/football-news"
                    style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, textDecoration: 'none', transition: 'color 0.18s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)'; }}>
                    ← Back to football news
                  </Link>
                </div>
              </div>
            )}

          </div>

          {/* Right skyscraper */}
          <aside className="quiz-sidebar" style={{ position: 'sticky', top: 80 }}>
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, textAlign: 'center', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Advertisement
            </div>
            <AdPlacement format="skyscraper" />
          </aside>

        </div>
      </main>

      <Footer />
    </>
  );
}
