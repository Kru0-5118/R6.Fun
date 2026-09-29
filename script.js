// --- Operator data and lookup maps ------------------------------------------------
const operators = {
    atk: [
        "Striker", "Sledge", "Thatcher", "Ash", "Thermite", "Twitch", "Montagne", "Glaz", "Fuze", "Blitz", "IQ",
        "Buck", "Blackbeard", "Capitão", "Hibana", "Jackal", "Ying", "Zofia", "Dokkaebi", "Lion", "Finka",
        "Maverick", "Nomad", "Gridlock", "Nøkk", "Amaru", "Kali", "Iana", "Ace", "Zero", "Flores",
        "Osa", "Sens", "Grim", "Brava", "Ram", "Deimos", "Rauora", "Snake"
    ],
    def: [
        "Sentry", "Smoke", "Mute", "Castle", "Pulse", "Doc", "Rook", "Kapkan", "Tachanka", "Jäger", "Bandit",
        "Frost", "Valkyrie", "Caveira", "Echo", "Mira", "Lesion", "Ela", "Vigil", "Maestro", "Alibi",
        "Clash", "Kaid", "Mozzie", "Warden", "Goyo", "Wamai", "Oryx", "Melusi", "Aruni", "Thunderbird",
        "Thorn", "Azami", "Solis", "Fenrir", "Tubarão", "Skopós", "Denari","Noor"
    ]
};

const opCountryMap = {
    "Sledge": "gb", "Thatcher": "gb", "Mute": "gb", "Smoke": "gb", "Clash": "gb",
    "Ash": "us", "Thermite": "us", "Castle": "us", "Pulse": "us", "Blackbeard": "us", "Valkyrie": "us", "Maverick": "us", "Warden": "us", "Zero": "us", "Deimos": "us", "Striker": "us", "Sentry": "us", "Snake": "us",
    "Twitch": "fr", "Montagne": "fr", "Doc": "fr", "Rook": "fr", "Lion": "fr",
    "IQ": "de", "Blitz": "de", "Jäger": "de", "Bandit": "de",
    "Glaz": "ru", "Fuze": "ru", "Kapkan": "ru", "Tachanka": "ru", "Finka": "ru",
    "Buck": "ca", "Frost": "ca", "Thunderbird": "ca",
    "Capitão": "br", "Caveira": "br", "Brava": "br",
    "Hibana": "jp", "Echo": "jp", "Azami": "jp",
    "Jackal": "es", "Mira": "es",
    "Ying": "hk", "Lesion": "hk",
    "Zofia": "pl", "Ela": "pl",
    "Dokkaebi": "kr", "Vigil": "kr", "Ram": "kr",
    "Maestro": "it", "Alibi": "it",
    "Nomad": "ma", "Kaid": "ma",
    "Gridlock": "au", "Mozzie": "au",
    "Nøkk": "dk", "Goyo": "mx", "Amaru": "pe",
    "Kali": "in", "Wamai": "ke", "Iana": "nl", "Oryx": "jo", "Ace": "no", "Melusi": "za",
    "Aruni": "th", "Flores": "ar", "Osa": "hr", "Thorn": "ie", "Sens": "be", "Grim": "sg",
    "Solis": "co", "Fenrir": "se", "Tubarão": "pt", "Skopós": "gr", "Rauora": "nz", "Denari": "ch", "Noor": "eg"
};

const operatorColors = {
    "gb": "#012169", "us": "#b22234", "fr": "#002395", "de": "#000000",
    "ru": "#DA001F", "ca": "#ff0000", "br": "#009b3a", "jp": "#bc002d",
    "es": "#ffc400", "hk": "#de2910", "pl": "#ffffff", "kr": "#c60c30",
    "it": "#009246", "ma": "#c6001b", "au": "#00008b", "dk": "#c8102e",
    "mx": "#006341", "pe": "#ce1126", "in": "#ff9933", "ke": "#000000",
    "nl": "#21468b", "jo": "#000000", "no": "#ba0c30", "za": "#000000",
    "th": "#f1b82c", "ar": "#75aadb", "hr": "#171796", "ie": "#169b62",
    "be": "#000000", "sg": "#ffffff", "co": "#ffc400", "se": "#006aa7",
    "pt": "#006600", "gr": "#0066cc", "nz": "#ffffff", "ch": "#ff0000",
    "un": "#4a90e2", "eg": "#ce1126",
};

