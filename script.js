// Data
let names = ['Ali', 'Ardan', 'Reno', 'Ahdan', 'Raza', 'Hana'];
let results = [];
let currentRotation = 0;
let isSpinning = false;
let selectedWinner = "";
let wheelTitle = "Wheel of Names";
let wheelDescription = "Spin the wheel to pick a random winner!";
let removeWinnerAfterSpin = false;
let isDarkMode = false; // Dark mode state

// ===== FITUR CHEAT =====
let cheatActive = false;
let cheatTargetName = '';
let clickCount = 0;
let clickTimer = null;
// =======================

const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B500', '#6BCF7F', '#FF85A2', '#A8E6CF'
];

// DOM Elements
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const entriesTab = document.getElementById('entriesTab');
const resultsTab = document.getElementById('resultsTab');
const entriesContent = document.getElementById('entriesContent');
const resultsContent = document.getElementById('resultsContent');
const entriesList = document.getElementById('entriesList');
const resultsList = document.getElementById('resultsList');
const addEntryBtn = document.getElementById('addEntryBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const sortBtn = document.getElementById('sortBtn');
const clearResultsBtn = document.getElementById('clearResultsBtn');
const popupOverlay = document.getElementById('popupOverlay');
const popupWinnerName = document.getElementById('popupWinnerName');
const closePopup = document.getElementById('closePopup');
const closePopupBtn = document.getElementById('closePopupBtn');
const removePopupBtn = document.getElementById('removePopupBtn');
const entriesBadge = document.getElementById('entriesBadge');
const resultsBadge = document.getElementById('resultsBadge');
const hideToggleBtn = document.getElementById('hideToggleBtn');
const sidebar = document.querySelector('.sidebar');
const editTitleBtn = document.getElementById('editTitleBtn');
const editTitleModal = document.getElementById('editTitleModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const saveModalBtn = document.getElementById('saveModalBtn');
const titleInput = document.getElementById('titleInput');
const descriptionInput = document.getElementById('descriptionInput');
const wheelTitleEl = document.getElementById('wheelTitle');
const wheelDescriptionEl = document.getElementById('wheelDescription');
const removeWinnerSwitch = document.getElementById('removeWinnerSwitch');
const addImageBtn = document.getElementById('addImageBtn');
const imageDropdown = document.getElementById('imageDropdown');
const addBackgroundImage = document.getElementById('addBackgroundImage');
const addCenterImage = document.getElementById('addCenterImage');
const addImageAsEntry = document.getElementById('addImageAsEntry');
const backgroundImageInput = document.getElementById('backgroundImageInput');
const centerImageInput = document.getElementById('centerImageInput');
const entryImageInput = document.getElementById('entryImageInput');

let backgroundImage = null;
let centerImage = null;

// Setup canvas dengan ukuran tetap
canvas.width = 500;
canvas.height = 500;

const centerX = 250; // canvas.width / 2
const centerY = 250; // canvas.height / 2
const radius = 220;

// ===== FUNGSI CHEAT PANEL =====
function createCheatPanel() {
    const cheatPanel = document.createElement('div');
    cheatPanel.id = 'cheatPanel';
    cheatPanel.className = 'cheat-panel';
    cheatPanel.innerHTML = `
        <h3>
            🔧 Cheat Mode
            <span class="cheat-close" onclick="closeCheat()">✖</span>
        </h3>
        <input type="text" class="cheat-input" id="cheatNameInput" placeholder="Nama yang selalu menang...">
        <div class="cheat-status">
            <button class="cheat-toggle inactive" id="cheatToggleBtn" onclick="toggleCheat()">
                NONAKTIF
            </button>
            <span id="cheatStatusText">Status: Tidak Aktif</span>
        </div>
    `;
    document.body.appendChild(cheatPanel);
}

function toggleCheat() {
    cheatActive = !cheatActive;
    const toggle = document.getElementById('cheatToggleBtn');
    const status = document.getElementById('cheatStatusText');
    const input = document.getElementById('cheatNameInput');
    
    if (cheatActive) {
        cheatTargetName = input.value.trim();
        if (!cheatTargetName) {
            alert('Masukkan nama target terlebih dahulu!');
            cheatActive = false;
            return;
        }
        
        // Cek apakah nama ada di daftar
        const nameExists = names.some(name => 
            name.toLowerCase() === cheatTargetName.toLowerCase()
        );
        
        if (!nameExists) {
            alert(`Nama "${cheatTargetName}" tidak ditemukan dalam daftar!`);
            cheatActive = false;
            return;
        }
        
        toggle.textContent = 'AKTIF';
        toggle.className = 'cheat-toggle active';
        status.textContent = `Status: Aktif (Target: ${cheatTargetName})`;
        status.style.color = '#28a745';
    } else {
        toggle.textContent = 'NONAKTIF';
        toggle.className = 'cheat-toggle inactive';
        status.textContent = 'Status: Tidak Aktif';
        status.style.color = '#856404';
    }
}

function closeCheat() {
    document.getElementById('cheatPanel').classList.remove('show');
}

// Event listener untuk double click pada judul
wheelTitleEl.addEventListener('click', () => {
    clickCount++;
    
    if (clickTimer) {
        clearTimeout(clickTimer);
    }

    clickTimer = setTimeout(() => {
        clickCount = 0;
    }, 300);

    if (clickCount === 2) {
        const cheatPanel = document.getElementById('cheatPanel');
        if (cheatPanel) {
            cheatPanel.classList.toggle('show');
        }
        clickCount = 0;
    }
});
// ==============================

// Initialize
function init() {
    renderEntries();
    renderResults();
    drawWheel();
    updateBadges();
    createCheatPanel(); // Buat panel cheat saat init
    createDarkModeToggle(); // Buat tombol dark mode
    loadDarkModePreference(); // Load dark mode preference
}

// ===== RENDER ENTRIES DENGAN TEXTAREA =====
function renderEntries() {
    entriesList.innerHTML = '';
    
    // Buat container untuk textarea
    const textareaContainer = document.createElement('div');
    textareaContainer.className = 'textarea-container';
    
    const label = document.createElement('label');
    label.className = 'textarea-label';
    label.textContent = 'Masukkan nama (satu per baris):';
    
    const textarea = document.createElement('textarea');
    textarea.className = 'names-textarea';
    textarea.id = 'namesTextarea';
    textarea.placeholder = 'Contoh:\nAli\nBudi\nCitra\nDewi\nEko';
    textarea.value = names.join('\n');
    textarea.rows = 10;
    
    // Event listener untuk update names array saat textarea berubah
    textarea.addEventListener('input', (e) => {
        const newNames = e.target.value
            .split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        
        if (newNames.length >= 2) {
            names = newNames;
            drawWheel();
            updateBadges();
        }
    });
    
    textareaContainer.appendChild(label);
    textareaContainer.appendChild(textarea);
    entriesList.appendChild(textareaContainer);
}

// Render Results
function renderResults() {
    if (results.length === 0) {
        resultsList.innerHTML = '<div class="empty-results">Belum ada hasil. Putar roda untuk mulai!</div>';
        return;
    }

    resultsList.innerHTML = '';
    results.forEach((result, index) => {
        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `
            <div class="result-info">
                <div class="result-name">${result.name}</div>
                <div class="result-time">${result.time}</div>
            </div>
            <div class="result-number">#${results.length - index}</div>
        `;
        resultsList.appendChild(item);
    });
}

// Update Badges
function updateBadges() {
    entriesBadge.textContent = names.length;
    resultsBadge.textContent = results.length;
}

// Draw Wheel
function drawWheel() {
    if (names.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    const numSlices = names.length;
    const anglePerSlice = (2 * Math.PI) / numSlices;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background image if exists (with proper aspect ratio)
    if (backgroundImage) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.clip();
        
        const imgAspect = backgroundImage.width / backgroundImage.height;
        const wheelAspect = 1; // Circle is 1:1
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > wheelAspect) {
            // Image is wider - fit to height
            drawHeight = radius * 2;
            drawWidth = drawHeight * imgAspect;
            drawX = centerX - drawWidth / 2;
            drawY = centerY - radius;
        } else {
            // Image is taller - fit to width
            drawWidth = radius * 2;
            drawHeight = drawWidth / imgAspect;
            drawX = centerX - radius;
            drawY = centerY - drawHeight / 2;
        }
        
        ctx.drawImage(backgroundImage, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
    }
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((currentRotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    for (let i = 0; i < numSlices; i++) {
        const startAngle = i * anglePerSlice - Math.PI / 2;
        const endAngle = startAngle + anglePerSlice;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        if (!backgroundImage) {
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
        }
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerSlice / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = 'white';
        
        // Dynamic font size based on text length
        const textLength = names[i].length;
        let fontSize = 24;
        if (textLength > 15) fontSize = 18;
        else if (textLength > 10) fontSize = 20;
        
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(names[i], radius - 25, 7);
        ctx.restore();
    }

    ctx.restore();

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw center image if exists (with proper aspect ratio)
    if (centerImage) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, 37, 0, 2 * Math.PI);
        ctx.clip();
        
        const imgAspect = centerImage.width / centerImage.height;
        const circleSize = 74;
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > 1) {
            // Image is wider
            drawHeight = circleSize;
            drawWidth = drawHeight * imgAspect;
            drawX = centerX - drawWidth / 2;
            drawY = centerY - circleSize / 2;
        } else {
            // Image is taller or square
            drawWidth = circleSize;
            drawHeight = drawWidth / imgAspect;
            drawX = centerX - circleSize / 2;
            drawY = centerY - drawHeight / 2;
        }
        
        ctx.drawImage(centerImage, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
    }
}

// ===== SPIN WHEEL DENGAN CHEAT =====
function spinWheel() {
    if (isSpinning || names.length < 2) {
        alert('Minimal 2 nama diperlukan!');
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;

    let winnerIndex;
    let targetRotation;
    
    // CEK APAKAH CHEAT AKTIF
    if (cheatActive && cheatTargetName) {
        // Cari index nama target (case insensitive)
        winnerIndex = names.findIndex(name => 
            name.toLowerCase() === cheatTargetName.toLowerCase()
        );
        
        if (winnerIndex !== -1) {
            // Nama ditemukan - gunakan cheat
            selectedWinner = names[winnerIndex];
            console.log('🎯 CHEAT AKTIF - Target:', selectedWinner);
        } else {
            // Nama tidak ditemukan - random biasa
            winnerIndex = Math.floor(Math.random() * names.length);
            selectedWinner = names[winnerIndex];
            console.log('⚠️ Nama cheat tidak ditemukan, spin random');
        }
    } else {
        // SPIN NORMAL (RANDOM)
        winnerIndex = Math.floor(Math.random() * names.length);
        selectedWinner = names[winnerIndex];
    }

    // Hitung rotasi target
    const numSlices = names.length;
    const anglePerSlice = 360 / numSlices;
    const targetAngle = winnerIndex * anglePerSlice + anglePerSlice / 2;

    const spins = 6;
    targetRotation = currentRotation + spins * 360 + (360 - targetAngle) - (currentRotation % 360);

    const startTime = Date.now();
    const duration = 4000;
    const startRotation = currentRotation;

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        currentRotation = startRotation + (targetRotation - startRotation) * ease;
        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            currentRotation = targetRotation % 360;
            finishSpin();
        }
    }

    animate();
}
// ===================================

// Finish Spin
function finishSpin() {
    isSpinning = false;
    spinBtn.disabled = false;

    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    results.unshift({
        name: selectedWinner,
        time: timeString
    });

    renderResults();
    updateBadges();

    setTimeout(() => {
        showWinnerPopup();
        createConfetti();
    }, 300);
}

// Show Winner Popup
function showWinnerPopup() {
    popupWinnerName.textContent = selectedWinner;
    popupOverlay.classList.add('show');
}

// Hide Winner Popup
function hideWinnerPopup() {
    popupOverlay.classList.remove('show');
    
    // Auto remove winner if switch is on
    if (removeWinnerAfterSpin && selectedWinner) {
        const index = names.indexOf(selectedWinner);
        if (index > -1) {
            names.splice(index, 1);
            
            // Update textarea
            const textarea = document.getElementById('namesTextarea');
            if (textarea) {
                textarea.value = names.join('\n');
            }
            
            drawWheel();
            updateBadges();
        }
    }
}

// Create Confetti
function createConfetti() {
    const confettiColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            confetti.style.animation = `confetti-fall ${2 + Math.random() * 2}s linear`;
            confetti.style.zIndex = '9998';
            
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
}

// Show Edit Title Modal
function showEditTitleModal() {
    titleInput.value = wheelTitle;
    descriptionInput.value = wheelDescription;
    editTitleModal.classList.add('show');
}

// Hide Edit Title Modal
function hideEditTitleModal() {
    editTitleModal.classList.remove('show');
}

// Save Title & Description
function saveTitleAndDescription() {
    wheelTitle = titleInput.value.trim() || "Wheel of Names";
    wheelDescription = descriptionInput.value.trim() || "Spin the wheel to pick a random winner!";
    
    wheelTitleEl.textContent = wheelTitle;
    wheelDescriptionEl.textContent = wheelDescription;
    
    hideEditTitleModal();
}

// Tab Switching
entriesTab.addEventListener('click', () => {
    entriesTab.classList.add('active');
    resultsTab.classList.remove('active');
    entriesContent.classList.add('active');
    resultsContent.classList.remove('active');
});

resultsTab.addEventListener('click', () => {
    resultsTab.classList.add('active');
    entriesTab.classList.remove('active');
    resultsContent.classList.add('active');
    entriesContent.classList.remove('active');
});

// Event Listeners
spinBtn.addEventListener('click', spinWheel);
closePopup.addEventListener('click', hideWinnerPopup);
closePopupBtn.addEventListener('click', hideWinnerPopup);
popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) hideWinnerPopup();
});

