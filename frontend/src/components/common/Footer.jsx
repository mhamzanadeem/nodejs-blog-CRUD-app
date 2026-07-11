export default function Footer() {
  return (
    <footer className="mt-24 border-t" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-surface-container-high)' }}>
      <div className="flex flex-col md:flex-row justify-between items-center px-10 py-12 max-w-[1120px] mx-auto gap-8">
        <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)', opacity: 0.7 }}>
          © 2024 Medium Blog App. All rights reserved.
        </p>
        <div className="flex gap-8">
          {['About', 'Help', 'Terms', 'Privacy'].map(link => (
            <a key={link} href="#"
              className="text-sm transition-colors hover:text-secondary"
              style={{ color: 'var(--color-on-surface-variant)' }}>
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
