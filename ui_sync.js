window.addEventListener("message", (event) => {
    if (event.data.type === "SET_YOUTUBE_SPEED") {
        const player = document.getElementById('movie_player');
        if (player && player.setPlaybackRate) {
            player.setPlaybackRate(event.data.speed);
        }
    }
});