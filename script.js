// scroll animation
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");
  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };
  const callback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  };
  const observer = new IntersectionObserver(callback, options);
  sections.forEach((section) => {
    section.classList.add("hidden");
    observer.observe(section);
  });
});

// slider
document.addEventListener("DOMContentLoaded", () => {
  const viewport = document.getElementById("featuresSlider");
  if (!viewport) return;

  const track = viewport.querySelector(".slider__track");
  if (!track) return;

  const slider = viewport.closest(".slider");
  if (!slider) return;

  const btnPrev = slider.querySelector("[data-slider-prev]");
  const btnNext = slider.querySelector("[data-slider-next]");
  if (!btnPrev || !btnNext) return;

  let index = 0;

  const getGap = () => {
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "0");
    return Number.isFinite(gap) ? gap : 0;
  };

  const getCardWidth = () => {
    const card = track.querySelector(".card");
    if (!card) return 0;
    return card.getBoundingClientRect().width;
  };

  const getVisibleCount = () => {
    const cardWidth = getCardWidth();
    if (!cardWidth) return 1;
    const gap = getGap();
    const viewportWidth = viewport.getBoundingClientRect().width;
    const count = Math.floor((viewportWidth + gap) / (cardWidth + gap));
    return Math.max(1, count);
  };

  const getMaxIndex = () => {
    const total = track.querySelectorAll(".card").length;
    const visible = getVisibleCount();
    return Math.max(0, total - visible);
  };

  const clampIndex = () => {
    const maxIndex = getMaxIndex();
    if (index > maxIndex) index = maxIndex;
    if (index < 0) index = 0;
  };

  const getShiftByIndex = () => {
    const cardWidth = getCardWidth();
    const gap = getGap();
    return (cardWidth + gap) * index;
  };

  const render = () => {
    clampIndex();
    const shift = getShiftByIndex();
    track.style.transform = `translateX(${-shift}px)`;
    btnPrev.disabled = index === 0;
    btnNext.disabled = index === getMaxIndex();
  };

  btnPrev.addEventListener("click", () => {
    index -= 1;
    render();
  });

  btnNext.addEventListener("click", () => {
    index += 1;
    render();
  });

  window.addEventListener("resize", () => {
    render();
  });

  /* swipe / drag */
  let isDown = false;
  let startX = 0;
  let startShift = 0;
  let moved = 0;

  const pointerX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

  const onDown = (e) => {
    const cardWidth = getCardWidth();
    if (!cardWidth) return;

    isDown = true;
    moved = 0;
    startX = pointerX(e);
    startShift = getShiftByIndex();

    track.classList.add("is_dragging");
  };

  const onMove = (e) => {
    if (!isDown) return;

    const x = pointerX(e);
    const dx = x - startX;
    moved = dx;

    const maxShift = getShiftByIndexFromMax();
    let nextShift = startShift - dx;

    if (nextShift < 0) nextShift = 0;
    if (nextShift > maxShift) nextShift = maxShift;

    track.style.transform = `translateX(${-nextShift}px)`;
  };

  const getShiftByIndexFromMax = () => {
    const cardWidth = getCardWidth();
    const gap = getGap();
    return (cardWidth + gap) * getMaxIndex();
  };

  const onUp = () => {
    if (!isDown) return;
    isDown = false;

    track.classList.remove("is_dragging");

    const cardWidth = getCardWidth();
    const gap = getGap();
    const step = cardWidth + gap;

    const threshold = Math.max(40, step * 0.2);

    if (moved <= -threshold) {
      index += 1;
    } else if (moved >= threshold) {
      index -= 1;
    }

    render();
  };

  viewport.addEventListener("mousedown", onDown);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);

  viewport.addEventListener("touchstart", onDown, { passive: true });
  viewport.addEventListener("touchmove", onMove, { passive: true });
  viewport.addEventListener("touchend", onUp);

  render();
});
