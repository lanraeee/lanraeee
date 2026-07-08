'use client';
import { useRef, useState, useEffect } from 'react';

const BARS = [3, 5, 8, 6, 10, 7, 4, 9, 5, 7, 10, 4, 8, 5, 9, 6, 3, 8, 5, 10, 6, 4, 9, 7, 5];

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

export function VoicePlayer({ src, fromAdmin }: { src: string; fromAdmin?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTimeUpdate = () => {
      setCurrentTime(a.currentTime);
      setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
    };
    const onLoaded = () => setDuration(a.duration);
    const onEnded = () => { setPlaying(false); setProgress(0); setCurrentTime(0); a.currentTime = 0; };
    a.addEventListener('timeupdate', onTimeUpdate);
    a.addEventListener('loadedmetadata', onLoaded);
    a.addEventListener('ended', onEnded);
    return () => {
      a.removeEventListener('timeupdate', onTimeUpdate);
      a.removeEventListener('loadedmetadata', onLoaded);
      a.removeEventListener('ended', onEnded);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); } else { a.play(); setPlaying(true); }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration;
  };

  const accent = fromAdmin ? '#9d90ff' : '#1a8a6a';
  const accentFaint = fromAdmin ? 'rgba(157,144,255,.25)' : 'rgba(26,138,106,.25)';
  const textFaint = fromAdmin ? 'rgba(255,255,255,.45)' : 'rgba(255,255,255,.45)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 210, padding: '2px 0' }}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/pause button */}
      <button
        onClick={toggle}
        style={{
          width: 38, height: 38, borderRadius: '50%', border: 'none', flexShrink: 0,
          background: accent, color: '#fff', fontSize: 13, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 8px ${accentFaint}`,
          transition: 'transform .1s',
        }}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(.92)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {playing
          ? <span style={{ display: 'flex', gap: 3 }}><span style={{ width: 3, height: 12, background: '#fff', borderRadius: 2 }} /><span style={{ width: 3, height: 12, background: '#fff', borderRadius: 2 }} /></span>
          : <span style={{ marginLeft: 2 }}>▶</span>
        }
      </button>

      {/* Waveform + time */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div
          onClick={seek}
          style={{ display: 'flex', alignItems: 'center', gap: 2, height: 28, cursor: 'pointer', userSelect: 'none' }}
        >
          {BARS.map((h, i) => {
            const pct = (i / BARS.length) * 100;
            const active = pct <= progress;
            return (
              <div
                key={i}
                style={{
                  width: 3, height: `${h * 2.2}px`, borderRadius: 3, flexShrink: 0,
                  background: active ? accent : accentFaint,
                  transition: 'background .08s',
                }}
              />
            );
          })}
        </div>
        <div style={{ fontSize: 10, color: textFaint, letterSpacing: '.3px' }}>
          {currentTime > 0 ? fmt(currentTime) : (duration > 0 ? fmt(duration) : '0:00')}
        </div>
      </div>
    </div>
  );
}
