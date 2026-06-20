(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('.menu-button');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
      menuButton.addEventListener('click', function () {
        mobilePanel.classList.toggle('open');
      });
    }

    document.querySelectorAll('form[action="./search.html"]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    var slideIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      slideIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === slideIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === slideIndex);
      });
    }

    if (slides.length) {
      showSlide(0);
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          showSlide(i);
        });
      });
      window.setInterval(function () {
        showSlide(slideIndex + 1);
      }, 5600);
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var searchInput = document.querySelector('.toolbar input[name="keyword"]');
    if (searchInput && q) {
      searchInput.value = q;
    }

    var filterButton = document.querySelector('.toolbar button');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var emptyState = document.querySelector('.empty-state');

    function applyFilters() {
      if (!cards.length) {
        return;
      }

      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var yearSelect = document.querySelector('select[name="year"]');
      var typeSelect = document.querySelector('select[name="type"]');
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region')
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchType = !type || (card.getAttribute('data-type') || '').indexOf(type) !== -1;
        var matched = matchKeyword && matchYear && matchType;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = visible ? 'none' : 'block';
      }
    }

    if (filterButton) {
      filterButton.addEventListener('click', applyFilters);
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
      applyFilters();
    }

    document.querySelectorAll('select[name="year"], select[name="type"]').forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    var video = document.getElementById('player-video');
    var cover = document.querySelector('.player-cover');
    var playButton = document.querySelector('.play-button');
    var initialized = false;

    function bindPlayer() {
      if (!video || initialized || typeof streamUrl !== 'string') {
        return;
      }
      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function startPlayer() {
      if (!video) {
        return;
      }
      bindPlayer();
      if (cover) {
        cover.classList.add('hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlayer);
    }

    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayer();
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayer();
        } else {
          video.pause();
        }
      });
    }
  });
})();
