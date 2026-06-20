const body = document.body;
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    mobileNav.classList.toggle("open");
    body.classList.toggle("menu-open", mobileNav.classList.contains("open"));
  });
}

const slider = document.querySelector("[data-hero-slider]");

if (slider) {
  const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
  const prev = slider.querySelector("[data-hero-prev]");
  const next = slider.querySelector("[data-hero-next]");
  let index = 0;
  let timer = null;

  const show = (target) => {
    if (!slides.length) return;
    index = (target + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
  };

  const restart = () => {
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(() => show(index + 1), 5000);
  };

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      show(i);
      restart();
    });
  });

  if (prev) {
    prev.addEventListener("click", () => {
      show(index - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      show(index + 1);
      restart();
    });
  }

  show(0);
  restart();
}

const normalize = (value) => String(value || "").trim().toLowerCase();
const params = new URLSearchParams(window.location.search);
const incomingQuery = params.get("q") || "";
const filterInput = document.querySelector("[data-filter-input]");

if (filterInput && incomingQuery) {
  filterInput.value = incomingQuery;
}

document.querySelectorAll("[data-site-search-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    const input = form.querySelector("input[name='q']");
    if (!input) return;
    const query = input.value.trim();
    if (!query && !document.querySelector("[data-filter-list]")) {
      event.preventDefault();
      window.location.href = "./search.html";
    }
  });
});

document.querySelectorAll("[data-filter-list]").forEach((list) => {
  const cards = Array.from(list.querySelectorAll("[data-movie-card]"));
  const count = list.querySelector("[data-filter-count]");
  const yearButtons = Array.from(list.querySelectorAll("[data-filter-year]"));
  const localInput = document.querySelector("[data-filter-input]");
  let activeYear = "all";

  const render = () => {
    const query = normalize(localInput ? localInput.value : incomingQuery);
    let visible = 0;

    cards.forEach((card) => {
      const text = normalize(card.dataset.search);
      const year = card.dataset.year || "";
      const matchQuery = !query || text.includes(query);
      const matchYear = activeYear === "all" || year === activeYear;
      const showCard = matchQuery && matchYear;
      card.hidden = !showCard;
      if (showCard) visible += 1;
    });

    if (count) {
      count.textContent = `已筛选 ${visible} 部`;
    }
  };

  yearButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeYear = button.dataset.filterYear || "all";
      yearButtons.forEach((item) => item.classList.toggle("active", item === button));
      render();
    });
  });

  if (localInput) {
    localInput.addEventListener("input", render);
  }

  render();
});
