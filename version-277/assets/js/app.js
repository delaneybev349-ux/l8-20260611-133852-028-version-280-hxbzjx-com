(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var track = carousel.querySelector("[data-hero-track]");
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function setSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        setSlide(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        setSlide(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        setSlide(dotIndex);
        start();
      });
    });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    setSlide(0);
    start();
  }

  function textOf(value) {
    return (value || "").toString().toLowerCase();
  }

  function initFilters() {
    var input = document.querySelector("[data-movie-filter]");
    var typeSelect = document.querySelector("[data-type-filter]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var count = document.querySelector("[data-result-count]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && input) {
      input.value = q;
    }

    function apply() {
      var keyword = textOf(input && input.value);
      var type = textOf(typeSelect && typeSelect.value);
      var year = textOf(yearSelect && yearSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = textOf([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-desc")
        ].join(" "));
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okType = !type || textOf(card.getAttribute("data-type")).indexOf(type) !== -1;
        var okYear = !year || textOf(card.getAttribute("data-year")) === year;
        var show = okKeyword && okType && okYear;
        card.classList.toggle("hidden-card", !show);
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible;
      }
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    if (!players.length) {
      return;
    }

    function loadPlayer(player) {
      if (!player) {
        return;
      }
      var video = player.querySelector("video");
      var stream = player.getAttribute("data-stream");
      if (!video || !stream) {
        return;
      }
      player.classList.add("is-playing");
      if (video.dataset.loaded === "1") {
        video.play().catch(function () {});
        return;
      }
      video.dataset.loaded = "1";
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hlsInstance = hls;
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }
      video.src = stream;
      video.addEventListener("loadedmetadata", function () {
        video.play().catch(function () {});
      }, { once: true });
      video.load();
    }

    players.forEach(function (player) {
      var button = player.querySelector("[data-play]");
      var video = player.querySelector("video");
      if (button) {
        button.addEventListener("click", function () {
          loadPlayer(player);
        });
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.dataset.loaded !== "1") {
            loadPlayer(player);
          }
        });
      }
    });
  }

  ready(function () {
    initHero();
    initFilters();
    initPlayers();
  });
})();
