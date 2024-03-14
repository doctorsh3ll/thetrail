var watchId;
var isGeolocationActive = false;
var userMarker = document.getElementById('user-location');
var endMarker;
var alternativeMarker;
var startMarker;
var errorMessage = document.getElementById('error-message');

var watchId;
var startPosition;
var totalDistance = 0;
var totalElevationGain = 0;
var isTracking = false;
var distanceMarginOfError = 0.05; // 50 metros

async function calculateElevationGain(location1, location2) {
    // Obter elevação nas duas coordenadas
    const elev1 = await getElevation(location1);
    const elev2 = await getElevation(location2);

    // Calcular ganho de elevação
    const elevationGain = Math.max(0, elev2 - elev1); // Ignorar elevações negativas (descida)

    // Atualizar o ganho total de elevação
    totalElevationGain += elevationGain;

    // Atualizar as informações na página
    document.getElementById('elevation-gain').textContent = totalElevationGain.toFixed(0) + (' m');

    // Retornar o ganho de elevação
    return elevationGain;
}

async function getElevation(location) {
    // Utilizar a Query Terrain Elevation da Mapbox para obter a elevação
    const response = await fetch(`https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${location.lng},${location.lat}.json?layers=contour&limit=1&access_token=pk.eyJ1IjoibWFjaGphbyIsImEiOiJjbHI5cjBmNDUwNjJlMmpzcno3MHVoeTJ3In0.N9_idq-8oGg1Ay6SPqXPkw`);
    const data = await response.json();
    
    // Extrair a elevação da resposta
    const elevation = data.features[0].properties.ele;

    return elevation;
}

async function updateLocation(position) {
    const newLocation = { lat: position.coords.latitude, lng: position.coords.longitude };

    if (window.lastLocation) {
        await calculateElevationGain(window.lastLocation, newLocation);
    }

    // Atualizar a última localização conhecida
    window.lastLocation = newLocation;
}

function locationError(error) {
    console.log(`Erro ao obter a localização do usuário: ${error.message}`);
}

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(updateLocation, locationError);
} else {
    console.log("Geolocalização não suportada pelo navegador.");
}

function loadRoute() {
    var startCoord = [-48.654181, -28.238339];
    var endCoord = [-48.653451, -28.239026];
    var alternativePoint = [-48.646808, -28.233613];

    var url = 'https://api.mapbox.com/directions/v5/mapbox/walking/' +
        startCoord[0] + ',' + startCoord[1] + ';' +
        alternativePoint[0] + ',' + alternativePoint[1] + ';' +
        endCoord[0] + ',' + endCoord[1] +
        '?geometries=geojson&overview=full&alternatives=true&access_token=' + mapboxgl.accessToken;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Remover camada de rota existente, se houver
            if (map.getSource('route')) {
                map.removeLayer('route');
                map.removeSource('route');
            }

            // Adicionar camada de rota ao mapa
            map.addSource('route', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: data.routes[0].geometry
                }
            });

            map.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#f0f0f0', // Cor da linha da rota
                    'line-width': 6, // Largura da linha da rota
                    'line-opacity': 1
                }
            });

            // Add end marker
            endMarker = new mapboxgl.Marker({ element: createMarkerElement('end-marker') })
            .setLngLat(endCoord)
            .addTo(map);

            startMarker = new mapboxgl.Marker({ element: createMarkerElement('start-marker') })
            .setLngLat(startCoord)
            .addTo(map);

            // Add alternative marker
            alternativeMarker = new mapboxgl.Marker({ element: createMarkerElement('alternative-marker') })
            .setLngLat(alternativePoint)
            .addTo(map);
        })
        .catch(error => console.error('Erro:', error));

    function createMarkerElement(className) {
        var element = document.createElement('div');
        element.className = className;
        return element;
    }
}

