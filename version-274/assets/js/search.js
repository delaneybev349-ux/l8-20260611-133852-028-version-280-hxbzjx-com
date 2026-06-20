(function () {
  function $(selector) {
    return document.querySelector(selector);
  }

  function text(value) {
    return String(value || '').toLowerCase();
  }

  function option(value) {
    var el = document.createElement('option');
    el.value = value;
    el.textContent = value;
    return el;
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<a class="movie-card group" href="' + escapeHtml(movie.url) + '">' +
      '<div class="movie-poster-wrap">' +
      '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="category-pill">' + escapeHtml(movie.category) + '</span>' +
      '<span class="duration">' + escapeHtml(movie.duration) + '</span>' +
      '<span class="play-hover" aria-hidden="true">▶</span>' +
      '</div>' +
      '<div class="movie-card-body">' +
      '<h3>' + escapeHtml(movie.title) + '</h3>' +
      '<p>' + escapeHtml(movie.description) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '<div class="stats-row"><span>👁 ' + Number(movie.views).toLocaleString() + '</span><span>♡ ' + Number(movie.likes).toLocaleString() + '</span></div>' +
      '</div>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function unique(list, key) {
    var values = [];
    list.forEach(function (item) {
      var value = item[key];
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function init() {
    var data = window.SEARCH_MOVIES || [];
    var input = $('#searchInput');
    var results = $('#searchResults');
    var summary = $('#searchSummary');
    var regionFilter = $('#regionFilter');
    var yearFilter = $('#yearFilter');
    var typeFilter = $('#typeFilter');
    if (!input || !results || !summary) {
      return;
    }

    unique(data, 'region').forEach(function (value) {
      regionFilter.appendChild(option(value));
    });
    unique(data, 'year').forEach(function (value) {
      yearFilter.appendChild(option(value));
    });
    unique(data, 'type').forEach(function (value) {
      typeFilter.appendChild(option(value));
    });

    var params = new URLSearchParams(location.search);
    input.value = params.get('q') || '';

    function render() {
      var keyword = text(input.value).trim();
      var region = regionFilter.value;
      var year = yearFilter.value;
      var type = typeFilter.value;
      var filtered = data.filter(function (movie) {
        var haystack = text([movie.title, movie.description, movie.region, movie.year, movie.type, movie.genre, (movie.tags || []).join(' ')].join(' '));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedRegion = !region || movie.region === region;
        var matchedYear = !year || movie.year === year;
        var matchedType = !type || movie.type === type;
        return matchedKeyword && matchedRegion && matchedYear && matchedType;
      }).slice(0, 120);
      summary.textContent = filtered.length ? '为您找到以下相关内容' : '没有找到匹配内容';
      results.innerHTML = filtered.map(card).join('');
    }

    input.addEventListener('input', render);
    regionFilter.addEventListener('change', render);
    yearFilter.addEventListener('change', render);
    typeFilter.addEventListener('change', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
