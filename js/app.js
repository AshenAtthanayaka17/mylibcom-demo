import { books } from './books-data.js';

let currentUser = null;
let userData = { wishlist: [], borrowed: [] };
let currentFilter = 'All';
let currentSort = 'newest';
let searchQuery = '';

const genres = [
    'All', 'Poetry', 'Fiction', 'Fantasy', 'Sci-Fi', 'Mystery', 'Classic', 'Non-Fiction', 'Horror', 'Novel', 'Romance', 'Miscellaneous', 'Religion'
];

export function initApp() {
    window.auth.onAuthStateChanged(user => {
        currentUser = user || null;
        updateAuthUI();
        if (user) {
            loadUserData();
        } else {
            userData = { wishlist: [], borrowed: [] };
            renderBooks();
        }
    });

    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const sortSelect = document.getElementById('sortSelect');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');

    if (searchInput) searchInput.addEventListener('input', e => handleSearch(e.target.value));
    if (mobileSearchInput) mobileSearchInput.addEventListener('input', e => handleSearch(e.target.value));
    if (sortSelect) sortSelect.addEventListener('change', e => { currentSort = e.target.value; renderBooks(); });
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => document.getElementById('mobileSearchPanel').classList.toggle('hidden'));

    generateGenreFilters();
    generateSnowflakes();
    renderBooks();
}

function generateGenreFilters() {
    const container = document.getElementById('genreFilters');
    if (!container) return;
    container.innerHTML = '';
    genres.forEach(genre => {
        const btn = document.createElement('button');
        btn.textContent = genre;
        btn.onclick = () => filterByGenre(genre);
        btn.className = `px-4 py-1.5 rounded-full text-sm font-medium transition-all ${genre === currentFilter ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`;
        container.appendChild(btn);
    });
}

function generateSnowflakes() {
    const container = document.getElementById('snowflakeContainer');
    if (!container) return;
    const styles = [
        { left: '5%', dur: '14s', delay: '0s', size: '1.4em' },
        { left: '12%', dur: '12s', delay: '1s', size: '1.1em' },
        { left: '20%', dur: '16s', delay: '2s', size: '1.0em' },
        { left: '28%', dur: '11s', delay: '3s', size: '1.2em' },
        { left: '36%', dur: '15s', delay: '1.5s', size: '1.3em' },
        { left: '44%', dur: '13s', delay: '2.5s', size: '1.0em' },
        { left: '52%', dur: '17s', delay: '0.5s', size: '1.2em' },
        { left: '60%', dur: '12s', delay: '1.2s', size: '1.1em' },
        { left: '68%', dur: '14s', delay: '2.2s', size: '1.3em' },
        { left: '76%', dur: '13s', delay: '0.8s', size: '1.0em' },
        { left: '84%', dur: '16s', delay: '2.8s', size: '1.2em' },
        { left: '92%', dur: '11s', delay: '1.8s', size: '1.1em' }
    ];
    container.innerHTML = '';
    styles.forEach((s, i) => {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.textContent = i % 2 === 0 ? '❅' : '❆';  // Update Flakes in here...
        flake.style.left = s.left;
        flake.style.animationDuration = s.dur;
        flake.style.animationDelay = s.delay;
        flake.style.fontSize = s.size;
        container.appendChild(flake);
    });
}

function filterByGenre(genre) {
    currentFilter = genre;
    generateGenreFilters();
    renderBooks();
}

function handleSearch(q) {
    searchQuery = (q || '').toLowerCase().trim();
    renderBooks();
}

function normalizedYear(y) {
    if (!y) return 0;
    const n = parseInt(String(y).replace(/[^0-9]/g, ''), 10);
    return Number.isFinite(n) ? n : 0;
}

function isAvailable(book) {
    const borrowedByUser = userData.borrowed?.includes(book.id);
    return !!book.available && !borrowedByUser;
}

