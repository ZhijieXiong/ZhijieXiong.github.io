document.getElementById('play-video').addEventListener('click', function(event) {
  event.preventDefault();
  document.getElementById('video-modal').style.display = 'flex';
  document.getElementById('video').play();
});

document.getElementById('video-modal').addEventListener('click', function(event) {
  if (event.target === this) {
      document.getElementById('video').pause();
      this.style.display = 'none';
  }
});
