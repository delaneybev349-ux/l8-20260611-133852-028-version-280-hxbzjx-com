(function() {
  function init(options) {
    var video = document.getElementById(options.videoId);
    var playButton = document.getElementById(options.playButtonId);
    var source = options.source;
    var attached = false;
    var hls = null;

    if (!video || !playButton || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        if (window.Hls.Events && window.Hls.Events.ERROR) {
          hls.on(window.Hls.Events.ERROR, function(eventName, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              hls = null;
              attached = false;
              video.src = source;
            }
          });
        }
        return;
      }

      video.src = source;
    }

    function play() {
      attachSource();
      video.controls = true;
      playButton.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function() {
          playButton.classList.remove("is-hidden");
        });
      }
    }

    playButton.addEventListener("click", play);
    video.addEventListener("click", function() {
      if (!video.controls || video.paused) {
        play();
      }
    });
    video.addEventListener("play", function() {
      playButton.classList.add("is-hidden");
    });
    video.addEventListener("pause", function() {
      if (video.currentTime === 0 || video.ended) {
        playButton.classList.remove("is-hidden");
      }
    });
  }

  window.MoviePlayer = {
    init: init
  };
})();