removePopupBtn.addEventListener('click', () => {
    if (!selectedWinner) return;
    
    // Hapus dari array names
    const index = names.indexOf(selectedWinner);
    if (index > -1) {
        names.splice(index, 1);
        
        // Update textarea
        const textarea = document.getElementById('namesTextarea');
        if (textarea) {
            textarea.value = names.join('\n');
        }
        
        drawWheel();
        updateBadges();
    }
    
    hideWinnerPopup();
});

// ===== MODIFIKASI TOMBOL ADD ENTRY =====
addEntryBtn.addEventListener('click', () => {
    names.push(`Entry ${names.length + 1}`);
    
    // Update textarea
    const textarea = document.getElementById('namesTextarea');
    if (textarea) {
        textarea.value = names.join('\n');
    }
    
    drawWheel();
    updateBadges();
});

shuffleBtn.addEventListener('click', () => {
    for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [names[i], names[j]] = [names[j], names[i]];
    }
    
    // Update textarea
    const textarea = document.getElementById('namesTextarea');
    if (textarea) {
        textarea.value = names.join('\n');
    }
    
    drawWheel();
});

sortBtn.addEventListener('click', () => {
    names.sort();
    
    // Update textarea
    const textarea = document.getElementById('namesTextarea');
    if (textarea) {
        textarea.value = names.join('\n');
    }
    
    drawWheel();
});

