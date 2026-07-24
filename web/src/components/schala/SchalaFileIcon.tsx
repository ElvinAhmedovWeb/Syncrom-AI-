interface IconProps {
  size?: number;
  className?: string;
}

export function FolderClosedIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" fill="#dcb67a" />
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1H3V7z" fill="#b89355" />
    </svg>
  );
}

export function FolderOpenIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v3H3V6z" fill="#b89355" />
      <path
        d="M2.5 10.5A1.5 1.5 0 0 1 4 9h16a1.5 1.5 0 0 1 1.5 1.7l-1.3 7.2a1.5 1.5 0 0 1-1.5 1.1H5.3a1.5 1.5 0 0 1-1.5-1.2L2.5 10.5z"
        fill="#e5c07b"
      />
    </svg>
  );
}

export default function SchalaFileIcon({ name, size = 16 }: { name: string; size?: number }) {
  const lower = name.toLowerCase();
  const ext = lower.split(".").pop() || "";

  if (lower === ".gitignore" || lower === ".gitattributes" || lower.startsWith(".git")) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <rect width="24" height="24" rx="4" fill="#f05032" />
        <circle cx="9" cy="9" r="2" fill="#fff" />
        <circle cx="9" cy="16" r="2" fill="#fff" />
        <circle cx="16" cy="11" r="2" fill="#fff" />
        <path d="M9 11v3M9 11l6 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (ext === "ts" || ext === "d.ts") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <rect width="24" height="24" rx="4" fill="#3178c6" />
        <text x="5" y="17" fill="#ffffff" fontSize="11" fontWeight="800" fontFamily="sans-serif">
          TS
        </text>
      </svg>
    );
  }

  if (ext === "tsx") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <rect width="24" height="24" rx="4" fill="#3178c6" />
        <text x="3" y="16" fill="#61dafb" fontSize="9" fontWeight="900" fontFamily="sans-serif">
          TSX
        </text>
      </svg>
    );
  }

  if (ext === "js" || ext === "mjs" || ext === "cjs") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <rect width="24" height="24" rx="4" fill="#f7df1e" />
        <text x="5" y="17" fill="#000000" fontSize="11" fontWeight="900" fontFamily="sans-serif">
          JS
        </text>
      </svg>
    );
  }

  if (ext === "jsx") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <rect width="24" height="24" rx="4" fill="#f7df1e" />
        <text x="3" y="16" fill="#000000" fontSize="9" fontWeight="900" fontFamily="sans-serif">
          JSX
        </text>
      </svg>
    );
  }

  if (ext === "py") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <rect width="24" height="24" rx="4" fill="#1e415e" />
        <path d="M12 4c-3.3 0-3 1.4-3 1.4v1.5h3v.5H7.5S6 7.2 6 10.5c0 3.3 1.3 3.1 1.3 3.1h.8v-1.2c0-1.7 1.4-1.7 1.4-1.7h3.4s1.3 0 1.3-1.4V6.8S15.3 4 12 4zm-1 1.3a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4z" fill="#387eb8" />
        <path d="M12 20c3.3 0 3-1.4 3-1.4v-1.5h-3v-.5h4.5s1.5.2 1.5-3.1c0-3.3-1.3-3.1-1.3-3.1h-.8v1.2c0 1.7-1.4 1.7-1.4 1.7H11.1s-1.3 0-1.3 1.4v2.5s-1.1 2.8 2.2 2.8zm1-1.3a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4z" fill="#ffe052" />
      </svg>
    );
  }

  if (ext === "json") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <rect width="24" height="24" rx="4" fill="#cbd5e1" opacity="0.15" />
        <text x="4" y="17" fill="#f59e0b" fontSize="13" fontWeight="900" fontFamily="monospace">
          &#123;&#125;
        </text>
      </svg>
    );
  }

  if (ext === "html" || ext === "htm") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <rect width="24" height="24" rx="4" fill="#e34c26" />
        <text x="3" y="16" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="monospace">
          &lt;/&gt;
        </text>
      </svg>
    );
  }

  if (ext === "css") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <rect width="24" height="24" rx="4" fill="#1572b6" />
        <text x="4" y="17" fill="#ffffff" fontSize="11" fontWeight="800" fontFamily="sans-serif">
          #
        </text>
      </svg>
    );
  }

  if (ext === "scss" || ext === "less") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <rect width="24" height="24" rx="4" fill="#c69" />
        <text x="3" y="16" fill="#ffffff" fontSize="9" fontWeight="800" fontFamily="sans-serif">
          CSS
        </text>
      </svg>
    );
  }

  if (ext === "md" || ext === "markdown") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <rect width="24" height="24" rx="4" fill="#3b82f6" opacity="0.2" />
        <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" stroke="#3b82f6" strokeWidth="1.6" />
        <path d="M6 15V9l3 3 3-3v6M17 12l-2 2v-5" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (ext === "rs") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <rect width="24" height="24" rx="4" fill="#dea584" />
        <text x="4" y="17" fill="#000000" fontSize="11" fontWeight="900" fontFamily="sans-serif">
          RS
        </text>
      </svg>
    );
  }

  if (ext === "go") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <rect width="24" height="24" rx="4" fill="#00add8" />
        <text x="3" y="17" fill="#ffffff" fontSize="11" fontWeight="900" fontFamily="sans-serif">
          GO
        </text>
      </svg>
    );
  }

  if (ext === "java") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <rect width="24" height="24" rx="4" fill="#ea2d2e" />
        <text x="4" y="17" fill="#ffffff" fontSize="11" fontWeight="900" fontFamily="sans-serif">
          JV
        </text>
      </svg>
    );
  }

  if (ext === "sh" || ext === "bash" || ext === "zsh") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <rect width="24" height="24" rx="4" fill="#4d5a5e" />
        <text x="3" y="16" fill="#89e051" fontSize="10" fontWeight="900" fontFamily="monospace">
          &gt;_
        </text>
      </svg>
    );
  }

  if (ext === "yml" || ext === "yaml" || ext === "env" || ext === "config") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <rect width="24" height="24" rx="4" fill="#64748b" opacity="0.2" />
        <path d="M5 7h14M5 12h14M5 17h14" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="2" fill="#64748b" />
        <circle cx="15" cy="12" r="2" fill="#64748b" />
        <circle cx="10" cy="17" r="2" fill="#64748b" />
      </svg>
    );
  }

  if (["png", "jpg", "jpeg", "svg", "gif", "ico", "webp"].includes(ext)) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <rect width="24" height="24" rx="4" fill="#a855f7" opacity="0.2" />
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="#a855f7" strokeWidth="1.6" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="#a855f7" />
        <path d="M4 16l4.5-4.5 3 3 4-4 4.5 4.5" stroke="#a855f7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Default File Icon
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#94a3b8" opacity="0.15" />
      <path d="M14 2v6h6" fill="#94a3b8" opacity="0.3" />
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