const operatorFileMap = {
    "Capitão": "capitao", "Nøkk": "nokk", "Jäger": "jager", "Tubarão": "tubarao", "Skopós": "skopos"
};

function getOperatorFileName(opName) {
    return operatorFileMap[opName] || opName.toLowerCase();
}

function getRandomOperator(ops, exclude = []) {
    const filtered = ops.filter(op => !exclude.includes(op));
    if (filtered.length === 0) {
        return ops[Math.floor(Math.random() * ops.length)];
    }
    return filtered[Math.floor(Math.random() * filtered.length)];
}

// --- Runtime state ------------------------------------------------------------
let currentSide = 'atk';
let isSpinning = false;
let operatorHistory = [];
const volumeLevels = [20, 40, 70];
let volumeStage = 1;
let currentMusic = null;
let musicIndex = -1;
let musicMuted = false;

// --- Audio and music control --------------------------------------------------
const rollSound = new Audio('./roll.mp3');
const winSound = new Audio('./win.mp3');
const musicFiles = [
    './music1.mp3',
    './music2.mp3',
    './music3.mp3',
    './music4.mp3',
    './music5.mp3',
    './music6.mp3'
];

function setVolumeStage(index) {
    volumeStage = index;
    const volumePercent = volumeLevels[volumeStage] / 100;
    rollSound.volume = Math.min(1, volumePercent);
    winSound.volume = Math.min(1, volumePercent);
    if (currentMusic) {
        currentMusic.volume = musicMuted ? 0 : Math.min(1, volumePercent);
    }
    const bars = document.querySelector('.volume-bars');
    if (bars) {
        bars.className = `volume-bars level-${volumeStage + 1}`;
        bars.setAttribute('data-volume', `${volumeLevels[volumeStage]}%`);
    }
}

function toggleVolumeLevel() {
    setVolumeStage((volumeStage + 1) % volumeLevels.length);
}

function playNextMusic() {
    if (currentMusic) {
        currentMusic.pause();
        currentMusic = null;
    }
    musicIndex = Math.floor(Math.random() * musicFiles.length);
    currentMusic = new Audio(musicFiles[musicIndex]);
    currentMusic.volume = musicMuted ? 0 : volumeLevels[volumeStage] / 100;
    currentMusic.addEventListener('ended', playNextMusic);
    currentMusic.play().catch(e => console.log('Music play blocked'));
}

function toggleMusicMute() {
    musicMuted = !musicMuted;
    if (currentMusic) {
        currentMusic.volume = musicMuted ? 0 : volumeLevels[volumeStage] / 100;
    }
    const muteBtn = document.getElementById('music-mute-btn');
    if (muteBtn) {
        muteBtn.textContent = musicMuted ? '🔇' : '🔊';
    }
}

setVolumeStage(volumeStage);

// --- Confetti animation helpers ------------------------------------------------
const confettiCanvas = document.createElement('canvas');
confettiCanvas.style.position = 'fixed';
confettiCanvas.style.top = '0';
confettiCanvas.style.left = '0';
confettiCanvas.style.width = '100%';
confettiCanvas.style.height = '100%';
confettiCanvas.style.pointerEvents = 'none';
confettiCanvas.style.zIndex = '10000';
document.body.appendChild(confettiCanvas);

const confettiCtx = confettiCanvas.getContext('2d');
let confettiPieces = [];
let confettiAnimating = false;

function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

function createConfettiPiece(x, y, color) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        size: Math.random() * 8 + 6,
        color,
        opacity: 1,
        decay: Math.random() * 0.006 + 0.003
    };
}

function updateConfetti() {
    confettiPieces = confettiPieces.filter(piece => {
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.vy += 0.18;
        piece.rotation += piece.rotationSpeed;
        piece.opacity -= piece.decay;
        return piece.opacity > 0;
    });
}

function drawConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach(piece => {
        confettiCtx.save();
        confettiCtx.globalAlpha = piece.opacity;
        confettiCtx.translate(piece.x, piece.y);
        confettiCtx.rotate(piece.rotation * Math.PI / 180);
        confettiCtx.fillStyle = piece.color;
        confettiCtx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size / 4);
        confettiCtx.restore();
    });
}

function runConfettiAnimation() {
    if (confettiAnimating) return;
    confettiAnimating = true;
    requestAnimationFrame(function animate() {
        if (confettiPieces.length === 0) {
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            confettiAnimating = false;
            return;
        }
        updateConfetti();
        drawConfetti();
        requestAnimationFrame(animate);
    });
}

