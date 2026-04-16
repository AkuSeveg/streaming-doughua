const contentSection = document.getElementById('content-section');
const aboutSection = document.getElementById('about-section');
const donghuaGrid = document.getElementById('donghua-grid');
const sectionTitle = document.getElementById('section-title');
const searchInput = document.getElementById('searchInput');

let currentPage = 1;
let currentMode = 'home';
let currentQuery = '';
let isFetching = false;
let hasMoreData = true;

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

window.performSearch = debounce(() => {
    const query = searchInput.value.trim();
    
    if (!query) {
        if (currentMode !== 'home') navigate('home');
        return;
    }
    
    currentMode = 'search';
    currentQuery = query;
    currentPage = 1;
    hasMoreData = true;
    donghuaGrid.innerHTML = ''; 
    
    sectionTitle.innerHTML = `<i class="fas fa-search text-red"></i> Hasil pencarian: "${query}"`;
    
    fetchData(`/api/search?q=${encodeURIComponent(query)}&pages=${currentPage}`, true);
}, 600);

searchInput.addEventListener('input', performSearch);

document.addEventListener('DOMContentLoaded', () => {
    navigate('home');
    setupIntersectionObserver();
});

window.navigate = function(page) {
    if (page !== 'search') searchInput.value = '';

    if (page === 'about') {
        contentSection.style.display = 'none';
        aboutSection.style.display = 'block';
    } else {
        aboutSection.style.display = 'none';
        contentSection.style.display = 'block';
        
        donghuaGrid.innerHTML = '';
        currentPage = 1;
        hasMoreData = true;

        if (page === 'home') {
            currentMode = 'home';
            sectionTitle.innerHTML = '<i class="fas fa-fire text-red"></i> Rilis Terbaru';
            fetchData(`/api/home?pages=${currentPage}`, true);
        } else if (page === 'schedule') {
            currentMode = 'schedule';
            hasMoreData = false;
            sectionTitle.innerHTML = '<i class="fas fa-calendar-alt text-red"></i> Jadwal Rilis Mingguan';
            fetchData('/api/schedule', true);
        }
    }
}

function showSkeleton(count = 10) {
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton';
        skeleton.innerHTML = `
            <div class="skeleton-img"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text short"></div>
        `;
        donghuaGrid.appendChild(skeleton);
    }
}

function removeSkeleton() {
    const skeletons = document.querySelectorAll('.skeleton');
    skeletons.forEach(s => s.remove());
}

async function fetchData(endpoint, isNewSearch = false) {
    if (isFetching || !hasMoreData) return;
    
    isFetching = true;
    showSkeleton(10);

    try {
        const response = await fetch(endpoint);
        const result = await response.json();
        
        removeSkeleton();

        let items = [];
        if (result.data && Array.isArray(result.data)) {
            items = result.data;
        } else if (result.data && result.data.latest) {
            items = result.data.latest;
        } else if (result.data && result.data.popular) {
            items = result.data.popular;
        } else if (Array.isArray(result)) {
            items = result;
        }

        if (items.length === 0) {
            hasMoreData = false;
            if (isNewSearch) {
                donghuaGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 1.1rem; padding: 40px 0;">Tidak ada data yang ditemukan.</p>';
            }
            isFetching = false;
            return;
        }

        renderCards(items);
        currentPage++;

    } catch (error) {
        console.error("Gagal mengambil data:", error);
        removeSkeleton();
        if (isNewSearch) {
            donghuaGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--primary-red); padding: 40px 0;">Koneksi ke server terputus. Silakan coba lagi.</p>`;
        }
    } finally {
        isFetching = false;
    }
}

function renderCards(items) {
    items.forEach(item => {
        const title = item.title || item.name || 'Judul Tidak Diketahui';
        const poster = item.poster || item.image || 'https://via.placeholder.com/300x400/141414/e50914?text=No+Image';
        const episode = item.episode || item.ep || '?';
        const rating = item.rating || item.score || '-';
        const slug = item.slug || item.id;

        const card = document.createElement('div');
        card.className = 'card';
        
        card.onclick = () => {
            alert(`Nanti ini akan diarahkan ke Halaman Nonton untuk:\n\n${title}\n(Memanggil endpoint /api/detail/${slug})`);
        };

        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${poster}" alt="${title}" loading="lazy">
                <div class="card-badge">Ep ${episode}</div>
            </div>
            <div class="card-content">
                <div class="card-title" title="${title}">${title}</div>
                <div class="card-meta">
                    <span><i class="fas fa-star text-red"></i> ${rating}</span>
                    <span class="text-red" style="font-weight:bold;">Tonton <i class="fas fa-play-circle"></i></span>
                </div>
            </div>
        `;
        donghuaGrid.appendChild(card);
    });
}

function setupIntersectionObserver() {
    const options = {
        root: null,
        rootMargin: '400px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isFetching && hasMoreData) {
            if (currentMode === 'home') {
                fetchData(`/api/home?pages=${currentPage}`);
            } else if (currentMode === 'search') {
                fetchData(`/api/search?q=${encodeURIComponent(currentQuery)}&pages=${currentPage}`);
            }
        }
    }, options);

    const sentinel = document.createElement('div');
    sentinel.style.width = '100%';
    sentinel.style.height = '10px';
    contentSection.appendChild(sentinel);
    
    observer.observe(sentinel);
}