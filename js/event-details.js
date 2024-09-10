// Use CONFIG.API_BASE_URL as the API base URL
const API_BASE_URL = CONFIG.API_BASE_URL;

function getEventIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    console.log('Extracted Event ID:', eventId);
    return eventId;
}

function fetchEventDetails() {
    const eventId = getEventIdFromUrl();
    if (!eventId) {
        document.getElementById('eventDetails').innerHTML = 'Event ID not found in URL.';
        return;
    }

    fetch(`${API_BASE_URL}entertainment/event/${eventId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(event => {
            displayEventDetails(event);
        })
        .catch(error => {
            console.error('Error fetching event details:', error);
            document.getElementById('eventDetails').innerHTML = 'Failed to retrieve event details. Please try again later.';
        });
}

function displayEventDetails(event) {
    const eventDetailsContainer = document.getElementById('eventDetails');
    
    let imageUrl = 'path/to/default-image.jpg';
    if (event.images && event.images.length > 0) {
        const image = event.images.find(img => img.width >= 500 && img.width <= 800) || event.images[0];
        imageUrl = image.url;
    }

    let priceRange = 'Price not available';
    if (event.priceRanges && event.priceRanges.length > 0) {
        const price = event.priceRanges[0];
        if (price.min === price.max) {
            priceRange = `$${price.min}`;
        } else {
            priceRange = `$${price.min} - $${price.max}`;
        }
    }

    const eventDate = new Date(event.dates.start.localDate);
    const formattedDate = eventDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    eventDetailsContainer.innerHTML = `
        <div class="event-image-container">
            <img src="${imageUrl}" alt="${event.name}" class="event-image">
        </div>
        <div class="event-info">
            <h1>${event.name}</h1>
            <div class="event-meta">
                <div class="event-meta-item">
                    <p><strong>Date:</strong> ${formattedDate}</p>
                </div>
                <div class="event-meta-item">
                    <p><strong>Time:</strong> ${event.dates.start.localTime || 'Not specified'}</p>
                </div>
                <div class="event-meta-item">
                    <p><strong>Price Range:</strong> ${priceRange}</p>
                </div>
                <div class="event-meta-item">
                    <p><strong>Venue:</strong> ${event._embedded?.venues[0]?.name || 'Venue not specified'}</p>
                </div>
            </div>
            <div class="event-description">
                <h2>Event Description</h2>
                <p>${event.description || event.info || 'No description available'}</p>
            </div>
            <p><strong>Please Note:</strong> ${event.pleaseNote || 'No special notes'}</p>
            <a href="${event.url}" target="_blank" class="buy-tickets-btn">Buy Tickets</a>
        </div>
    `;
}

// Fetch event details when the page loads
document.addEventListener('DOMContentLoaded', fetchEventDetails);