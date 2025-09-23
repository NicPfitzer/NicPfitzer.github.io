(function(){
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const yearEl = document.getElementById('y');

  const applyTheme = (dark) => {
    if (dark) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    if (btn) {
      btn.setAttribute('aria-pressed', String(Boolean(dark)));
    }
  };

  const storedTheme = (() => {
    try {
      return window.localStorage.getItem('theme');
    } catch (err) {
      return null;
    }
  })();

  if (storedTheme === 'dark') {
    applyTheme(true);
  } else if (storedTheme === 'light') {
    applyTheme(false);
  } else {
    applyTheme(root.getAttribute('data-theme') === 'dark');
  }

  if (btn) {
    btn.addEventListener('click', () => {
      const nextIsDark = root.getAttribute('data-theme') !== 'dark';
      applyTheme(nextIsDark);
      try {
        window.localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
      } catch (err) {
        /* ignore storage errors */
      }
    });
  }

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
