const ready = (callback) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function setupMobileMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.textContent = isOpen ? '×' : '☰';
  });
}

function setupSearchPage() {
  const page = document.querySelector('[data-search-page]');

  if (!page || !Array.isArray(window.MOVIE_INDEX)) {
    return;
  }

  const form = page.querySelector('[data-search-form]');
  const input = page.querySelector('[data-search-input]');
  const results = page.querySelector('[data-search-results]');
  const title = page.querySelector('[data-search-title]');
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  input.value = initialQuery;

  const render = (query) => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matched = window.MOVIE_INDEX.filter((movie) => {
      const haystack = [
        movie.title,
        movie.region,
        movie.year,
        movie.category,
        movie.oneLine,
        ...(movie.tags || [])
      ].join(' ').toLowerCase();

      return words.length === 0 || words.every((word) => haystack.includes(word));
    }).slice(0, 120);

    title.textContent = words.length ? `搜索：${query.trim()}` : '影片搜索';

    if (!matched.length) {
      results.innerHTML = '<div class="search-empty">没有找到匹配内容，可以换一个关键词继续查找。</div>';
      return;
    }

    results.innerHTML = matched.map((movie) => `
      <a class="movie-card" href="${escapeHtml(movie.url)}">
        <div class="movie-poster">
          <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
          <span class="poster-badge">${escapeHtml(movie.region)}</span>
          <span class="poster-year">${escapeHtml(movie.year)}</span>
          <span class="movie-hover-play">▶</span>
        </div>
        <div class="movie-info">
          <h3 class="movie-title">${escapeHtml(movie.title)}</h3>
          <p class="movie-meta">${escapeHtml(movie.category)}</p>
        </div>
      </a>
    `).join('');
  };

  render(initialQuery);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim();
    const nextUrl = query ? `./search.html?q=${encodeURIComponent(query)}` : './search.html';
    window.history.replaceState({}, '', nextUrl);
    render(query);
  });
}

async function attachStream(video, streamUrl) {
  if (video.dataset.ready === 'true') {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = streamUrl;
    video.dataset.ready = 'true';
    return;
  }

  try {
    const module = await import('./hls-vendor.js');
    const Hls = module.H || module.default;

    if (Hls && Hls.isSupported && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video._hls = hls;
      video.dataset.ready = 'true';
      return;
    }
  } catch (error) {
    console.warn('Video loader fallback', error);
  }

  video.src = streamUrl;
  video.dataset.ready = 'true';
}

function setupPlayers() {
  document.querySelectorAll('[data-player]').forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-player-start]');
    const streamUrl = video?.dataset.videoSource;

    if (!video || !streamUrl) {
      return;
    }

    const start = async () => {
      await attachStream(video, streamUrl);

      try {
        await video.play();
      } catch (error) {
        video.controls = true;
      }
    };

    button?.addEventListener('click', start);

    video.addEventListener('click', () => {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('playing', () => player.classList.add('is-playing'));
    video.addEventListener('pause', () => player.classList.remove('is-playing'));
    video.addEventListener('ended', () => player.classList.remove('is-playing'));
  });
}

ready(() => {
  setupMobileMenu();
  setupSearchPage();
  setupPlayers();
});
