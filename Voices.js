
/* =========================
   AUDIO
========================= */
function playAudio() {
    if (!sentences.length || isPlaying) return;

    isPlaying = true;
    isPaused = false;

    backgroundVideo?.play().catch(() => {});
    speakCurrentSentence();
}

function speakCurrentSentence() {
    const sentence = sentences[currentSentenceIndex];
    if (!sentence) return stopAudio(true);

    wordGroups[currentSentenceIndex] = groupWords(sentence);
    currentGroupIndex = 0;

    utterance = new SpeechSynthesisUtterance(cleanText(sentence));
    utterance.voice = selectedVoice;
    utterance.rate = speechRate;
    utterance.lang = currentLanguage === 'es' ? 'es-ES' : 'en-US';

    utterance.onstart = () => {
        startHighlighting();
    };

    utterance.onend = () => {
        clearInterval(highlightTimer);
        currentSentenceIndex++;
        updateProgress();

        currentSentenceIndex < sentences.length
            ? speakCurrentSentence()
            : stopAudio(true);
    };

    speech.speak(utterance);
}

function startHighlighting() {
    const groups = wordGroups[currentSentenceIndex];
    updateWordDisplay(groups[0]);

    const baseInterval =
        currentLanguage === 'en' ? 400 : 450;

    highlightTimer = setInterval(() => {
        currentGroupIndex++;
        if (currentGroupIndex >= groups.length) {
            clearInterval(highlightTimer);
            return;
        }
        updateWordDisplay(groups[currentGroupIndex]);
    }, baseInterval / speechRate);
}

function pauseAudio() {
    if (!isPlaying) return;

    speech.cancel();
    clearInterval(highlightTimer);
    backgroundVideo?.pause();

    isPlaying = false;
    isPaused = true;
    updateWordDisplay('⏸️ Pause');
}

function stopAudio(finished = false) {
    speech.cancel();
    clearInterval(highlightTimer);

    if (backgroundVideo) {
        backgroundVideo.pause();
        backgroundVideo.currentTime = 0;
    }

    isPlaying = false;
    isPaused = false;
    currentSentenceIndex = finished ? 0 : currentSentenceIndex;

    updateWordDisplay(finished ? '✅ Start' : '⏹️ Stop');
    updateProgress();
}

/* =========================
   CONTROLES
========================= */
function previousSentence() {
    if (currentSentenceIndex > 0) {
        pauseAudio();
        currentSentenceIndex--;
        playAudio();
    }
}

function nextSentence() {
    if (currentSentenceIndex < sentences.length - 1) {
        pauseAudio();
        currentSentenceIndex++;
        playAudio();
    }
}

function changeSpeed(speed) {
    speechRate = speed;
}

function changeLanguage(lang) {
    currentLanguage = lang;
    speechRate = lang === 'en' ? 0.75 : 1;
    loadVoices();
}


/* =========================
   INIT
========================= */
window.addEventListener('DOMContentLoaded', () => {
    disableControls();
    loadVoices();
    updateWordDisplay('Waiting for a PDF file...');

    backgroundVideo = document.querySelector('video');
    if (backgroundVideo) {
        backgroundVideo.pause();
        backgroundVideo.currentTime = 0;
    }
});


