(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
  var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));

  function filterCards(query) {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");
    var normalized = query.trim().toLowerCase();
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute("data-text") || card.textContent || "").toLowerCase();
      var matched = !normalized || text.indexOf(normalized) !== -1;
      card.classList.toggle("is-filter-hidden", !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", cards.length > 0 && visible === 0);
    }
  }

  inputs.forEach(function (input) {
    input.addEventListener("input", function () {
      filterCards(input.value);
    });
  });

  forms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("[data-search-input]");
      if (input) {
        filterCards(input.value);
      }
    });
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById("movie-video");
  var overlay = document.getElementById("video-overlay");
  var ready = false;
  var hlsInstance = null;

  if (!video || !overlay || !streamUrl) {
    return;
  }

  function prepareVideo() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function beginPlayback() {
    prepareVideo();
    video.controls = true;
    overlay.classList.add("is-hidden");

    var playRequest = video.play();

    if (playRequest && typeof playRequest.catch === "function") {
      playRequest.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", beginPlayback);

  video.addEventListener("click", function () {
    if (video.paused) {
      beginPlayback();
    }
  });

  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });

  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
