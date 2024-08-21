// Use CONFIG.API_BASE_URL as the API base URL
const API_BASE_URL = CONFIG.API_BASE_URL;
const LOCATION = 'Wollongong';

// Get current weather
function getCurrentWeather() {
    fetch(`${API_BASE_URL}weather/current?location=${encodeURIComponent(LOCATION)}`)
        .then(response => response.json())
        .then(data => {
            const weatherInfo = document.getElementById('currentWeatherInfo');
            weatherInfo.innerHTML = `
                <h1>${data.current.temp_c}°C<img src="${data.current.condition.icon}" alt="${data.current.condition.text}"></h1>
                <p>Humidity: ${data.current.humidity}%</p>
                <p>Condition: ${data.current.condition.text}</p>
            `;
            getWeatherAlerts();
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('currentWeatherInfo').innerHTML = 'Failed to retrieve weather information';
        });
}

function getWeatherForecast() {
    fetch(`${API_BASE_URL}weather/forecast?location=${encodeURIComponent(LOCATION)}&days=7`)
        .then(response => response.json())
        .then(data => {
            const forecastInfo = document.getElementById('weatherForecastInfo');
            let forecastHtml = `<ul>`;
            data.forecast.forecastday.forEach(day => {
                let formattedDate = day.date.replace(/^\d{4}-/, '');
                
                forecastHtml += `
                    <li>
                        <strong>${formattedDate}</strong>
                        ${day.day.maxtemp_c}°C ~ ${day.day.mintemp_c}°C
                        <img src="${day.day.condition.icon}" alt="${day.day.condition.text}">
                        ${day.day.condition.text}
                    </li>
                `;
            });
            forecastHtml += '</ul>';
            forecastInfo.innerHTML = forecastHtml;
            getWeatherAlerts();
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('weatherForecastInfo').innerHTML = 'Failed to retrieve weather forecast';
        });
}

// Get weather alerts
function getWeatherAlerts() {
    fetch(`${API_BASE_URL}weather/alerts?location=${encodeURIComponent(LOCATION)}`)
        .then(response => response.json())
        .then(data => {
            const alertInfo = document.getElementById('weatherAlertInfo');
            let alertsHtml = `<h4>Weather Alerts</h4>`;
            if (data.alerts && Object.values(data.alerts).some(value => value !== null)) {
                alertsHtml += '<ul>';
                for (const [key, value] of Object.entries(data.alerts)) {
                    if (value !== null) {
                        alertsHtml += `<li><strong>${key}</strong>: ${value}</li>`;
                    }
                }
                alertsHtml += '</ul>';
            } else {
                alertsHtml += '<p>No current weather alerts</p>';
            }
            alertInfo.innerHTML = alertsHtml;
            alertInfo.style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('weatherAlertInfo').innerHTML = 'Failed to retrieve weather alerts';
        });
}

function toggleWeatherView() {
    const currentWeatherBtn = document.getElementById('currentWeatherBtn');
    const forecastWeatherBtn = document.getElementById('forecastWeatherBtn');
    const currentWeatherInfo = document.getElementById('currentWeatherInfo');
    const weatherForecastInfo = document.getElementById('weatherForecastInfo');

    currentWeatherBtn.addEventListener('click', () => {
        currentWeatherBtn.classList.add('active');
        forecastWeatherBtn.classList.remove('active');
        currentWeatherInfo.classList.add('active');
        weatherForecastInfo.classList.remove('active');
        
        // Clear forecast data
        weatherForecastInfo.innerHTML = '';
        getWeatherAlerts()
        // Re-fetch current weather data
        getCurrentWeather();
    });

    forecastWeatherBtn.addEventListener('click', () => {
        forecastWeatherBtn.classList.add('active');
        currentWeatherBtn.classList.remove('active');
        weatherForecastInfo.classList.add('active');
        currentWeatherInfo.classList.remove('active');
        
        // Clear current weather data
        currentWeatherInfo.innerHTML = '';
        getWeatherAlerts()
        // Fetch weather forecast data
        getWeatherForecast();
    });
}

function getWhatsOn() {
    fetch(`${API_BASE_URL}entertainment/whats-on`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            const packagesSection = document.querySelector('.package-card');
            let eventsHtml = '<div class="event-row">';
            
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

            // 過濾和排序事件
            const currentDate = new Date();
            const futureEvents = events.filter(event => {
                const eventDate = new Date(event.dates.start.localDate);
                return eventDate >= currentDate;
            });

            futureEvents.sort((a, b) => {
                const dateA = new Date(a.dates.start.localDate);
                const dateB = new Date(b.dates.start.localDate);
                return dateA - dateB;
            });

            const upcomingEvents = futureEvents.slice(0, 6);

            if (upcomingEvents.length > 0) {
                upcomingEvents.forEach((event, index) => {
                    if (index === 3) {
                        eventsHtml += '</div><div class="event-row">';
                    }

                    let imageUrl = 'path/to/default-image.jpg';
                    if (event.images && event.images.length > 0) {
                        const image = event.images.find(img => img.width >= 500 && img.width <= 800) || event.images[0];
                        imageUrl = image.url;
                    }

                    // 獲取事件分類
                    let category = 'Uncategorized';
                    if (event.classifications && event.classifications.length > 0) {
                        const primaryClassification = event.classifications[0];
                        if (primaryClassification.segment) {
                            category = primaryClassification.segment.name;
                        } else if (primaryClassification.genre) {
                            category = primaryClassification.genre.name;
                        }
                    }

                    // 格式化日期
                    const eventDate = new Date(event.dates.start.localDate);
                    const formattedDate = eventDate.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });

                    // 獲取門票價格
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

                    eventsHtml += `
                        <div class="event-card">
                            <img src="${imageUrl}" alt="${event.name}" class="event-image">
                            <h3>${event.name}</h3>
                            <p>${formattedDate}</p>
                            <p class="event-category">${category}</p>
                            <p class="event-price">${ticketPrice}</p>
                        </div>
                    `;
                });
                eventsHtml += '</div>';
            } else {
                eventsHtml = '<p>No upcoming events found</p>';
            }
            
            packagesSection.innerHTML = eventsHtml;
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            document.querySelector('.package-card').innerHTML = 'Failed to retrieve events. Please try again later.';
        });
}


// Automatically fetch all weather information when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    getCurrentWeather();
    toggleWeatherView();
    getWeatherAlerts(); 
    getWhatsOn();
    
    // Ensure the current weather is displayed by default
    document.getElementById('currentWeatherInfo').classList.add('active');
    document.getElementById('weatherForecastInfo').classList.remove('active');
});