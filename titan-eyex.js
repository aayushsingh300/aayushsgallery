(function () {
  'use strict';

  var progress = document.querySelector('.eyex-progress span');
  var ticking = false;

  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var amount = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, amount)) + ')';
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateProgress);
  }, { passive: true });
  updateProgress();

  // Keep a designed campaign still visible until YouTube confirms muted playback.
  var campaignVideo = document.getElementById('eyexCampaignVideo');
  var campaignFrame = campaignVideo && campaignVideo.closest('.film-frame');

  function startCampaignPlayer() {
    if (!campaignVideo || !campaignFrame || !window.YT || !window.YT.Player || campaignVideo.dataset.playerReady) return;
    campaignVideo.dataset.playerReady = 'true';

    new window.YT.Player(campaignVideo, {
      events: {
        onReady: function (event) {
          event.target.mute();
          event.target.playVideo();
        },
        onStateChange: function (event) {
          if (event.data === window.YT.PlayerState.PLAYING) campaignFrame.classList.add('is-playing');
        }
      }
    });
  }

  if (campaignVideo) {
    if (window.YT && window.YT.Player) {
      startCampaignPlayer();
    } else {
      var previousYouTubeReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () {
        if (typeof previousYouTubeReady === 'function') previousYouTubeReady();
        startCampaignPlayer();
      };

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        var youtubeApi = document.createElement('script');
        youtubeApi.src = 'https://www.youtube.com/iframe_api';
        youtubeApi.async = true;
        document.head.appendChild(youtubeApi);
      }
    }
  }

  // The hero is deliberately static: the frame is presented as an industrial
  // design specimen, while motion is reserved for the product interactions.
})();
