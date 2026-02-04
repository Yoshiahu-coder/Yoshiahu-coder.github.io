/* =========================
   AUDIO
========================= */

let displayTimer = null;
let displayIndex = 0;
let displayWords = [];

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

    // preparar palabras SOLO para display
    displayWords = sentence.split(' ');
    displayIndex = 0;

    clearTimeout(displayTimer);
    showNextChunk(); // 🔴 UNA sola entrada

    utterance = new SpeechSynthesisUtterance(sentence);
    utterance.voice = selectedVoice;
    utterance.lang = currentLanguage === 'es' ? 'es-ES' : 'en-US';
    utterance.rate =
        currentLanguage === 'en' ? speechRate * 1 : speechRate;

    utterance.onend = () => {
        clearTimeout(displayTimer);
        currentSentenceIndex++;
        updateProgress();

        currentSentenceIndex < sentences.length
            ? speakCurrentSentence()
            : stopAudio(true);
    };

    speech.speak(utterance);
}

/* =========================
   DISPLAY (máx 2 palabras)
========================= */

function showNextChunk() {
    if (displayIndex >= displayWords.length) return;

    const chunk = getNextChunk();
    updateWordDisplay(chunk);

    const time = calculateDisplayTime(chunk);

    displayTimer = setTimeout(() => {
        showNextChunk();
    }, time);
}

function calculateDisplayTime(text) {
    // tiempo base por idioma
    const base =
        currentLanguage === 'en' ? 220 : 300;

    // letras reales (sin espacios)
    const letters = text.replace(/\s/g, '').length;

    // tiempo adicional por letra
    const perLetter =
        currentLanguage === 'en' ? 35 : 45;

    // ⛔ mínimo para que conectores no vuelen
    const minTime =
        currentLanguage === 'en' ? 420 : 30;

    const calculated =
        (base + letters * perLetter) / speechRate;

    return Math.max(calculated, minTime);
}

function getNextChunk() {
    const chunk = displayWords.slice(displayIndex, displayIndex + 2);
    displayIndex += 2;
    return chunk.join(' ');
}

/* =========================
   CONTROLES
========================= */

function pauseAudio() {
    if (!isPlaying) return;

    speech.cancel();
    clearTimeout(displayTimer);
    backgroundVideo?.pause();

    isPlaying = false;
    isPaused = true;
    updateWordDisplay('⏸️ Pausado');
}

function stopAudio(finished = false) {
    speech.cancel();
    clearTimeout(displayTimer);

    if (backgroundVideo) {
        backgroundVideo.pause();
        backgroundVideo.currentTime = 0;
    }

    isPlaying = false;
    isPaused = false;
    currentSentenceIndex = finished ? 0 : currentSentenceIndex;

    updateWordDisplay(finished ? '✅ Audio finalizado' : '⏹️ Detenido');
    updateProgress();
}
