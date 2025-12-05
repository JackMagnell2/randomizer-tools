(() => {
    const storageKey = 'theme-preference';

    const applyTheme = (theme) => {
        const normalized = theme === 'light' ? 'light' : 'dark';
        document.documentElement.dataset.theme = normalized;
        document.body?.setAttribute('data-theme', normalized);
        try { localStorage.setItem(storageKey, normalized); } catch {}
        return normalized;
    };

    const getSystemTheme = () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    };

    const getStoredTheme = () => {
        try { return localStorage.getItem(storageKey); } catch { return null; }
    };

    window.themeHelper = {
        init: () => {
            const stored = getStoredTheme();
            const theme = stored || getSystemTheme();
            applyTheme(theme);
            return theme;
        },
        toggle: () => {
            const current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
            const next = current === 'light' ? 'dark' : 'light';
            return applyTheme(next);
        },
        setTheme: (theme) => applyTheme(theme),
        getTheme: () => document.documentElement.dataset.theme || 'dark'
    };
})();
