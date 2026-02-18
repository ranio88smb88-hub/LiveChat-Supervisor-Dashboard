
// Konfigurasi Selectors untuk LiveChatInc (Berdasarkan struktur umum mereka)
const SELECTORS = {
    CHAT_CONTAINER: '[data-test-id="chat-messages-list"]', // Container pesan
    MESSAGE_ITEM: '.msg', // Elemen pesan individu
    MESSAGE_TEXT: '.msg-text', // Kontainer teks pesan
    SENDER_NAME: '.msg-author' // Nama pengirim
};

let settings = {
    timerDuration: 120,
    keywords: ["refund", "komplain", "marah", "lama", "kecewa"],
    enableSound: true
};

// Load settings dari storage
chrome.storage.local.get(['timerDuration', 'keywords', 'enableSound'], (res) => {
    if (res.keywords) settings = { ...settings, ...res };
    initSupervisor();
});

function initSupervisor() {
    console.log("LiveChat Supervisor Active...");
    
    // Injeksi Panel Dashboard ke DOM LiveChat
    injectPanel();

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    // Cek jika node adalah pesan atau mengandung pesan
                    const messageElement = node.matches(SELECTORS.MESSAGE_ITEM) ? node : node.querySelector(SELECTORS.MESSAGE_ITEM);
                    
                    if (messageElement) {
                        handleNewMessage(messageElement);
                    }
                }
            });
        });
    });

    // Mulai mengamati body untuk menunggu chat container muncul
    const bodyObserver = new MutationObserver(() => {
        const container = document.querySelector(SELECTORS.CHAT_CONTAINER);
        if (container) {
            observer.observe(container, { childList: true, subtree: true });
            console.log("Monitoring Chat Container...");
        }
    });

    bodyObserver.observe(document.body, { childList: true, subtree: true });
}

function handleNewMessage(el) {
    const text = el.querySelector(SELECTORS.MESSAGE_TEXT)?.innerText.toLowerCase();
    const author = el.querySelector(SELECTORS.SENDER_NAME)?.innerText;

    if (!text) return;

    // 1. Cek Keywords
    const hasKeyword = settings.keywords.some(k => text.includes(k.toLowerCase()));
    if (hasKeyword) {
        el.style.backgroundColor = "#fff1f1";
        el.style.borderLeft = "5px solid #ff4d4d";
        if (settings.enableSound) playAlert();
    }

    // 2. Reset Timer jika ini pesan dari Customer
    // (Di LiveChatInc, biasanya ada class berbeda untuk customer vs agent)
    if (el.classList.contains('msg-customer')) {
        startResponseTimer(el);
    }
}

function injectPanel() {
    const panel = document.createElement('div');
    panel.id = 'supervisor-panel';
    panel.innerHTML = `
        <div class="sup-header">Supervisor Active</div>
        <div class="sup-stats">
            <div id="stat-delayed">0 Delayed</div>
        </div>
    `;
    document.body.appendChild(panel);
}

function playAlert() {
    const audio = new Audio(chrome.runtime.getURL('alert.mp3'));
    audio.play();
}