function renderBooks() {
    const grid = document.getElementById('bookGrid');
    const noResults = document.getElementById('noResults');
    const bookCount = document.getElementById('bookCount');
    if (!grid) return;

    const filtered = books
        .filter(b => {
            const genreMatch = currentFilter === 'All' || b.genre === currentFilter;
            const s = searchQuery;
            const searchMatch = !s || b.title.toLowerCase().includes(s) || b.author.toLowerCase().includes(s) || (b.genre || '').toLowerCase().includes(s);
            return genreMatch && searchMatch;
        })
        .sort((a, b) => {
            if (currentSort === 'rating') return (b.rating || 0) - (a.rating || 0);
            if (currentSort === 'available') {
                const avA = isAvailable(a) ? 1 : 0;
                const avB = isAvailable(b) ? 1 : 0;
                if (avB !== avA) return avB - avA;
                return (b.rating || 0) - (a.rating || 0);
            }
            if (currentSort === 'oldest') return normalizedYear(a.year) - normalizedYear(b.year);
            return normalizedYear(b.year) - normalizedYear(a.year);
        });

    grid.innerHTML = '';
    const countText = `Showing ${filtered.length} book${filtered.length === 1 ? '' : 's'}`;
    if (bookCount) bookCount.textContent = countText;

    if (filtered.length === 0) {
        if (noResults) noResults.classList.remove('hidden');
        return;
    } else {
        if (noResults) noResults.classList.add('hidden');
    }

    filtered.forEach(book => {
        const available = isAvailable(book);
        const card = document.createElement('div');
        card.className = `bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden card-hover fade-in ${available ? '' : 'card-unavailable'}`;

        const img = document.createElement('img');
        img.src = book.image || '';
        img.alt = book.title;
        img.className = 'w-full h-56 object-cover';
        img.onerror = () => { img.style.display = 'none'; };

        const body = document.createElement('div');
        body.className = 'p-5';

        const top = document.createElement('div');
        top.className = 'flex items-start justify-between mb-2';

        const genre = document.createElement('span');
        genre.className = 'text-xs font-bold tracking-wider uppercase text-emerald-400';
        genre.textContent = book.genre || 'Unknown';

        const ratingWrap = document.createElement('div');
        ratingWrap.className = 'flex items-center gap-1 text-yellow-400';
        ratingWrap.innerHTML = `<i class="fa-solid fa-star"></i><span class="font-bold text-white">${(book.rating || 0).toFixed(1)}</span>`;

        top.appendChild(genre);
        top.appendChild(ratingWrap);

        const title = document.createElement('h3');
        title.className = 'text-xl font-bold text-white mb-1 leading-tight line-clamp-2';
        title.textContent = book.title;

        const author = document.createElement('p');
        author.className = 'text-sm text-slate-300 mb-3';
        author.textContent = `by ${book.author}`;

        const meta = document.createElement('div');
        meta.className = 'flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4';
        meta.innerHTML = `
            <span>${book.year || 'Unknown'}</span>
            <span>&bull;</span>
            <span>${book.pages || 0} pages</span>
            <span>&bull;</span>
            <span class="px-2 py-0.5 rounded text-xs font-bold ${`cat-${book.category || 'Unspecified'}`}">${book.category || 'Unspecified'}</span>
        `;

        const statusRow = document.createElement('div');
        statusRow.className = 'flex items-center justify-between';

        const location = document.createElement('div');
        location.className = 'text-xs text-slate-400';
        location.textContent = book.location || '';

        const status = document.createElement('div');
        status.className = `text-sm font-bold ${available ? 'status-available' : 'status-checked-out'}`;
        status.textContent = available ? 'Available' : 'Checked out';

        statusRow.appendChild(location);
        statusRow.appendChild(status);

        const actions = document.createElement('div');
        actions.className = 'mt-4 flex items-center gap-2';

        const detailsBtn = document.createElement('button');
        detailsBtn.className = 'flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-3 rounded-lg';
        detailsBtn.textContent = 'Details';
        detailsBtn.onclick = () => openModal(book);

        const wishBtn = document.createElement('button');
        const wished = userData.wishlist?.includes(book.id);
        wishBtn.className = `px-3 py-2 rounded-lg ${wished ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`;
        wishBtn.innerHTML = `<i class="fa-solid fa-heart"></i>`;
        wishBtn.title = wished ? 'Remove from wishlist' : 'Add to wishlist';
        wishBtn.onclick = () => toggleWishlist(book.id);

        actions.appendChild(detailsBtn);
        actions.appendChild(wishBtn);

        body.appendChild(top);
        body.appendChild(title);
        body.appendChild(author);
        body.appendChild(meta);
        body.appendChild(statusRow);
        body.appendChild(actions);

        card.appendChild(img);
        card.appendChild(body);
        grid.appendChild(card);
    });
}

