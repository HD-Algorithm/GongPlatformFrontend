// Use CONFIG.API_BASE_URL as the API base URL
const API_BASE_URL = CONFIG.API_BASE_URL;
const LOCATION = 'Wollongong';

// OpenAI API Key
const OPENAI_API_KEY = "";

let conversationStep = 0;
let userResponses = {
    days: null,
    mustVisit: null,
    likesActivities: null
};

document.getElementById('sendMessageBtn').addEventListener('click', () => {
    const userInput = document.getElementById('userInput').value;
    if (!userInput) return;

    appendUserMessage(userInput);

    switch(conversationStep) {
        case 0:
            // Step 1
            userResponses.days = userInput;
            appendBotMessage("Great! Is there any specific place you must visit? For example, 'Kiama' or 'Sea Cliff Bridge'.");
            conversationStep++;
            break;
        case 1:
            // Step 2
            userResponses.mustVisit = userInput;
            appendBotMessage("Got it! Do you enjoy outdoor activities like hiking or biking?");
            conversationStep++;
            break;
        case 2:
            // Step 3
            userResponses.likesActivities = userInput;
            appendBotMessage("Thanks for the information! Let me suggest some places for you...");
            generateCustomTravelRecommendation();
            conversationStep = 0; 
            break;
        default:
            appendBotMessage("Sorry, something went wrong. Please try again.");
    }

    document.getElementById('userInput').value = '';
});

function generateCustomTravelRecommendation() {
    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful travel assistant." },
                { role: "user", content: `I am planning a trip for ${userResponses.days} days. I must visit ${userResponses.mustVisit}, and I enjoy ${userResponses.likesActivities}. Please suggest some interesting places to visit in Wollongong area.` }
            ],
            max_tokens: 1000,
            temperature: 0.7
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.choices && data.choices.length > 0) {
            const botMessage = data.choices[0].message.content.trim();
            appendBotMessage(botMessage);
        } else {
            throw new Error('Invalid response format');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        appendBotMessage("Sorry, I couldn't provide a recommendation at this time. Please try again later.");
    });
}

function appendUserMessage(message) {
    const messageContainer = document.getElementById('chatbot-messages');
    const userMessageElement = document.createElement('div');
    userMessageElement.classList.add('message', 'user');
    userMessageElement.textContent = message;
    messageContainer.appendChild(userMessageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function appendBotMessage(message) {
    const messageContainer = document.getElementById('chatbot-messages');
    const botMessageElement = document.createElement('div');
    botMessageElement.classList.add('message', 'bot');
    botMessageElement.textContent = message;
    messageContainer.appendChild(botMessageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}




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
                        <a href="event-details.html?id=${event.id}" class="event-card-link">
                            <div class="event-card">
                                <img src="${imageUrl}" alt="${event.name}" class="event-image">
                                <h3>${event.name}</h3>
                                <p>${formattedDate}</p>
                                <p class="event-category">${category}</p>
                                <p class="event-price">${ticketPrice}</p>
                            </div>
                        </a>
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

document.getElementById('toggleChatbot').addEventListener('click', function(event) {
    event.stopPropagation();

    const chatbotContainer = document.getElementById('chatbot-container');
    chatbotContainer.classList.toggle('collapsed');

    const toggleButton = document.getElementById('toggleChatbot');
    if (chatbotContainer.classList.contains('collapsed')) {
        toggleButton.textContent = '+';
    } else {
        toggleButton.textContent = '−';
    }
});

document.getElementById('chatbot-container').addEventListener('click', function() {
    const chatbotContainer = document.getElementById('chatbot-container');
    if (chatbotContainer.classList.contains('collapsed')) {
        chatbotContainer.classList.remove('collapsed');
        document.getElementById('toggleChatbot').textContent = '−';
    }
});


document.addEventListener('DOMContentLoaded', () => {
    getCurrentWeather();
    toggleWeatherView();
    getWeatherAlerts(); 
    getWhatsOn();
    document.getElementById('currentWeatherInfo').classList.add('active');
    document.getElementById('weatherForecastInfo').classList.remove('active');
});