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
    const initialHash = window.location.hash;
    let currentIndex = 0;
    let isHorizontal = true;
    let isAnimating = false;
    let offsets = [];
    let resizeTimer = 0;
    let hasInteracted = Boolean(window.location.hash);
    let resizeObserver = null;

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
        const buffer = 16;
        const targetHeight = active.offsetHeight + buffer;
        const isSmooth = slider.hasAttribute('data-transitioning') || isAnimating;
        if (isSmooth) {
          slider.style.transition = 'height 0.6s cubic-bezier(.7,0,.3,1)';
        } else {
          slider.style.transition = '';
        }
        slider.style.height = targetHeight > 0 ? `${targetHeight}px` : 'auto';
        if (isSmooth) {
          window.setTimeout(() => {
            slider.style.transition = '';
          }, 620);
        }
      }
    };

    const observeActive = () => {
      if (!('ResizeObserver' in window)) return;
      if (!resizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          window.requestAnimationFrame(setHeight);
        });
      }
      resizeObserver.disconnect();
      const active = slides[currentIndex];
      if (active) {
        resizeObserver.observe(active);
      }
    };

    const computeOffsets = () => {
      if (!isHorizontal) return;
      const gap = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || '0') || 0;
      let running = 0;
      offsets = slides.map((slide, idx) => {
        if (idx === 0) {
          running = 0;
          return 0;
        }
        running += slides[idx - 1].offsetWidth + gap;
        return running;
      });
      setHeight();
    };

    const syncToIndex = (index, updateHash = true) => {
      if (!isHorizontal) return;
      if (!offsets.length) computeOffsets();
      applyIndex(index, updateHash);
    };

    const applyIndex = (index, updateHash = true) => {
      if (!isHorizontal) return;
      currentIndex = index;
      if (!offsets.length) computeOffsets();
      const offset = offsets[index] || 0;
      track.style.transform = `translateX(-${offset}px)`;
      setHeight();
      announce();
      if (updateHash) {
        setHashSilently(slides[index]?.id || '');
      }
      observeActive();
    };

    const goTo = (index, updateHash = true) => {
      if (!isHorizontal) return;
      if (!offsets.length) computeOffsets();
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

    const updateMode = () => {
      slider.classList.add('is-horizontal');
      track.style.transform = '';
      slider.style.height = 'auto';
      slider.removeAttribute('data-transitioning');
      isAnimating = false;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          computeOffsets();
          applyIndex(currentIndex, hasInteracted);
        });
      });
    };

    window.addEventListener('resize', () => {
      if (!isHorizontal) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        computeOffsets();
        applyIndex(currentIndex);
      }, 150);
    });

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
        if (!offsets.length) computeOffsets();
        goTo(targetIndex, !viaNav);
      } else {
        slides[targetIndex].scrollIntoView({ behavior: viaNav ? 'smooth' : 'auto', block: 'start' });
      }
    };

    window.addEventListener('hashchange', () => {
      scrollToHash(window.location.hash);
    });

    updateMode();
    const finalizeInitial = () => {
      if (initialHash) {
        syncToIndex(Math.max(0, slides.findIndex(slide => slide.id === initialHash.replace('#', ''))), false);
      } else if (isHorizontal) {
        announce();
      }
    };

    const readyCallbacks = [];
    if (typeof document !== 'undefined' && document.readyState !== 'complete') {
      readyCallbacks.push(new Promise(resolve => {
        window.addEventListener('load', resolve, { once: true });
      }));
    }
    if (document.fonts && document.fonts.ready) {
      readyCallbacks.push(document.fonts.ready.catch(() => {}));
    }

    Promise.all(readyCallbacks).finally(() => {
      window.requestAnimationFrame(() => {
        computeOffsets();
        finalizeInitial();
      });
    });

    if (initialHash) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          scrollToHash(initialHash);
        });
      });
    }
  }
})();
