document.querySelectorAll("[data-video-player]").forEach((player) => {
  const video = player.querySelector("video");
  const playButton = player.querySelector(".video-play-button");
  const seekBar = player.querySelector(".video-seek");
  const currentTimeDisplay = player.querySelector(".video-current-time");
  const durationDisplay = player.querySelector(".video-duration");
  const status = player.querySelector(".video-status");

  if (!video || !playButton || !seekBar || !currentTimeDisplay || !durationDisplay || !status) {
    return;
  }

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) {
      return "0:00";
    }

    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = String(totalSeconds % 60).padStart(2, "0");
    const hours = Math.floor(minutes / 60);

    return hours > 0
      ? `${hours}:${String(minutes % 60).padStart(2, "0")}:${remainingSeconds}`
      : `${minutes}:${remainingSeconds}`;
  };

  const updatePlaybackState = () => {
    const isPlaying = !video.paused && !video.ended;
    playButton.textContent = isPlaying ? "Pause" : "Play";
    playButton.setAttribute("aria-label", isPlaying ? "Pause video" : "Play video");
  };

  const updateProgress = () => {
    const duration = video.duration;
    const currentTime = video.currentTime;
    const progress = Number.isFinite(duration) && duration > 0
      ? (currentTime / duration) * 100
      : 0;

    seekBar.value = String(currentTime);
    seekBar.style.setProperty("--seek-progress", `${progress}%`);
    seekBar.setAttribute(
      "aria-valuetext",
      `${formatTime(currentTime)} of ${formatTime(duration)}`
    );
    currentTimeDisplay.textContent = formatTime(currentTime);
  };

  const updateDuration = () => {
    if (Number.isFinite(video.duration) && video.duration > 0) {
      seekBar.max = String(video.duration);
      seekBar.disabled = false;
      playButton.disabled = false;
      durationDisplay.textContent = formatTime(video.duration);
      status.textContent = "";
      updateProgress();
    }
  };

  playButton.addEventListener("click", () => {
    status.textContent = "";
    if (video.paused) {
      video.play().catch(() => {
        status.textContent = "The video could not start playing.";
      });
    } else {
      video.pause();
    }
  });

  seekBar.addEventListener("input", () => {
    video.currentTime = Number(seekBar.value);
    updateProgress();
  });

  video.addEventListener("loadedmetadata", updateDuration);
  video.addEventListener("durationchange", updateDuration);
  video.addEventListener("timeupdate", updateProgress);
  video.addEventListener("play", updatePlaybackState);
  video.addEventListener("pause", updatePlaybackState);
  video.addEventListener("ended", updatePlaybackState);
  video.addEventListener("error", () => {
    playButton.disabled = true;
    seekBar.disabled = true;
    status.textContent = "The video could not be loaded. Check the video file path.";
  });
});
