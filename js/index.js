// 使用 CONFIG.API_BASE_URL 作為 API 基礎 URL
const API_BASE_URL = CONFIG.API_BASE_URL;
const LOCATION = 'Wollongong';

// 獲取當前天氣
function getCurrentWeather() {
    fetch(`${API_BASE_URL}weather/current?location=${encodeURIComponent(LOCATION)}`)
        .then(response => response.json())
        .then(data => {
            const weatherInfo = document.getElementById('currentWeatherInfo');
            weatherInfo.innerHTML = `
                <h4>${data.location.name}, ${data.location.region}, ${data.location.country}</h4>
                <h1>${data.current.temp_c}°C<img src="${data.current.condition.icon}" alt="${data.current.condition.text}"></h1>
                <p>Humidity: ${data.current.humidity}%</p>
                <p>Condition: ${data.current.condition.text}</p>
            `;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('currentWeatherInfo').innerHTML = '獲取天氣信息失敗';
        });
}

// 獲取天氣預報
function getWeatherForecast() {
    fetch(`${API_BASE_URL}weather/forecast?location=${encodeURIComponent(LOCATION)}&days=7`)
        .then(response => response.json())
        .then(data => {
            const forecastInfo = document.getElementById('weatherForecastInfo');
            let forecastHtml = `<h4>${data.location.name} 7天天氣預報</h4><ul>`;
            data.forecast.forecastday.forEach(day => {
                forecastHtml += `
                    <li>
                        <strong>${day.date}</strong>:
                        最高溫 ${day.day.maxtemp_c}°C,
                        最低溫 ${day.day.mintemp_c}°C,
                        ${day.day.condition.text}
                        <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" style="width:32px;height:32px;">
                    </li>
                `;
            });
            forecastHtml += '</ul>';
            forecastInfo.innerHTML = forecastHtml;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('weatherForecastInfo').innerHTML = '獲取天氣預報失敗';
        });
}

// 獲取天氣警報
function getWeatherAlerts() {
    fetch(`${API_BASE_URL}weather/alerts?location=${encodeURIComponent(LOCATION)}`)
        .then(response => response.json())
        .then(data => {
            const alertInfo = document.getElementById('weatherAlertInfo');
            let alertsHtml = `<h4>天氣警報</h4>`;
            if (data.alerts && Object.values(data.alerts).some(value => value !== null)) {
                alertsHtml += '<ul>';
                for (const [key, value] of Object.entries(data.alerts)) {
                    if (value !== null) {
                        alertsHtml += `<li><strong>${key}</strong>: ${value}</li>`;
                    }
                }
                alertsHtml += '</ul>';
            } else {
                alertsHtml += '<p>目前沒有天氣警報</p>';
            }
            alertInfo.innerHTML = alertsHtml;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('weatherAlertInfo').innerHTML = '獲取天氣警報失敗';
        });
}

// 當頁面加載完成後，自動獲取所有天氣信息
document.addEventListener('DOMContentLoaded', () => {
    getCurrentWeather();
    getWeatherForecast();
    getWeatherAlerts();
});

// 顯示當前使用的 API URL（用於調試）
console.log('Current API URL:', API_BASE_URL);