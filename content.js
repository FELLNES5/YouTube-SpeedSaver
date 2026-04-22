let targetSpeed = null;
let isVideoChanging = false;
let lockTimeout = null;

function lockSaving(duration) {
    isVideoChanging = true;
    if (lockTimeout) clearTimeout(lockTimeout);
    lockTimeout = setTimeout(() => { isVideoChanging = false; }, duration || 500);
}

function handleRateChange(event) {
    const newSpeed = event.target.playbackRate;

    if(isVideoChanging || newSpeed === targetSpeed) return;

    targetSpeed = newSpeed;

    if (chrome.runtime && chrome.runtime.id) {
        chrome.storage.local.set({ 'savedSpeed': targetSpeed });
    }
}



async function getSavedSpeed() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['savedSpeed'], (result) => {
            resolve(result.savedSpeed || 1.0); 
        });
    });
}

function applySavedSpeed() {
    const video = document.querySelector('video');

    if (video && targetSpeed !== null && video.playbackRate !== targetSpeed) {
        lockSaving(500);

        window.postMessage({ 
            type: "SET_YOUTUBE_SPEED", 
            speed: targetSpeed 
        }, "*");

        video.playbackRate = targetSpeed;
    }
}



function attachUserListener() {
    const video = document.querySelector('video');

    if (video && !video.dataset.speedSaverAttached) {
        
        video.addEventListener('ratechange', handleRateChange);
        
        video.addEventListener('playing', applySavedSpeed());

        video.addEventListener('loadeddata', applySavedSpeed);

        video.dataset.speedSaverAttached = 'true';
    }
}



async function init() {
    targetSpeed = await getSavedSpeed();
    applySavedSpeed();
    attachUserListener();
}

init();

window.addEventListener('yt-navigate-start', () => {
    lockSaving(7000);
});

window.addEventListener('yt-navigate-finish', () => {
    init();
});

const observer = new MutationObserver(() => {
    const video = document.querySelector('video');
    if (video) {
        if (!video.dataset.speedSaverAttached && !video.dataset.initStarted) {
            video.dataset.initStarted = 'true';
            init();
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });