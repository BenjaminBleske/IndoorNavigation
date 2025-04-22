# IndoorNavigation

Dieses Projekt visualisiert einen Raumplan mittels [Leaflet](https://leafletjs.com/), einem Open-Source-JavaScript-Framework zur Darstellung interaktiver Karten.

🗺️ Die Anwendung zeigt:
- Eine Grundkarte mit WMS- und Bild-Overlay
- GeoJSON-Features mit Raumdaten
- Eine interaktive Raumliste mit Suchfunktion
- Responsive Ansicht für mobile Geräte

📍 **Live-Demo:**  
➡️ [https://benjaminbleske.github.io/IndoorNavigation/](https://benjaminbleske.github.io/IndoorNavigation/)

## 📁 Projektstruktur

```bash
IndoorNavigation/
├── index.html              # Hauptseite
├── styles/
│   └── style.css           # CSS für Design und Layout
├── scripts/
│   └── index.js            # JavaScript für Leaflet & Funktionen
└── ressource/
    ├── etage1.png          # Bild-Overlay der Etage
    └── modellierung.geojson # GeoJSON mit Rauminformationen