function renderConfetti({ particleCount = 100, origin = { x: 0.5, y: 0.5 }, colors = ['#ffffff', '#ff007a', '#00d4ff'] } = {}) {
    const startX = origin.x * confettiCanvas.width;
    const startY = origin.y * confettiCanvas.height;
    for (let i = 0; i < particleCount; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        confettiPieces.push(createConfettiPiece(startX, startY, color));
    }
    runConfettiAnimation();
}

function triggerConfetti(flagColor) {
    const colors = [];
    if (flagColor) {
        colors.push(flagColor, '#ffffff', '#000000');
    } else {
        colors.push('#00d4ff', '#ff007a', '#ffffff');
    }
    renderConfetti({
        particleCount: 100,
        origin: { x: 0.5, y: 0.5 },
        colors
    });
    setTimeout(() => {
        renderConfetti({
            particleCount: 50,
            origin: { x: 0.5, y: 0.5 },
            colors
        });
    }, 250);
}

window.addEventListener('resize', resizeConfettiCanvas);

// --- Slot rendering and selection ---------------------------------------------
function setSide(side, btn) {
    currentSide = side;
    document.querySelectorAll('.btn-side').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function updateSlot(slotIndex, opName, same = false) {
    const reel = document.getElementById(`reel-${slotIndex}`);
    const items = reel.querySelectorAll('.reel-item');
    const ops = operators[currentSide];

    items.forEach((item, index) => {
        const nameLabel = item.querySelector('.reel-name');
        const iconImg = item.querySelector('.reel-icon');
        let currentOp;

        if (same) {
            currentOp = index === 1 ? opName : getRandomOperator(ops, [opName]);
        } else {
            currentOp = getRandomOperator(ops);
        }

        const countryCode = opCountryMap[currentOp] || 'un';
        const fileName = './Icons/' + getOperatorFileName(currentOp) + '.png';

        nameLabel.innerText = currentOp.toUpperCase();
        nameLabel.className = 'reel-name flag-text';
        nameLabel.style.backgroundImage = `url('https://flagcdn.com/w640/${countryCode}.png')`;
        nameLabel.style.color = 'transparent';
        iconImg.src = fileName;
    });
}

// --- Rolling animation logic --------------------------------------------------
function rollOperator() {
    if (isSpinning) return;
    isSpinning = true;

    rollSound.currentTime = 0;
    rollSound.play().catch(e => console.log('Audio play blocked'));

    const ops = operators[currentSide];
    const slots = [0, 1, 2];
    const intervals = [];
    const finalOp = getRandomOperator(ops, operatorHistory);

    operatorHistory.push(finalOp);
    if (operatorHistory.length > 3) {
        operatorHistory.shift();
    }

    slots.forEach(i => {
        const reel = document.getElementById(`reel-${i}`);
        const slotElement = document.getElementById(`slot-${i}`);
        slotElement.classList.add('spinning');
        reel.classList.add('spinning');
        const timer = setInterval(() => {
            updateSlot(i, null, false);
        }, 100);
        intervals.push(timer);
    });

    const stopTimes = [3200, 4100, 5000];
    slots.forEach(i => {
        setTimeout(() => {
            clearInterval(intervals[i]);
            updateSlot(i, finalOp, true);
            const reel = document.getElementById(`reel-${i}`);
            const slotElement = document.getElementById(`slot-${i}`);
            reel.classList.remove('spinning');
            slotElement.classList.remove('spinning');
        }, stopTimes[i]);
    });

    setTimeout(() => {
        winSound.currentTime = 0;
        winSound.play().catch(e => console.log('Audio play blocked'));
        isSpinning = false;
        const countryCode = opCountryMap[finalOp] || 'un';
        const flagColor = operatorColors[countryCode] || '#ffffff';
        try {
            triggerConfetti(flagColor);
        } catch (e) {
            console.log('Confetti skipped:', e);
        }
    }, 5500);
}

// --- Fun funbanner popup logic -------------------------------------------------------
const funFunbannerImages = [
    'banner1.png',
    'banner2.png',
    'banner3.png',
    'banner4.png',
    'banner5.png',
    'banner6.png',
    'banner7.png',
    'banner8.png',
    'banner9.png',
    'banner10.png'
];
const funFunbannerPath = './Icons/banners/';
let funFunbannerTimer = null;

function getRandomFunFunbanner() {
    return funFunbannerImages[Math.floor(Math.random() * funFunbannerImages.length)];
}

function showFunFunbanner() {
    const adContainer = document.createElement('div');
    adContainer.className = 'fun-funbanner-overlay';
    adContainer.style.position = 'fixed';
    adContainer.style.zIndex = '10000';

    const minWidth = 320;
    const maxWidth = Math.min(window.innerWidth * 0.9, 800);
    const width = minWidth + Math.random() * (maxWidth - minWidth);
    const height = width * 2 / 3;

    adContainer.style.width = width + 'px';
    adContainer.style.height = height + 'px';

    const maxTop = window.innerHeight - height;
    const maxLeft = window.innerWidth - width;
    const top = Math.max(0, Math.random() * maxTop);
    const left = Math.max(0, Math.random() * maxLeft);

    adContainer.style.top = top + 'px';
    adContainer.style.left = left + 'px';

    adContainer.innerHTML = `
        <div class="fun-funbanner-popup">
            <button class="fun-funbanner-close" type="button" aria-label="Zamknij funbanner">×</button>
            <div class="fun-funbanner-image-wrapper">
                <img class="fun-funbanner-image" src="" alt="Funbanner" />
            </div>
        </div>
    `;

    const adName = getRandomFunFunbanner();
    const adImage = adContainer.querySelector('.fun-funbanner-image');
    adImage.src = funFunbannerPath + adName;

    adContainer.querySelector('.fun-funbanner-close').addEventListener('click', () => {
        adContainer.remove();
    });

    document.body.appendChild(adContainer);
    setTimeout(() => {
        adContainer.classList.add('visible');
    }, 10);

    scheduleFunFunbanner();
}

function scheduleFunFunbanner() {
    if (funFunbannerTimer) {
        clearTimeout(funFunbannerTimer);
    }
    const delay = 90000 + Math.random() * 110000;
    funFunbannerTimer = setTimeout(showFunFunbanner, delay);
}

function startFunFunbanners() {
    scheduleFunFunbanner();
}

// --- App startup --------------------------------------------------------------
// W zamian za wywoływanie playNextMusic() w 'load':
window.addEventListener('load', () => {
    startFunFunbanners();

    // Dodanie interakcji użytkownika do odblokowania muzyki
    const unlockAudio = () => {
        if (!currentMusic) {
            playNextMusic();
        }
        document.removeEventListener('click', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);

// Przycisk wyciszania i pomijania muzyki
    const muteBtn = document.createElement('button');
    muteBtn.id = 'music-mute-btn';
    muteBtn.textContent = '🔊';
    muteBtn.title = 'LPM: Wycisz/Odcisz | PPM: Następny utwór'; // Podpowiedź
    muteBtn.style.position = 'fixed';
    muteBtn.style.bottom = '20px';
    muteBtn.style.right = '20px';
    muteBtn.style.background = 'rgba(255, 255, 255, 0.08)';
    muteBtn.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    muteBtn.style.borderRadius = '50%';
    muteBtn.style.width = '40px';
    muteBtn.style.height = '40px';
    muteBtn.style.color = 'white';
    muteBtn.style.fontSize = '1.2rem';
    muteBtn.style.cursor = 'pointer';
    muteBtn.style.zIndex = '1000';
    muteBtn.style.backdropFilter = 'blur(10px)';
    
    // LPM: Przełączanie wyciszenia
    muteBtn.addEventListener('click', toggleMusicMute);

    // PPM: Skip utworu (prawy przycisk myszy)
    muteBtn.addEventListener('contextmenu', (e) => {
        e.preventDefault(); // Blokuje domyślne menu kontekstowe przeglądarki
        playNextMusic();    // Puszcza kolejny utwór
    });

    document.body.appendChild(muteBtn);
});

    // --- Auto-pause music on Alt+Tab / tab switch --------------------------------
document.addEventListener('visibilitychange', () => {
    if (!currentMusic) return;

    if (document.hidden) {
        // Strona straciła ostrość (Alt+Tab / zmiana karty) -> pauza
        currentMusic.pause();
    } else {
        // Strona znowu widoczna -> wznów odtwarzanie (jeśli dźwięk nie jest wyciszony)
        if (!musicMuted) {
            currentMusic.play().catch(e => console.log('Music resume blocked'));
        }
    }
});
