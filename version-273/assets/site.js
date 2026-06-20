(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        initMenu();
        initHero();
        initFiltering();
        initPlayer();
    });

    function initMenu() {
        var button = document.querySelector('[data-action="menu"]');
        var panel = document.querySelector('[data-panel="menu"]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function initFiltering() {
        var input = document.querySelector(".page-filter-input");
        var scope = document.querySelector("[data-filter-scope]");
        if (!input || !scope) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
        var params = new URLSearchParams(window.location.search);
        var startQuery = params.get("q") || "";
        if (startQuery) {
            input.value = startQuery;
        }
        function cardText(card) {
            return normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags"),
                card.textContent
            ].join(" "));
        }
        function apply(token) {
            var query = normalize(input.value);
            var picked = normalize(token || "");
            if (picked === "全部") {
                picked = "";
            }
            cards.forEach(function (card) {
                var text = cardText(card);
                var matchedQuery = !query || text.indexOf(query) !== -1;
                var matchedToken = !picked || text.indexOf(picked) !== -1;
                card.style.display = matchedQuery && matchedToken ? "" : "none";
            });
        }
        input.addEventListener("input", function () {
            chips.forEach(function (chip) {
                chip.classList.remove("active");
            });
            apply("");
        });
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (item) {
                    item.classList.remove("active");
                });
                chip.classList.add("active");
                apply(chip.getAttribute("data-filter"));
            });
        });
        apply("");
    }

    function initPlayer() {
        var video = document.querySelector('[data-role="video"]');
        var trigger = document.querySelector('[data-action="play"]');
        if (!video || !trigger) {
            return;
        }
        function start() {
            var src = trigger.getAttribute("data-video");
            if (!src) {
                return;
            }
            trigger.classList.add("hidden");
            attachVideo(video, src);
        }
        trigger.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    }

    function attachVideo(video, src) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (video.src !== src) {
                video.src = src;
            }
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (video.hlsPlayer) {
                video.hlsPlayer.destroy();
            }
            var hls = new window.Hls({ enableWorker: true });
            video.hlsPlayer = hls;
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    hls.destroy();
                    video.src = src;
                    video.play().catch(function () {});
                }
            });
            return;
        }
        video.src = src;
        video.play().catch(function () {});
    }
}());
