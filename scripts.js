import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

// State variables for pagination and search results
let page = 1;
let matches = books;

// Book Object to create book previews
const createBookPreview = ({ author, id, image, title }) => {
    const element = document.createElement('button');
    element.classList.add('preview');
    element.setAttribute('data-preview', id);

    element.innerHTML = `
        <img class="preview__image" src="${image}" />
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;
    return element;
};

// Render initial book previews
const renderBookPreviews = (start = 0, end = BOOKS_PER_PAGE) => {
    const fragment = document.createDocumentFragment();
    matches.slice(start, end).forEach(book => fragment.appendChild(createBookPreview(book)));
    document.querySelector('[data-list-items]').appendChild(fragment);
};

// Generate dropdown options for authors and genres
const generateDropdownOptions = (data, defaultOption) => {
    const fragment = document.createDocumentFragment();
    const defaultElement = document.createElement('option');
    defaultElement.value = 'any';
    defaultElement.innerText = defaultOption;
    fragment.appendChild(defaultElement);

    Object.entries(data).forEach(([id, name]) => {
        const option = document.createElement('option');
        option.value = id;
        option.innerText = name;
        fragment.appendChild(option);
    });

    return fragment;
};

// Apply theme based on user preference
const applyTheme = (theme) => {
    const isNight = theme === 'night';
    document.documentElement.style.setProperty('--color-dark', isNight ? '255, 255, 255' : '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', isNight ? '10, 10, 20' : '255, 255, 255');
};

// Handle form submission for search and filter
const handleSearch = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = books.filter(book => {
        const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
        const titleMatch = !filters.title.trim() || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || book.author === filters.author;
        return genreMatch && titleMatch && authorMatch;
    });

    page = 1;
    matches = result;
    document.querySelector('[data-list-items]').innerHTML = '';
    renderBookPreviews();
    document.querySelector('[data-list-message]').classList.toggle('list__message_show', result.length < 1);
    document.querySelector('[data-list-button]').disabled = result.length <= BOOKS_PER_PAGE;
    document.querySelector('[data-search-overlay]').open = false;
};

// Initialize elements and event listeners
const init = () => {
    renderBookPreviews();

    // Set up genre and author dropdowns
    document.querySelector('[data-search-genres]').appendChild(generateDropdownOptions(genres, 'All Genres'));
    document.querySelector('[data-search-authors]').appendChild(generateDropdownOptions(authors, 'All Authors'));

    // Set theme based on user preferences
    const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
    document.querySelector('[data-settings-theme]').value = theme;
    applyTheme(theme);

    // Event listeners
    document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
        event.preventDefault();
        applyTheme(new FormData(event.target).get('theme'));
        document.querySelector('[data-settings-overlay]').open = false;
    });

    document.querySelector('[data-search-form]').addEventListener('submit', handleSearch);

    document.querySelector('[data-list-button]').addEventListener('click', () => {
        renderBookPreviews(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE);
        page += 1;
    });

    document.querySelector('[data-list-items]').addEventListener('click', (event) => {
        const previewId = event.target.closest('[data-preview]')?.dataset.preview;
        const activeBook = books.find(book => book.id === previewId);
        if (activeBook) {
            document.querySelector('[data-list-active]').open = true;
            document.querySelector('[data-list-blur]').src = activeBook.image;
            document.querySelector('[data-list-image]').src = activeBook.image;
            document.querySelector('[data-list-title]').innerText = activeBook.title;
            document.querySelector('[data-list-subtitle]').innerText = `${authors[activeBook.author]} (${new Date(activeBook.published).getFullYear()})`;
            document.querySelector('[data-list-description]').innerText = activeBook.description;
        }
    });

    // UI toggle listeners
    document.querySelector('[data-search-cancel]').addEventListener('click', () => document.querySelector('[data-search-overlay]').open = false);
    document.querySelector('[data-settings-cancel]').addEventListener('click', () => document.querySelector('[data-settings-overlay]').open = false);
    document.querySelector('[data-header-search]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = true;
        document.querySelector('[data-search-title]').focus();
    });
    document.querySelector('[data-header-settings]').addEventListener('click', () => document.querySelector('[data-settings-overlay]').open = true);
    document.querySelector('[data-list-close]').addEventListener('click', () => document.querySelector('[data-list-active]').open = false);
};

// Initialize application
init();
