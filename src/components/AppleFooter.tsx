import React from 'react';
import { Link } from 'react-router-dom';

const columns = [
  {
    title: 'App',
    links: [
      { label: 'Board', to: '/board' },
      { label: 'Table', to: '/table' },
      { label: 'Analytics', to: '/analytics' },
      { label: 'Offer Compare', to: '/compare' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', to: '/login' },
      { label: 'Profile', to: '/profile' },
      { label: 'Google Drive Backup', to: '/profile' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'ATS Keyword Match', to: '/board' },
      { label: 'Email Templates', to: '/board' },
      { label: 'Gmail Auto-Sync', to: '/board' },
    ],
  },
  {
    title: 'Store',
    links: [
      { label: 'Get Lifetime License — $8', href: 'https://matrixflavour.gumroad.com/l/job-tracker-kanban' },
    ],
  },
];

export const AppleFooter: React.FC = () => {
  return (
    <footer className="bg-paper-dim border-t border-ink/8 mt-auto">
      <div className="max-w-[1800px] mx-auto px-5 sm:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {columns.map(col => (
            <div key={col.title}>
              <h4 className="text-[12px] font-semibold text-ink mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link.label}>
                    {'href' in link ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] text-ink-soft hover:underline hover:text-ink transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to!}
                        className="text-[12px] text-ink-soft hover:underline hover:text-ink transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-ink/8">
        <div className="max-w-[1800px] mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-[11px] text-ink-soft/80">
            Copyright © {new Date().getFullYear()} JobTrack Ledger. All application data is stored only in your browser — nothing is uploaded unless you explicitly connect Google sync.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-ink-soft/80">
            <Link to="/board" className="hover:underline hover:text-ink">App</Link>
            <Link to="/profile" className="hover:underline hover:text-ink">Profile</Link>
            <a
              href="https://matrixflavour.gumroad.com/l/job-tracker-kanban"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-ink"
            >
              License
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
