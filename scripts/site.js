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

  const slider = document.getElementById('section-slider');
  const track = slider ? slider.querySelector('.section-track') : null;
  const announcer = slider ? slider.querySelector('.section-status') : null;
  const slides = track ? Array.from(track.children) : [];

  if (slider && track && slides.length > 0) {
    let currentIndex = 0;
    let isHorizontal = false;
    let isAnimating = false;
    let offsets = [];
    let resizeTimer = 0;
    let hasInteracted = Boolean(window.location.hash);

    const breakpoint = window.matchMedia('(max-width: 900px)');

    const setHashSilently = (id) => {
      if (!id) return;
      try {
        window.history.replaceState(null, '', `#${id}`);
      } catch (err) {
        window.location.hash = id;
      }
    };

    const announce = () => {
      if (!announcer) return;
      const label = slides[currentIndex]?.querySelector('h2')?.textContent || slides[currentIndex]?.id || '';
      announcer.textContent = label ? `Viewing ${label}` : '';
    };

    const setHeight = () => {
      if (!isHorizontal) {
        slider.style.height = 'auto';
        return;
      }
      const active = slides[currentIndex];
      if (active) {
        const targetHeight = active.offsetHeight;
        if (targetHeight > 0) {
          slider.style.height = `${targetHeight}px`;
        }
      }
    };

    const computeOffsets = () => {
      if (!isHorizontal) return;
      offsets = slides.map((slide) => slide.offsetLeft);
      setHeight();
    };

    const applyIndex = (index, updateHash = true) => {
      if (!isHorizontal) return;
      currentIndex = index;
      const offset = offsets[index] || 0;
      track.style.transform = `translateX(-${offset}px)`;
      setHeight();
      announce();
      if (updateHash) {
        setHashSilently(slides[index]?.id || '');
      }
    };

    const goTo = (index, updateHash = true) => {
      if (!isHorizontal) return;
      const nextIndex = Math.max(0, Math.min(slides.length - 1, index));
      if (nextIndex === currentIndex || isAnimating) return;
      isAnimating = true;
      slider.setAttribute('data-transitioning', 'true');
      applyIndex(nextIndex, updateHash);
      hasInteracted = true;
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          isAnimating = false;
          slider.removeAttribute('data-transitioning');
        }, 680);
      });
    };

    const handleWheel = (event) => {
      if (!isHorizontal) return;
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      event.preventDefault();
      if (isAnimating) return;
      if (event.deltaY > 0) {
        goTo(currentIndex + 1);
      } else if (event.deltaY < 0) {
        goTo(currentIndex - 1);
      }
    };

    const handleKey = (event) => {
      if (!isHorizontal) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        goTo(currentIndex + 1);
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        goTo(currentIndex - 1);
      }
    };

    const updateMode = () => {
      isHorizontal = !breakpoint.matches;
      slider.classList.toggle('is-horizontal', isHorizontal);
      track.style.transform = '';
      slider.style.height = 'auto';
      slider.removeAttribute('data-transitioning');
      isAnimating = false;
      if (isHorizontal) {
        window.requestAnimationFrame(() => {
          computeOffsets();
          applyIndex(currentIndex, hasInteracted);
        });
      } else if (announcer) {
        announcer.textContent = '';
      }
    };

    slider.addEventListener('wheel', handleWheel, { passive: false });
    slider.addEventListener('keydown', handleKey);

    window.addEventListener('resize', () => {
      if (!isHorizontal) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        computeOffsets();
        applyIndex(currentIndex);
      }, 150);
    });

    breakpoint.addEventListener('change', updateMode);

    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const hash = link.getAttribute('href');
        if (!hash) return;
        const targetId = decodeURIComponent(hash.slice(1));
        const targetIndex = slides.findIndex((slide) => slide.id === targetId);
        if (targetIndex === -1) return;
        if (isHorizontal) {
          event.preventDefault();
          try {
            slider.focus({ preventScroll: true });
          } catch (err) {
            slider.focus();
          }
          goTo(targetIndex);
        }
      });
    });

    const scrollToHash = (hash, viaNav = false) => {
      if (!hash) return;
      const id = decodeURIComponent(hash.replace('#', ''));
      const targetIndex = slides.findIndex((slide) => slide.id === id);
      if (targetIndex === -1) return;
      if (isHorizontal) {
        goTo(targetIndex, !viaNav);
      } else {
        slides[targetIndex].scrollIntoView({ behavior: viaNav ? 'smooth' : 'auto', block: 'start' });
      }
    };

    window.addEventListener('hashchange', () => {
      scrollToHash(window.location.hash);
    });

    updateMode();
    if (window.location.hash) {
      scrollToHash(window.location.hash);
    } else {
      if (isHorizontal) {
        announce();
      }
    }
  }
})();