function openModal(book) {
    const modal = document.getElementById('bookModal');
    if (!modal) return;
    const get = id => document.getElementById(id);
    get('modalImagePlaceholder').style.display = 'none';
    const img = get('modalImage');
    img.style.display = 'block';
    img.src = book.image || '';

    get('modalGenre').textContent = book.genre || 'Unknown';
    get('modalRating').textContent = (book.rating || 0).toFixed(1);
    get('modalTitle').textContent = book.title;
    get('modalAuthor').textContent = `by ${book.author}`;
    get('modalYear').textContent = book.year || 'Unknown';
    get('modalPages').textContent = `${book.pages || 0} pages`;
    get('modalCategory').textContent = book.category || 'Unspecified';
    get('modalDescription').textContent = book.description || '';
    get('modalLocation').textContent = book.location || '';

    const status = get('modalStatus');
    const available = isAvailable(book);
    status.innerHTML = '';
    const dot = document.createElement('span');
    dot.className = `w-2 h-2 rounded-full inline-block mr-2 ${available ? 'bg-emerald-400' : 'bg-red-400'}`;
    status.appendChild(dot);
    const txt = document.createElement('span');
    txt.textContent = available ? 'Available' : 'Checked out';
    status.appendChild(txt);

    const actionButton = get('actionButton');
    actionButton.className = `w-full ${available ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'} text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm shadow-lg`;
    actionButton.innerHTML = available ? '<i class="fa-solid fa-book"></i> Borrow Now' : '<i class="fa-solid fa-rotate-left"></i> Return Book';
    actionButton.onclick = () => {
        if (!currentUser) {
            openAuthModal('Login required');
            return;
        }
        if (available) {
            borrowBook(book.id);
        } else {
            returnBook(book.id);
        }
        closeModal();
    };

    modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('bookModal');
    if (modal) modal.classList.add('hidden');
}

function borrowBook(bookId) {
    if (!userData.borrowed.includes(bookId)) {
        userData.borrowed.push(bookId);
        saveUserData();
        renderBooks();
        renderAccountLists();
    }
}

function returnBook(bookId) {
    userData.borrowed = userData.borrowed.filter(id => id !== bookId);
    saveUserData();
    renderBooks();
    renderAccountLists();
}

function toggleWishlist(bookId) {
    if (!currentUser) {
        openAuthModal('Login required');
        return;
    }
    const i = userData.wishlist.indexOf(bookId);
    if (i === -1) userData.wishlist.push(bookId); else userData.wishlist.splice(i, 1);
    saveUserData();
    renderBooks();
    renderAccountLists();
}

