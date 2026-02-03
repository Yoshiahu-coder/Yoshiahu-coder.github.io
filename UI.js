
/* =========================
   UI
========================= */
function updateWordDisplay(data) {
    const display = document.getElementById('currentWordDisplay');
    const typeInfo = document.getElementById('wordTypeInfo');

    if (typeof data === 'string') {
        display.textContent = data;
        typeInfo.textContent = '';
        return;
    }

    display.textContent = data.text;
    typeInfo.textContent =
        data.type === 'grouped'
            ? `Grupo de ${data.count} palabras`
            : 'Palabra individual';
}

function updateProgress() {
    if (!sentences.length) return;

    const percent = Math.round(
        ((currentSentenceIndex + 1) / sentences.length) * 100
    );

    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('currentProgress').textContent = percent + '%';
    document.getElementById('progressInfo').textContent =
        `Frase ${currentSentenceIndex + 1} de ${sentences.length}`;
}

function enableControls() {
    ['playBtn','pauseBtn','prevBtn','nextBtn']
        .forEach(id => document.getElementById(id).disabled = false);
}

function disableControls() {
    ['playBtn','pauseBtn','prevBtn','nextBtn']
        .forEach(id => document.getElementById(id).disabled = true);
}
