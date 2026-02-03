/* =========================
   PDF.js
========================= */
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/* =========================
   ESTADO GLOBAL
========================= */
let pdfText = '';
let sentences = [];
let wordGroups = [];

let backgroundVideo = null;

let currentSentenceIndex = 0;
let currentGroupIndex = 0;

let speech = window.speechSynthesis;
let selectedVoice = null;
let utterance = null;

let isPlaying = false;
let isPaused = false;
let speechRate = 1.5;
let highlightTimer = null;

let currentLanguage = 'es';

/* =========================
   VOICES
========================= */
function loadVoices() {
    const voices = speech.getVoices();
    selectedVoice =
        currentLanguage === 'es'
            ? voices.find(v => v.lang.startsWith('es')) || voices[0]
            : voices.find(v => v.lang.startsWith('en')) || voices[0];
}
speech.onvoiceschanged = loadVoices;


/* =========================
   TEXTO
========================= */
function cleanText(text) {
    return text
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,;:¿?!¡'"-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function splitSentences(text) {
    return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
}

function groupWords(sentence) {
    const words = sentence.split(' ');
    const groups = [];
    let buffer = [];

    for (const w of words) {
        const isShort =
            currentLanguage === 'en'
                ? w.length <= 3
                : w.length < 4;

        if (isShort) {
            buffer.push(w);
            if (buffer.length === 2) {
                groups.push({
                    text: buffer.join(' '),
                    type: 'grouped',
                    count: buffer.length
                });
                buffer = [];
            }
        } else {
            if (buffer.length) {
                groups.push({
                    text: buffer.join(' '),
                    type: 'grouped',
                    count: buffer.length
                });
                buffer = [];
            }
            groups.push({ text: w, type: 'single', count: 1 });
        }
    }

    if (buffer.length) {
        groups.push({
            text: buffer.join(' '),
            type: 'grouped',
            count: buffer.length
        });
    }

    return groups;
}


/* =========================
   PDF
========================= */
async function extractTextFromPDF() {
    const input = document.getElementById('pdfInput');
    if (!input.files.length) return;

    disableControls();
    updateWordDisplay('📄 Procesando PDF...');

    const buffer = await input.files[0].arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(i => i.str).join(' ') + ' ';
    }

    pdfText = text;
    sentences = splitSentences(pdfText);

    updateWordDisplay(`✅ PDF cargado (${sentences.length} frases)`);
    enableControls();
    updateProgress();
}