document.getElementById('footer-start-btn').addEventListener('click', function() {
    if (!isTracking) {
        startPosition = null;
        isTracking = true;

        watchId = navigator.geolocation.watchPosition(
            function (position) {
                var userLocation = [position.coords.longitude, position.coords.latitude];

                if (!startPosition) {
                    startPosition = userLocation;
                }

                var distance = calculateDistance(startPosition[1], startPosition[0], userLocation[1], userLocation[0]);

                totalDistance += distance;

                document.getElementById('distance').innerText = totalDistance.toFixed(2) + ' km';

                startPosition = userLocation;

                // Clear existing user marker if it exists
                if (userMarker) {
                    userMarker.remove();
                }

                // Add the user marker
                userMarker = new mapboxgl.Marker(document.createElement('div'))
                .setLngLat(userLocation)
                .addTo(map);
                userMarker.getElement().className = 'user-marker';

                // Check if the user is inside the bounds
                if (!isInsideBounds(userLocation)) {
                    errorMessage.style.display = 'block';
                    isGeolocationActive = false;
                    return;
                }

                // Hide the error message if the user is inside the bounds
                errorMessage.style.display = 'none';

                // Update the user location marker
                marker.setLngLat(userLocation);

                // Set the map to center on the user location
                map.setCenter(userLocation);

                isGeolocationActive = true;
            },
            function (error) {
                console.error('Geolocation error:', error.message);
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
        );
    } else {
        navigator.geolocation.clearWatch(watchId);
        isTracking = false;
    }
});

function calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula to calculate distance between two points on Earth
    var R = 6371; // Earth's radius in km
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

window.onload = function () {
    // Automatically activate geolocation
    watchId = navigator.geolocation.watchPosition(
        function (position) {
            var userLocation = [position.coords.longitude, position.coords.latitude];

            // Clear existing user marker if it exists
            if (userMarker) {
                userMarker.remove();
            }

            // Add the user marker
            userMarker = new mapboxgl.Marker(document.createElement('div'))
                .setLngLat(userLocation)
                .addTo(map);
            userMarker.getElement().className = 'user-marker';

            // Check if the user is inside the bounds
            if (!isInsideBounds(userLocation)) {
                errorMessage.style.display = 'block';
                isGeolocationActive = false;
                return;
            }

            // Hide the error message if the user is inside the bounds
            errorMessage.style.display = 'none';

            // Update the user location marker
            marker.setLngLat(userLocation);

            // Set the map to center on the user location
            map.setCenter(userLocation);

            isGeolocationActive = true;

            loadRoute();
        },
        function (error) {
            console.error('Geolocation error on page load:', error.message);
        }
    );
};

// Function to check if the coordinates are inside the bounds
function isInsideBounds(coordinates) {
    var bounds = [
        [-48.659, -28.245], // Upper left corner
        [-48.639, -28.226]  // Lower right corner
    ];

    return (
        coordinates[0] >= bounds[0][0] &&
        coordinates[0] <= bounds[1][0] &&
        coordinates[1] >= bounds[0][1] &&
        coordinates[1] <= bounds[1][1]
    );
}

mapboxgl.accessToken = 'pk.eyJ1IjoibWFjaGphbyIsImEiOiJjbHI5cjBmNDUwNjJlMmpzcno3MHVoeTJ3In0.N9_idq-8oGg1Ay6SPqXPkw';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/machjao/clsbs0jr302rv01p15f5r3idq',
    center: [-48.654181, -28.238339],
    zoom: 14.5,
    minZoom: 13.5
});

map.addControl(new mapboxgl.NavigationControl());

// Set the desired pitch angle in degrees
var pitch = 0; // 45 degrees is a common angle for pitch

// Set the new pitch angle of the map
map.setPitch(pitch);

// Set the initial rotation angle
var startBearing = 0;

// Set the final rotation angle (360 degrees)
var endBearing = 360;

// Set the animation duration in milliseconds
var animationDuration = 3000; // 3 seconds

// Store the start time of the animation
var startTime = null;

// Ease-out interpolation function
function easeOut(t) {
    return t * (2 - t);
}

// Function to animate the map rotation
function rotateMap(timestamp) {
    // If startTime is not set, set it to the current time
    if (!startTime) {
        startTime = timestamp;
    }

    // Calculate the animation progress
    var progress = timestamp - startTime;

    // Calculate the interpolation of the progress using ease-out
    var interpolation = easeOut(Math.min(1, progress / animationDuration));

    // Calculate the rotation angle based on interpolation
    var bearing = startBearing + (endBearing - startBearing) * interpolation;

    // Set the new map rotation angle
    map.setBearing(bearing);

    // Continue the animation if it's not yet complete
    if (progress < animationDuration) {
        requestAnimationFrame(rotateMap);
    }
}

// Start the map rotation animation
requestAnimationFrame(rotateMap);

var bounds = [
    [-48.659, -28.245], // Upper left corner
    [-48.639, -28.226]  // Lower right corner
];

// Add bounds to the map move event
map.on('move', function () {
    var lngLat = map.getCenter();

    // Check if coordinates exceed bounds
    var newLng = Math.min(Math.max(lngLat.lng, bounds[0][0]), bounds[1][0]);
    var newLat = Math.min(Math.max(lngLat.lat, bounds[0][1]), bounds[1][1]);

    // Update map center within bounds
    if (lngLat.lng !== newLng || lngLat.lat !== newLat) {
        map.setCenter([newLng, newLat]);
    }
});

var checksRemaining = 3; // Number of remaining checks when entering the site

function checkAndReloadRoute() {
    if (!map.getLayer('route')) {
        // Route layer is not present, reload
        console.log('Route layer is not present, reloading...');
        loadRoute();
        checksRemaining--;

        if (checksRemaining === 0) {
            // Stop checking after two checks
            clearInterval(checkInterval);
        }
    }
}

// Check on site entry and repeat every 5 seconds
checkAndReloadRoute(); // Check immediately on site entry
var checkInterval = setInterval(checkAndReloadRoute, 5000);

