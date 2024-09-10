// Use CONFIG.API_BASE_URL as the API base URL
const API_BASE_URL = CONFIG.API_BASE_URL;
const EVENTS_PER_PAGE = 8;
let allEvents = [];
let currentPage = 1;

function fetchAllEvents() {
    fetch(`${API_BASE_URL}entertainment/whats-on`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            
            // Extract events from the response
            let events = [];
            if (Array.isArray(data)) {
                events = data;
            } else if (data._embedded && Array.isArray(data._embedded.events)) {
                events = data._embedded.events;
            } else if (typeof data === 'object') {
                const arrayProperty = Object.values(data).find(value => Array.isArray(value));
                if (arrayProperty) {
                    events = arrayProperty;
                }
            }

            // Filter and sort events
            const currentDate = new Date();
            allEvents = events.filter(event => {
                const eventDate = new Date(event.dates.start.localDate);
                return eventDate >= currentDate;
            }).sort((a, b) => {
                const dateA = new Date(a.dates.start.localDate);
                const dateB = new Date(b.dates.start.localDate);
                return dateA - dateB;
            });

            displayEvents(currentPage);
            setupPagination();
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            document.getElementById('eventsContainer').innerHTML = 'Failed to retrieve events. Please try again later.';
        });
}

function displayEvents(page) {
    const startIndex = (page - 1) * EVENTS_PER_PAGE;
    const endIndex = startIndex + EVENTS_PER_PAGE;
    const eventsToDisplay = allEvents.slice(startIndex, endIndex);

    const eventsContainer = document.getElementById('eventsContainer');
    eventsContainer.innerHTML = '';

    eventsToDisplay.forEach(event => {
        let imageUrl = 'path/to/default-image.jpg';
        if (event.images && event.images.length > 0) {
            const image = event.images.find(img => img.width >= 500 && img.width <= 800) || event.images[0];
            imageUrl = image.url;
        }

        // Get event category
        let category = 'Uncategorized';
        if (event.classifications && event.classifications.length > 0) {
            const primaryClassification = event.classifications[0];
            if (primaryClassification.segment) {
                category = primaryClassification.segment.name;
            } else if (primaryClassification.genre) {
                category = primaryClassification.genre.name;
            }
        }

        // Format date
        const eventDate = new Date(event.dates.start.localDate);
        const formattedDate = eventDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        // Get ticket price
        let ticketPrice = 'Price not available';
        if (event.priceRanges && event.priceRanges.length > 0) {
            const price = event.priceRanges[0];
            if (price.min === 0 && price.max === 0) {
                ticketPrice = 'FREE';
            } else if (price.min === price.max) {
                ticketPrice = `$${price.min}`;
            } else {
                ticketPrice = `$${price.min} - $${price.max}`;
            }
        }

        const eventCard = document.createElement('a');
        eventCard.className = 'event-card';
        eventCard.href = `event-details.html?id=${event.id}`;
        eventCard.innerHTML = `
            <img src="${imageUrl}" alt="${event.name}" class="event-image">
            <h3>${event.name}</h3>
            <p>${formattedDate}</p>
            <p class="event-category">${category}</p>
            <p class="event-price">${ticketPrice}</p>
        `;
        eventsContainer.appendChild(eventCard);
    });
}

function setupPagination() {
    const totalPages = Math.ceil(allEvents.length / EVENTS_PER_PAGE);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        button.addEventListener('click', () => {
            currentPage = i;
            displayEvents(currentPage);
            updateActivePageButton();
        });
        paginationContainer.appendChild(button);
    }

    updateActivePageButton();
}

function updateActivePageButton() {
    const buttons = document.querySelectorAll('#pagination button');
    buttons.forEach((button, index) => {
        if (index + 1 === currentPage) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Fetch events when the page loads
document.addEventListener('DOMContentLoaded', fetchAllEvents);