function updateAuthUI() {
    const section = document.getElementById('authSection');
    const accountBtn = document.getElementById('accountBtn');
    if (!section) return;
    section.innerHTML = '';
    if (currentUser) {
        const welcome = document.createElement('span');
        welcome.className = 'text-slate-300 text-sm';
        welcome.textContent = currentUser.email || 'Signed in';

        const account = document.createElement('button');
        account.className = 'text-emerald-400 hover:text-emerald-300';
        account.innerHTML = '<i class="fa-solid fa-user-circle text-2xl"></i>';
        account.onclick = () => showAccount();

        const signOut = document.createElement('button');
        signOut.className = 'text-slate-300 hover:text-white';
        signOut.innerHTML = '<i class="fa-solid fa-right-from-bracket text-xl"></i>';
        signOut.title = 'Sign out';
        signOut.onclick = async () => { await window.auth.signOut(); showHome(); };

        section.appendChild(welcome);
        section.appendChild(account);
        section.appendChild(signOut);
        if (accountBtn) accountBtn.classList.remove('hidden');
    } else {
        const loginBtn = document.createElement('button');
        loginBtn.className = 'text-emerald-400 hover:text-emerald-300';
        loginBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket text-xl"></i>';
        loginBtn.onclick = () => openAuthModal('Login');
        section.appendChild(loginBtn);
        if (accountBtn) accountBtn.classList.add('hidden');
    }
}

async function loadUserData() {
    try {
        const ref = window.db.collection('users').doc(currentUser.uid);
        const snap = await ref.get();
        userData = snap.exists ? (snap.data() || { wishlist: [], borrowed: [] }) : { wishlist: [], borrowed: [] };
        renderBooks();
        renderAccountLists();
    } catch (e) {
        userData = { wishlist: [], borrowed: [] };
        renderBooks();
    }
}

async function saveUserData() {
    if (!currentUser) return;
    const ref = window.db.collection('users').doc(currentUser.uid);
    await ref.set({ wishlist: userData.wishlist, borrowed: userData.borrowed }, { merge: true });
}

function renderAccountLists() {
    const wish = document.getElementById('wishlistContainer');
    const bor = document.getElementById('borrowedContainer');
    if (!wish || !bor) return;
    wish.innerHTML = '';
    bor.innerHTML = '';

    if (!currentUser) {
        wish.innerHTML = '<p class="text-slate-500">Login to view your wishlist.</p>';
        bor.innerHTML = '<p class="text-slate-500">Login to view borrowed books.</p>';
        return;
    }

    const wishlistBooks = books.filter(b => userData.wishlist.includes(b.id));
    const borrowedBooks = books.filter(b => userData.borrowed.includes(b.id));

    if (wishlistBooks.length === 0) {
        wish.innerHTML = '<p class="text-slate-500">Your wishlist is empty.</p>';
    } else {
        wishlistBooks.forEach(b => {
            const item = document.createElement('div');
            item.className = 'flex items-center gap-3';
            item.innerHTML = `<img src="${b.image || ''}" class="w-10 h-14 object-cover rounded" onerror="this.style.display='none'">` +
                `<div class="flex-1"><p class="text-slate-200 text-sm">${b.title}</p><p class="text-slate-500 text-xs">${b.author}</p></div>` +
                `<button class="text-red-400" title="Remove" onclick="toggleWishlist(${b.id})"><i class='fa-solid fa-trash'></i></button>`;
            wish.appendChild(item);
        });
    }

    if (borrowedBooks.length === 0) {
        bor.innerHTML = '<p class="text-slate-500">No books borrowed yet.</p>';
    } else {
        borrowedBooks.forEach(b => {
            const item = document.createElement('div');
            item.className = 'flex items-center gap-3';
            item.innerHTML = `<img src="${b.image || ''}" class="w-10 h-14 object-cover rounded" onerror="this.style.display='none'">` +
                `<div class="flex-1"><p class="text-slate-200 text-sm">${b.title}</p><p class="text-slate-500 text-xs">${b.author}</p></div>` +
                `<button class="text-emerald-400" title="Return" onclick="returnBook(${b.id})"><i class='fa-solid fa-rotate-left'></i></button>`;
            bor.appendChild(item);
        });
    }
}

