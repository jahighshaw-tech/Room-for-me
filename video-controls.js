document.querySelectorAll("[data-video-player]").forEach((player) => {
  const video = player.querySelector("video");
  const playlist = [...(video?.querySelectorAll("source[data-playlist-src]") ?? [])]
    .map((source) => source.dataset.playlistSrc)
    .filter(Boolean);
  const playButton = player.querySelector(".video-play-button");
  const seekBar = player.querySelector(".video-seek");
  const currentTimeDisplay = player.querySelector(".video-current-time");
  const durationDisplay = player.querySelector(".video-duration");
  const status = player.querySelector(".video-status");

  if (!video || !playButton || !seekBar || !currentTimeDisplay || !durationDisplay || !status) {
    return;
  }

  if (playlist.length === 0) {
    playButton.disabled = true;
    status.textContent = "No videos are configured.";
    return;
  }

  const updatePlaybackState = () => {
    const isPlaying = !video.paused && !video.ended;
    playButton.textContent = isPlaying ? "Pause" : "Play";
    playButton.setAttribute("aria-label", isPlaying ? "Pause video" : "Play video");
  };

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

  let currentVideoIndex = 0;

  const loadVideo = (index, autoplay = false) => {
    currentVideoIndex = index;
    video.src = playlist[index];
    video.load();
    seekBar.value = "0";
    seekBar.max = "0";
    seekBar.disabled = true;
    seekBar.style.setProperty("--seek-progress", "0%");
    currentTimeDisplay.textContent = "0:00";
    durationDisplay.textContent = "0:00";
    status.textContent = autoplay ? "Loading next video..." : "";

    if (autoplay) {
      video.play().catch(() => {
        status.textContent = "The next video could not start playing.";
      });
    }
  };

  const updateDuration = () => {
    if (Number.isFinite(video.duration) && video.duration > 0) {
      seekBar.max = String(video.duration);
      seekBar.disabled = false;
      playButton.disabled = false;
      status.textContent = "";
      updateProgress();
    } else {
      seekBar.disabled = true;
      playButton.disabled = true;
    }
  };

  playButton.addEventListener("click", () => {
    status.textContent = "";
    if (video.ended && currentVideoIndex === playlist.length - 1) {
      loadVideo(0, true);
    } else if (video.paused) {
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
  video.addEventListener("ended", () => {
    if (currentVideoIndex < playlist.length - 1) {
      loadVideo(currentVideoIndex + 1, true);
    } else {
      updatePlaybackState();
    }
  });
  video.addEventListener("error", () => {
    playButton.disabled = true;
    status.textContent = "The video could not be loaded. Check the video file path.";
  });

  loadVideo(currentVideoIndex);
});
