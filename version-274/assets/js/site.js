(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('.mobile-menu-toggle');
    var panel = qs('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
        button.setAttribute('aria-expanded', 'true');
        button.textContent = '×';
      } else {
        panel.setAttribute('hidden', '');
        button.setAttribute('aria-expanded', 'false');
        button.textContent = '☰';
      }
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var title = qs('[data-hero-title]', hero);
    var desc = qs('[data-hero-desc]', hero);
    var bg = qs('[data-hero-bg]', hero);
    var link = qs('[data-hero-link]', hero);
    var category = qs('[data-hero-category]', hero);
    var thumbs = qsa('.hero-thumb', hero);
    var activeIndex = 0;

    function apply(item) {
      if (!item) {
        return;
      }
      thumbs.forEach(function (thumb) {
        thumb.classList.toggle('is-active', thumb === item);
      });
      if (title) {
        title.textContent = item.dataset.heroTitle || '';
      }
      if (desc) {
        desc.textContent = item.dataset.heroDesc || '';
      }
      if (bg && item.dataset.heroImage) {
        bg.style.opacity = '0.35';
        window.setTimeout(function () {
          bg.src = item.dataset.heroImage;
          bg.alt = item.dataset.heroTitle || '';
          bg.style.opacity = '1';
        }, 120);
      }
      if (link && item.dataset.heroLink) {
        link.href = item.dataset.heroLink;
      }
      if (category && item.dataset.heroCategory) {
        category.href = item.dataset.heroCategory;
        category.textContent = '更多' + (item.dataset.heroCategoryName || '分类');
      }
    }

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener('click', function () {
        activeIndex = index;
        apply(thumb);
      });
    });

    if (thumbs.length > 1) {
      window.setInterval(function () {
        activeIndex = (activeIndex + 1) % thumbs.length;
        apply(thumbs[activeIndex]);
      }, 5200);
    }
  }

  function initShareButtons() {
    qsa('.share-button').forEach(function (button) {
      button.addEventListener('click', function () {
        var title = document.title;
        var url = location.href;
        if (navigator.share) {
          navigator.share({ title: title, url: url }).catch(function () {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () {
            button.textContent = '链接已复制';
            window.setTimeout(function () {
              button.textContent = '分享作品';
            }, 1600);
          });
        }
      });
    });
  }

  window.initMoviePlayer = function (root, url) {
    if (!root || !url) {
      return;
    }
    var video = qs('video', root);
    var cover = qs('.player-cover', root);
    var loaded = false;
    var hlsInstance = null;

    function load() {
      if (!video || loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      load();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initShareButtons();
  });
})();
