(function () {
    const menuButton = document.querySelector('[data-menu-button]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const tabs = Array.from(hero.querySelectorAll('[data-hero-tab]'));
        let current = 0;

        function showSlide(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            tabs.forEach(function (tab, tabIndex) {
                tab.classList.toggle('active', tabIndex === current);
            });
        }

        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                const next = Number(tab.getAttribute('data-hero-tab'));
                showSlide(next);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5800);
        }
    }

    const searchInput = document.querySelector('[data-card-search]');
    const yearFilter = document.querySelector('[data-year-filter]');
    const cardList = document.querySelector('[data-card-list]');
    const emptyState = document.querySelector('[data-empty-state]');

    if (searchInput && searchInput.hasAttribute('data-read-query')) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        if (query) {
            searchInput.value = query;
        }
    }

    function filterCards() {
        if (!cardList) {
            return;
        }

        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const year = yearFilter ? yearFilter.value : '';
        const cards = Array.from(cardList.querySelectorAll('.movie-card'));
        let visible = 0;

        cards.forEach(function (card) {
            const text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-year')
            ].join(' ').toLowerCase();
            const cardYear = card.getAttribute('data-year') || '';
            const matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            const matchedYear = !year || cardYear === year;
            const matched = matchedKeyword && matchedYear;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.style.display = visible === 0 ? 'block' : 'none';
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', filterCards);
    }

    filterCards();

    const playButton = document.querySelector('[data-stream]');
    const video = document.getElementById('movie-player');

    if (playButton && video) {
        playButton.addEventListener('click', function () {
            const stream = playButton.getAttribute('data-stream');
            playButton.classList.add('hidden');

            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                video.addEventListener('loadedmetadata', function () {
                    video.play().catch(function () {});
                }, { once: true });
                return;
            }

            video.src = stream;
            video.play().catch(function () {});
        });
    }
})();
