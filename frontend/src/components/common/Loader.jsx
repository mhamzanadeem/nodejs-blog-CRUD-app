export default function Loader({ size = 'md', text = '' }) {
  const sz = size === 'sm' ? 20 : size === 'lg' ? 48 : 32;
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div style={{
        width: sz, height: sz, borderRadius: '50%',
        border: `3px solid var(--color-surface-container-high)`,
        borderTopColor: 'var(--color-secondary-container)',
        animation: 'spin 0.7s linear infinite'
      }} />
      {text && <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{text}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
