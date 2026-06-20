import { H as Hls } from "./hls.js";

const shells = document.querySelectorAll("[data-player-shell]");

shells.forEach((shell) => {
  const video = shell.querySelector("[data-player-video]");
  const button = shell.querySelector("[data-play-button]");

  if (!video || !button) return;

  const stream = video.dataset.stream;
  let hls = null;
  let prepared = false;

  const prepare = () => {
    if (prepared || !stream) return;
    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.load();
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return;
    }

    video.src = stream;
    video.load();
  };

  const play = () => {
    prepare();
    button.classList.add("is-hidden");
    video.controls = true;
    const attempt = video.play();

    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => {
        button.classList.remove("is-hidden");
      });
    }
  };

  button.addEventListener("click", play);
  video.addEventListener("click", () => {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", () => button.classList.add("is-hidden"));
  video.addEventListener("pause", () => {
    if (video.currentTime === 0 || video.ended) {
      button.classList.remove("is-hidden");
    }
  });
  window.addEventListener("beforeunload", () => {
    if (hls) hls.destroy();
  });
});