clearResultsBtn.addEventListener('click', () => {
    if (confirm('Hapus semua hasil?')) {
        results = [];
        renderResults();
        updateBadges();
    }
});

hideToggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
    if (sidebar.classList.contains('hidden')) {
        hideToggleBtn.textContent = '👁️ Show';
    } else {
        hideToggleBtn.textContent = '👁️ Hide';
    }
});

// Edit Title Modal Event Listeners
editTitleBtn.addEventListener('click', showEditTitleModal);
closeModalBtn.addEventListener('click', hideEditTitleModal);
cancelModalBtn.addEventListener('click', hideEditTitleModal);
saveModalBtn.addEventListener('click', saveTitleAndDescription);
editTitleModal.addEventListener('click', (e) => {
    if (e.target === editTitleModal) hideEditTitleModal();
});

// Remove Winner Switch
removeWinnerSwitch.addEventListener('change', (e) => {
    removeWinnerAfterSpin = e.target.checked;
});

// Image Dropdown Toggle
addImageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    imageDropdown.classList.toggle('show');
});

// Close dropdown when clicking on overlay
imageDropdown.addEventListener('click', (e) => {
    if (e.target === imageDropdown) {
        imageDropdown.classList.remove('show');
    }
});

// Add Background Image
addBackgroundImage.addEventListener('click', () => {
    backgroundImageInput.click();
    imageDropdown.classList.remove('show');
});

backgroundImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                backgroundImage = img;
                drawWheel();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Add Center Image
addCenterImage.addEventListener('click', () => {
    centerImageInput.click();
    imageDropdown.classList.remove('show');
});

centerImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                centerImage = img;
                drawWheel();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Add Image as Entry
addImageAsEntry.addEventListener('click', () => {
    entryImageInput.click();
    imageDropdown.classList.remove('show');
});

entryImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            names.push(`🖼️ Image ${names.length + 1}`);
            
            // Update textarea
            const textarea = document.getElementById('namesTextarea');
            if (textarea) {
                textarea.value = names.join('\n');
            }
            
            drawWheel();
            updateBadges();
        };
        reader.readAsDataURL(file);
    }
});

// Initialize
init();