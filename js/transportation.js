const API_BASE_URL = CONFIG.API_BASE_URL;

let carMap, transitMap, carDirectionsRenderer, transitDirectionsRenderer;

function initMaps() {
    const wollongong = { lat: -34.4248, lng: 150.8931 };

    carMap = new google.maps.Map(document.getElementById("carMap"), {
        zoom: 10,
        center: wollongong,
        language: 'en',
    });

    transitMap = new google.maps.Map(document.getElementById("transitMap"), {
        zoom: 10,
        center: wollongong,
        language: 'en',
    });

    carDirectionsRenderer = new google.maps.DirectionsRenderer({
        map: carMap,
        suppressMarkers: false, 
        suppressInfoWindows: true,  
        panel: null,
    });

    transitDirectionsRenderer = new google.maps.DirectionsRenderer();
    transitDirectionsRenderer.setMap(transitMap);


    const startLocationInput = document.getElementById("startLocation");
    if (startLocationInput) {
        const autocomplete = new google.maps.places.Autocomplete(startLocationInput);
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                startLocationInput.dataset.lat = lat;
                startLocationInput.dataset.lng = lng;
            }
        });
    }

    const transitStartLocationInput = document.getElementById("transitStartLocation");
    if (transitStartLocationInput) {
        const autocomplete = new google.maps.places.Autocomplete(transitStartLocationInput);
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                transitStartLocationInput.dataset.lat = lat;
                transitStartLocationInput.dataset.lng = lng;
            }
        });
    }

    const drivingDirectionsForm = document.getElementById("drivingDirectionsForm");
    if (drivingDirectionsForm) {
        drivingDirectionsForm.addEventListener("submit", handleCarDirectionsRequest);
    }

    const transitDirectionsForm = document.getElementById("transitDirectionsForm");
    if (transitDirectionsForm) {
        transitDirectionsForm.addEventListener("submit", handleTransitDirectionsRequest);
    }
}

function handleCarDirectionsRequest(event) {
    event.preventDefault();
    const startLocation = document.getElementById("startLocation").value;
    const destination = "Wollongong, NSW, Australia";
    const infoElement = document.getElementById("carDirectionsInfo");

    if (infoElement) infoElement.innerHTML = '<p>Loading route information...</p>';

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
        {
            origin: startLocation,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
            language: 'en',
        },
        (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                console.log('Google DirectionsService Result:', result);
                carDirectionsRenderer.setDirections(result);
                displayCarDirectionsInfo(result);
            } else {
                console.error('Directions request failed due to ' + status);
                showError("Unable to find a route. Please check your starting location and try again.", "carDirectionsError");
                if (infoElement) infoElement.innerHTML = '';
            }
        }
    );
}


function handleTransitDirectionsRequest(event) {
    event.preventDefault();
    const startLocation = document.getElementById("transitStartLocation").value;
    const destination = "Wollongong, NSW, Australia";
    const infoElement = document.getElementById("carDirectionsInfo");

    if (infoElement) infoElement.innerHTML = '<p>Loading route information...</p>';

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
        {
            origin: startLocation,
            destination: destination,
            travelMode: google.maps.TravelMode.TRANSIT,
            language: 'en',
        },
        (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                transitDirectionsRenderer.setDirections(result);
                displayTransitDirectionsInfo(result);
            } else {
                console.error('Directions request failed due to ' + status);
                showError("Unable to find a route. Please check your starting location and try again.", "transitError");
            }
        }
    );
}

function displayCarDirectionsInfo(data) {
    const infoElement = document.getElementById("carDirectionsInfo");
    if (!infoElement) return;

    infoElement.innerHTML = '';

    if (data && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        let html = `
            <h3>Journey Details</h3>
            <p><strong>Distance:</strong> ${leg.distance.text}</p>
            <p><strong>Estimated Time:</strong> ${leg.duration.text}</p>
            <h4>Directions:</h4>
            <ol>
        `;

        leg.steps.forEach((step, index) => {
            html += `<li>${step.instructions} (${step.distance.text})</li>`;
        });

        html += '</ol>';
        infoElement.innerHTML = html;
    } else {
        infoElement.innerHTML = '<p>No route information available.</p>';
    }
}


function createTransitSegment(step) {
    const type = step.travel_mode ? step.travel_mode.toString() : 'Unknown';
    const instruction = step.html_instructions || 'No instructions available';
    const duration = step.duration ? step.duration.text : 'Unknown';
    const distance = step.distance ? step.distance.text : 'Unknown';
    return {
        type,
        instruction,
        duration,
        distance
    };
}



function displayTransitDirectionsInfo(data) {
    const infoElement = document.getElementById("transitDirectionsInfo");
    if (!infoElement) return;

    const leg = data.routes[0].legs[0];
    let html = `
        <h3>Journey Details</h3>
        <p><strong>Total Distance:</strong> ${leg.distance.text}</p>
        <p><strong>Estimated Time:</strong> ${leg.duration.text}</p>
        <h4>Steps:</h4>
        <ol>
    `;

    leg.steps.forEach(step => {
        html += `<li>${step.instructions} (${step.distance.text})</li>`;
    });

    html += '</ol>';
    infoElement.innerHTML = html;
}


function showError(message, elementId) {
    const errorMessageElement = document.getElementById(elementId);
    if (errorMessageElement) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = "block";
    } else {
        console.error(`Error element with id "${elementId}" not found.`);
    }
}

function loadGoogleMapsAPI() {
    fetch(`${API_BASE_URL}api/transportation/google-maps-script`)
        .then(response => response.text())
        .then(scriptUrl => {
            const script = document.createElement('script');
            script.src = scriptUrl;
            script.async = true;
            script.defer = true;
            script.onload = initMaps; // Add this line
            document.head.appendChild(script);
        })
        .catch(error => {
            console.error('Error loading Google Maps API URL:', error);
        });
}

// Event listeners and initialization
document.addEventListener('DOMContentLoaded', () => {
    loadGoogleMapsAPI();
});