function resetApp() {
    currentFilter = 'All';
    currentSort = 'newest';
    searchQuery = '';
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    if (searchInput) searchInput.value = '';
    if (mobileSearchInput) mobileSearchInput.value = '';
    generateGenreFilters();
    renderBooks();
}

function showAccount() {
    document.getElementById('accountPage')?.classList.remove('hidden');
    document.getElementById('bookGrid')?.classList.add('hidden');
    document.getElementById('noResults')?.classList.add('hidden');
    document.getElementById('bookCount')?.classList.add('hidden');
    document.getElementById('genreFilters')?.classList.add('hidden');
    document.getElementById('sortSelect')?.parentElement?.parentElement?.parentElement?.classList.add('hidden');
    renderAccountLists();
}

function showHome() {
    document.getElementById('accountPage')?.classList.add('hidden');
    document.getElementById('bookGrid')?.classList.remove('hidden');
    document.getElementById('bookCount')?.classList.remove('hidden');
    document.getElementById('genreFilters')?.classList.remove('hidden');
    document.getElementById('sortSelect')?.parentElement?.parentElement?.parentElement?.classList.remove('hidden');
}

function openAuthModal(title) {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    const t = document.getElementById('authTitle');
    const mainBtn = document.getElementById('authMainBtn');
    const toggleText = document.getElementById('authToggleText');
    if (t) t.textContent = title || 'Login';
    if (mainBtn) { mainBtn.textContent = 'Login'; mainBtn.onclick = () => login(); }
    if (toggleText) toggleText.textContent = "Don't have an account?";
    modal.classList.remove('hidden');
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('hidden');
}

function toggleAuthMode() {
    const title = document.getElementById('authTitle');
    const mainBtn = document.getElementById('authMainBtn');
    const toggleText = document.getElementById('authToggleText');
    if (!title || !mainBtn || !toggleText) return;
    const isLogin = mainBtn.textContent === 'Login';
    if (isLogin) {
        title.textContent = 'Register';
        mainBtn.textContent = 'Register';
        mainBtn.onclick = () => register();
        toggleText.textContent = 'Already have an account?';
    } else {
        title.textContent = 'Login';
        mainBtn.textContent = 'Login';
        mainBtn.onclick = () => login();
        toggleText.textContent = "Don't have an account?";
    }
}

async function login() {
    const email = document.getElementById('authEmail')?.value || '';
    const password = document.getElementById('authPassword')?.value || '';
    try {
        await window.auth.signInWithEmailAndPassword(email, password);
        closeAuthModal();
    } catch (e) {
        alert(e.message || 'Login failed');
    }
}

async function register() {
    const email = document.getElementById('authEmail')?.value || '';
    const password = document.getElementById('authPassword')?.value || '';
    try {
        await window.auth.createUserWithEmailAndPassword(email, password);
        closeAuthModal();
    } catch (e) {
        alert(e.message || 'Registration failed');
    }
}

async function googleSignIn() {
    try {
        const provider = new window.firebase.auth.GoogleAuthProvider();
        await window.auth.signInWithPopup(provider);
        closeAuthModal();
    } catch (e) {
        alert(e.message || 'Google sign-in failed');
    }
}

async function forgotPassword() {
    const email = document.getElementById('authEmail')?.value || '';
    if (!email) { alert('Enter your email to reset password'); return; }
    try {
        await window.auth.sendPasswordResetEmail(email);
        alert('Password reset email sent');
    } catch (e) {
        alert(e.message || 'Failed to send reset email');
    }
}

window.resetApp = resetApp;
window.showAccount = showAccount;
window.showHome = showHome;
window.closeModal = closeModal;
window.closeAuthModal = closeAuthModal;
window.toggleAuthMode = toggleAuthMode;
window.login = login;
window.register = register;
window.googleSignIn = googleSignIn;
window.forgotPassword = forgotPassword;
window.toggleWishlist = toggleWishlist;
window.borrowBook = borrowBook;
window.returnBook = returnBook;




