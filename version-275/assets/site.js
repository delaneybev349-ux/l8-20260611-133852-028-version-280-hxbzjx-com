(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return String(value || "").toLowerCase().trim();
  }

  function unique(values) {
    var seen = [];
    values.forEach(function(value) {
      if (value && seen.indexOf(value) === -1) {
        seen.push(value);
      }
    });
    return seen;
  }

  function fillSelect(select, values, suffix) {
    if (!select || select.children.length > 1) {
      return;
    }
    unique(values).sort().reverse().forEach(function(value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = suffix ? value + suffix : value;
      select.appendChild(option);
    });
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function() {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        show(dotIndex);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function(panel) {
      var grid = panel.nextElementSibling;
      if (!grid || !grid.matches("[data-filter-grid]")) {
        return;
      }
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-filter-year]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var reset = panel.querySelector("[data-filter-reset]");
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-title]"));

      fillSelect(year, cards.map(function(card) {
        return card.getAttribute("data-year");
      }), "年");
      fillSelect(region, cards.map(function(card) {
        return card.getAttribute("data-region");
      }), "");
      fillSelect(type, cards.map(function(card) {
        return card.getAttribute("data-type");
      }), "");

      function apply() {
        var query = text(input && input.value);
        var selectedYear = year ? year.value : "";
        var selectedRegion = region ? region.value : "";
        var selectedType = type ? type.value : "";
        cards.forEach(function(card) {
          var haystack = text([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
          ].join(" "));
          var matched = true;
          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }
          if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
            matched = false;
          }
          if (selectedRegion && card.getAttribute("data-region") !== selectedRegion) {
            matched = false;
          }
          if (selectedType && card.getAttribute("data-type") !== selectedType) {
            matched = false;
          }
          card.classList.toggle("is-filter-hidden", !matched);
        });
      }

      [input, year, region, type].forEach(function(control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      if (reset) {
        reset.addEventListener("click", function() {
          if (input) {
            input.value = "";
          }
          if (year) {
            year.value = "";
          }
          if (region) {
            region.value = "";
          }
          if (type) {
            type.value = "";
          }
          apply();
        });
      }
    });
  }

  function renderSearch(target, query, limit) {
    var data = window.MovieSearchData || [];
    var q = text(query);
    if (!target) {
      return;
    }
    if (!q) {
      target.classList.remove("is-open");
      target.innerHTML = "";
      return;
    }
    var results = data.filter(function(item) {
      var haystack = text([
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        item.category,
        (item.tags || []).join(" "),
        item.oneLine
      ].join(" "));
      return haystack.indexOf(q) !== -1;
    }).slice(0, limit || 48);

    target.innerHTML = results.map(function(item) {
      return '<a class="search-result-card" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '" loading="lazy">' +
        '<div><h3>' + item.title + '</h3><p>' + item.region + ' · ' + item.year + ' · ' + item.type + '</p><p>' + item.oneLine + '</p></div>' +
        '</a>';
    }).join("");
    target.classList.toggle("is-open", results.length > 0);
  }

  function initSearchPage() {
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-page-search-results]");
    var form = document.querySelector("[data-search-form]");
    if (!input || !results) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;
    renderSearch(results, query, 96);
    input.addEventListener("input", function() {
      renderSearch(results, input.value, 96);
    });
    if (form) {
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        var nextUrl = "./search.html?q=" + encodeURIComponent(input.value.trim());
        window.history.replaceState(null, "", nextUrl);
        renderSearch(results, input.value, 96);
      });
    }
  }

  ready(function() {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
