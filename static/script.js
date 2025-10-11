document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const imageUpload = document.getElementById('image-upload');
    const identifyBtn = document.getElementById('identify-btn');
    const imagePreview = document.getElementById('image-preview');
    const loader = document.getElementById('loader');
    const placeholderText = document.getElementById('placeholder-text');
    const resultsContent = document.getElementById('results-content');
    const suggestionsList = document.getElementById('suggestions-list');
    const tabsContainer = document.querySelector('.tabs-container');
    const historyBtn = document.getElementById('history-btn');
    const historyModal = document.getElementById('history-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const historyList = document.getElementById('history-list');

    let selectedFile = null;
    let currentImageBase64 = null;

    // --- Load history on page start ---
    loadHistory();

    // --- Event Listeners ---
    imageUpload.addEventListener('change', handleImageUpload);
    identifyBtn.addEventListener('click', handleIdentifyClick);
    tabsContainer.addEventListener('click', handleTabClick);
    historyBtn.addEventListener('click', () => historyModal.classList.remove('hidden'));
    closeModalBtn.addEventListener('click', () => historyModal.classList.add('hidden'));
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) historyModal.classList.add('hidden');
    });

    // --- Main Functions ---
    function handleImageUpload(event) {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentImageBase64 = e.target.result;
                imagePreview.innerHTML = `<img src="${currentImageBase64}" alt="Selected plant">`;
            };
            reader.readAsDataURL(selectedFile);
        }
    }

    async function handleIdentifyClick() {
        if (!selectedFile) {
            alert('Please select an image first!');
            return;
        }
        showLoadingState(true);

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch('/identify', { method: 'POST', body: formData });
            if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
            
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            displayResults(data);
            saveToHistory(data.suggestions[0].plant_name, currentImageBase64);

        } catch (error) {
            displayError(error.message);
        } finally {
            showLoadingState(false);
        }
    }

    function showLoadingState(isLoading) {
        loader.style.display = isLoading ? 'block' : 'none';
        placeholderText.style.display = isLoading ? 'none' : 'block';
        if (isLoading) {
            resultsContent.classList.add('hidden');
            placeholderText.style.display = 'none';
        }
    }

    function displayError(message) {
        resultsContent.classList.add('hidden');
        placeholderText.style.display = 'block';
        placeholderText.textContent = `Error: ${message}`;
    }

    function displayResults(data) {
        placeholderText.style.display = 'none';
        resultsContent.classList.remove('hidden');

        // 1. Render Suggestions
        suggestionsList.innerHTML = '';
        data.suggestions.slice(0, 3).forEach(suggestion => {
            const confidence = (suggestion.probability * 100).toFixed(1);
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <div class="suggestion-header">
                    <span>${suggestion.plant_name}</span>
                    <span>${confidence}%</span>
                </div>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${confidence}%;"></div>
                </div>
            `;
            suggestionsList.appendChild(item);
        });

        // 2. Populate Tabs
        document.getElementById('tab-1').textContent = data.description.medicinal_uses || "Not available.";
        document.getElementById('tab-2').textContent = data.description.how_to_grow || "Not available.";
        document.getElementById('tab-3').textContent = data.description.warnings || "Not available.";
    }

    // --- Tab Handling ---
    function handleTabClick(event) {
        if (event.target.classList.contains('tab-link')) {
            // Deactivate all tabs and content
            tabsContainer.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
            tabsContainer.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            // Activate clicked tab
            event.target.classList.add('active');
            const tabId = event.target.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        }
    }

    // --- History Handling (Local Storage) ---
    function getHistory() {
        return JSON.parse(localStorage.getItem('plantHistory')) || [];
    }

    function saveToHistory(plantName, imageBase64) {
        const history = getHistory();
        // Avoid duplicates
        if (history.some(item => item.plantName === plantName)) return;

        const newItem = { plantName, imageBase64, date: new Date().toISOString() };
        history.unshift(newItem); // Add to the beginning

        // Keep history to a reasonable size (e.g., 10 items)
        if (history.length > 10) {
            history.pop();
        }
        localStorage.setItem('plantHistory', JSON.stringify(history));
        loadHistory(); // Refresh the displayed list
    }

    function loadHistory() {
        const history = getHistory();
        historyList.innerHTML = ''; // Clear current list
        if (history.length === 0) {
            historyList.innerHTML = '<p>No identifications yet.</p>';
            return;
        }
        history.forEach(item => {
            const li = document.createElement('div');
            li.className = 'history-list-item';
            li.innerHTML = `
                <img src="${item.imageBase64}" class="history-img" alt="${item.plantName}">
                <span>${item.plantName}</span>
            `;
            // Note: Clicking history items to re-run identification is a potential future feature.
            historyList.appendChild(li);
        });
    }
});