// Minimal slider logic for gallery
// No dependencies required

document.addEventListener('DOMContentLoaded', function () {
  const gallery = document.querySelector('.gallery');
  if (!gallery) return;
  const figures = Array.from(gallery.children);
  let current = 0;

  // Create slider container
  const slider = document.createElement('div');
  slider.className = 'gallery-slider';
  slider.style.position = 'relative';
  slider.style.overflow = 'hidden';
  slider.style.width = '100%';
  // Height will be set dynamically based on first image aspect ratio
  slider.style.height = 'auto';

  // Create track
  const track = document.createElement('div');
  track.className = 'gallery-track';
  track.style.display = 'flex';
  track.style.transition = 'transform 0.5s cubic-bezier(.7,0,.3,1)';
  track.style.height = '100%';

  // Move figures into track
  figures.forEach(fig => {
    fig.style.flex = '0 0 80%'; // Show partial next/prev
    fig.style.margin = '0 16px'; // Buffer on edges
    const img = fig.querySelector('img');
    if (!img) return;
    img.style.objectFit = 'contain'; // Prevent cropping
    img.style.background = '#222';
    img.style.width = '100%';
    img.style.height = 'auto';
    // Ensure lazy loading for non-first images
    if (img.loading === undefined || img.loading === '') img.loading = 'lazy';
    // Hint browsers to decode off-main-thread
    try { img.decoding = 'async'; } catch (e) {}
    track.appendChild(fig);
  });

  slider.appendChild(track);

  // Controls
  const prev = document.createElement('button');
  prev.textContent = '‹';
  prev.className = 'gallery-prev';
  prev.style.position = 'absolute';
  prev.style.left = '0';
  prev.style.top = '50%';
  prev.style.transform = 'translateY(-50%)';
  prev.style.background = 'rgba(15,23,42,0.7)';
  prev.style.color = '#e5e7eb';
  prev.style.border = 'none';
  prev.style.fontSize = '2rem';
  prev.style.cursor = 'pointer';
  prev.style.zIndex = '2';
  prev.style.borderRadius = '50%';
  prev.style.width = prev.style.height = '40px';

  const next = document.createElement('button');
  next.textContent = '›';
  next.className = 'gallery-next';
  next.style.position = 'absolute';
  next.style.right = '0';
  next.style.top = '50%';
  next.style.transform = 'translateY(-50%)';
  next.style.background = 'rgba(15,23,42,0.7)';
  next.style.color = '#e5e7eb';
  next.style.border = 'none';
  next.style.fontSize = '2rem';
  next.style.cursor = 'pointer';
  next.style.zIndex = '2';
  next.style.borderRadius = '50%';
  next.style.width = next.style.height = '40px';

  function update() {
    track.style.transform = `translateX(-${current * 80}%)`;
    prev.disabled = current === 0;
    next.disabled = current === figures.length - 1;
    prev.style.opacity = prev.disabled ? '0.3' : '1';
    next.style.opacity = next.disabled ? '0.3' : '1';
  }

  prev.onclick = function () {
    if (current > 0) {
      current--;
      update();
    }
  };
  next.onclick = function () {
    if (current < figures.length - 1) {
      current++;
      update();
    }
  };

  slider.appendChild(prev);
  slider.appendChild(next);

  // Replace gallery with slider
  gallery.parentNode.replaceChild(slider, gallery);

  // Compute and lock slider height to first image's aspect ratio
  const firstImg = figures[0]?.querySelector('img');
  const firstFigure = figures[0];

  function setDimensions() {
    if (!firstImg || !firstFigure) return;
    const w = slider.clientWidth || firstImg.clientWidth || 1;
    // Fallback aspect in case natural sizes are not ready
    const aspect = (firstImg.naturalWidth && firstImg.naturalHeight)
      ? (firstImg.naturalHeight / firstImg.naturalWidth)
      : (9 / 16);

    // Height for the image area (content box), rounding to whole px
    const imgContentHeight = Math.max(1, Math.round(w * aspect));

    // Apply the height to all images so figures compute correct total height
    figures.forEach(fig => {
      const img = fig.querySelector('img');
      if (!img) return;
      img.style.height = imgContentHeight + 'px';
    });

    // After layout, measure the first figure's full height (image + padding + caption + borders)
    requestAnimationFrame(() => {
      const total = firstFigure.offsetHeight;
      if (total > 0) {
        slider.style.height = total + 'px';
      }
    });
  }

  function readyToMeasure() {
    return firstImg && (firstImg.complete && firstImg.naturalWidth > 0);
  }

  function initDimensions() {
    if (readyToMeasure()) {
      setDimensions();
    } else if (firstImg) {
      firstImg.addEventListener('load', setDimensions, { once: true });
      firstImg.addEventListener('error', setDimensions, { once: true });
      // In case the browser sets complete=true late
      setTimeout(setDimensions, 200);
    }
  }

  // Recompute on resize
  let resizeTO;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(setDimensions, 100);
  });

  // Initialize and first position update
  initDimensions();
  update();
});
