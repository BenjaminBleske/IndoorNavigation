var initialZoom = 19;
var mobileZoom = 17;

if (window.innerWidth <= 768) {
  initialZoom = mobileZoom;
}

var map = L.map('map', {
  crs: L.CRS.EPSG4326,
  center: [51.27258167, 7.19965406],
  zoom: initialZoom,
  maxZoom: 30,
  zoomSnap: 0.5,
  zoomDelta: 0.5
});

var wmsLayer = L.tileLayer.wms('https://www.wms.nrw.de/geobasis/wms_nw_dop', {
  layers: 'nw_dop_rgb',
  format: 'image/png',
  transparent: true,
  version: '1.3.0',
  attribution: '© GeoBasis NRW',
  maxZoom: 30
}).addTo(map);

var imageUrl = 'ressource/etage1.png';
var imageBounds = [
  [51.271801659, 7.19857002],
  [51.273361682, 7.200739103]
];
L.imageOverlay(imageUrl, imageBounds, { opacity: 1 }).addTo(map);

var geojsonLayer;
var featureList = document.getElementById('feature-list');
var searchBox = document.getElementById('search-box');
var currentHighlightedLayer = null;

fetch('ressource/modellierung.geojson')
  .then(response => response.json())
  .then(data => {
    geojsonLayer = L.geoJSON(data, {
      onEachFeature: function (feature, layer) {
        layer.on('click', function (e) {
          highlightFeature(layer);
          var props = e.target.feature.properties;
          var popupContent = `<div><strong>${props.Name || 'Unbenannter Raum'}</strong><br>
                              Raumnummer: ${props.Raumnummer || 'Nicht verfügbar'}<br>
                              Telefonnr: ${props.Telefonnr || 'Nicht verfügbar'}</div>`;
          e.target.bindPopup(popupContent).openPopup();
          wmsLayer.setParams({ dummy: new Date().getTime() });
        });
      },
      style: {
        color: 'blue',
        weight: 2,
        opacity: 0.0,
        fillOpacity: 0.0
      }
    }).addTo(map);

    data.features.forEach(function (feature) {
      var li = document.createElement('li');
      li.className = 'feature-item';

      var detailsDiv = document.createElement('div');
      detailsDiv.className = 'feature-details';

      var nameDiv = document.createElement('div');
      nameDiv.className = 'feature-name';
      nameDiv.textContent = feature.properties.Name || 'Unbenannter Raum';

      var roomDiv = document.createElement('div');
      roomDiv.className = 'feature-room';
      roomDiv.textContent = 'Raumnummer: ' + (feature.properties.Raumnummer || 'Nicht verfügbar');

      detailsDiv.appendChild(nameDiv);
      detailsDiv.appendChild(roomDiv);
      li.appendChild(detailsDiv);

      li.onclick = function () {
        geojsonLayer.eachLayer(function (layer) {
          if (layer.feature === feature) {
            var center = layer.getBounds().getCenter();
            var boundsZoom = map.getBoundsZoom(layer.getBounds());
            var desiredZoom = Math.max(boundsZoom - 3, map.getMinZoom());
            map.setView(center, desiredZoom);
            highlightFeature(layer);
          } else {
            layer.setStyle({ opacity: 0.0, fillOpacity: 0.0 });
          }
        });

        if (window.innerWidth <= 768) {
          featureListContainer.classList.remove('open');
          toggleButton.innerHTML = listIcon;
        }
      };

      featureList.appendChild(li);
    });

    searchBox.addEventListener('input', function () {
      var filter = searchBox.value.toLowerCase();
      var items = featureList.getElementsByTagName('li');
      Array.from(items).forEach(function (item) {
        var name = item.querySelector('.feature-name').textContent.toLowerCase();
        var room = item.querySelector('.feature-room').textContent.toLowerCase();
        item.style.display = name.includes(filter) || room.includes(filter) ? '' : 'none';
      });
    });
  })
  .catch(error => {
    console.error('Fehler beim Laden des GeoJSON:', error);
  });

function highlightFeature(layer) {
  if (currentHighlightedLayer && currentHighlightedLayer !== layer) {
    currentHighlightedLayer.setStyle({ opacity: 0.0, fillOpacity: 0.0 });
    removeHighlight(currentHighlightedLayer);
  }

  currentHighlightedLayer = layer;
  layer.setStyle({ color: 'red', weight: 3, opacity: 1, fillOpacity: 0.2 });

  if (layer._path) {
    layer._path.classList.add('highlighted');
  }

  setTimeout(() => {
    layer.setStyle({ color: 'red', weight: 3, opacity: 1, fillOpacity: 0.2 });
    removeHighlight(layer);
  }, 2000);
}

function removeHighlight(layer) {
  if (layer._path) {
    layer._path.classList.remove('highlighted');
  }
}

var toggleButton = document.getElementById('toggle-feature-list');
var featureListContainer = document.querySelector('.feature-list');

const listIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M2 12.5A.5.5 0 0 1 2.5 12h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zM2 8.5A.5.5 0 0 1 2.5 8h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zM2 4.5A.5.5 0 0 1 2.5 4h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
  </svg>
  Räume anzeigen`;

const closeIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
  </svg>
  Räume schließen`;

toggleButton.addEventListener('click', function () {
  featureListContainer.classList.toggle('open');
  toggleButton.innerHTML = featureListContainer.classList.contains('open') ? closeIcon : listIcon;
});

map.on('click', function () {
  if (window.innerWidth <= 768 && featureListContainer.classList.contains('open')) {
    featureListContainer.classList.remove('open');
    toggleButton.innerHTML = listIcon;
  }
});
