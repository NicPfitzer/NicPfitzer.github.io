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
  slider.style.height = '220px';

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
    fig.querySelector('img').style.objectFit = 'contain'; // Prevent cropping
    fig.querySelector('img').style.background = '#222';
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
  update();
});
