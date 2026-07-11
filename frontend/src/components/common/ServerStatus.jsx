import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../../utils/constants';

const CHECK_INTERVAL = 30000;
const TIMEOUT_MS = 5000;

export default function ServerStatus() {
  const [status, setStatus] = useState('checking');
  const [showWakeBtn, setShowWakeBtn] = useState(false);
  const [waking, setWaking] = useState(false);
  const mountedRef = useRef(true);

  const check = useCallback(async () => {
    if (!mountedRef.current) return;
    setShowWakeBtn(false);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        setStatus('online');
      } else {
        setStatus('error');
      }
    } catch {
      if (mountedRef.current) {
        setStatus('offline');
        setShowWakeBtn(true);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    check();
    const interval = setInterval(check, CHECK_INTERVAL);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [check]);

  const wakeUp = async () => {
    setWaking(true);
    setShowWakeBtn(false);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) setStatus('online');
      else setStatus('error');
    } catch {
      setStatus('offline');
      setShowWakeBtn(true);
    } finally {
      setWaking(false);
    }
  };

  const color = status === 'online' ? '#22c55e' : status === 'checking' ? '#facc15' : '#ef4444';
  const label = status === 'online' ? 'Server online' : status === 'checking' ? 'Checking...' : 'Server offline';

  return (
    <div style={{ position: 'fixed', bottom: 90, right: 16, zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px', borderRadius: 20,
          background: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-outline-variant)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'default', fontSize: 11, fontWeight: 600, letterSpacing: '0.03em',
        }}
        title={label}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ color: 'var(--color-on-surface-variant)' }}>{label}</span>
      </div>

      {showWakeBtn && (
        <button
          onClick={wakeUp}
          disabled={waking}
          style={{
            padding: '8px 16px', borderRadius: 20, border: 'none', cursor: waking ? 'wait' : 'pointer',
            background: 'var(--color-secondary-container)',
            color: 'var(--color-on-secondary-fixed)',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            opacity: waking ? 0.7 : 1,
          }}
        >
          {waking ? 'Waking up...' : 'Wake up server'}
        </button>
      )}
    </div>
  );
}
