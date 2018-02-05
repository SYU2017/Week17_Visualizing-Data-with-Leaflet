// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Tectonic plates link
var TectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {       

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJson(earthquakeData, {
    onEachFeature: function (feature, layer){
      layer.bindPopup("<h3>" + feature.properties.place + "<br> Magnitude: " + feature.properties.mag +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>")


    },
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.properties.mag),
          fillOpacity: .7,
          stroke: true,
          color: "black",
          weight: .5
      })
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes)
}

function createMap(earthquakes) {

  var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?"+
    "access_token=pk.eyJ1Ijoic3l1MjAxOCIsImEiOiJjamNzYmFjbmEwYWJqMzNxcWJ6dnhoaGlxIn0."+"qFH3N3Fi6rXHsoGsi8BtjA");


  // Define streetmap and darkmap layers
  var outdoorMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?"+
    "access_token=pk.eyJ1Ijoic3l1MjAxOCIsImEiOiJjamNzYmFjbmEwYWJqMzNxcWJ6dnhoaGlxIn0."+"qFH3N3Fi6rXHsoGsi8BtjA"); 
   

  var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?"+
    "access_token=pk.eyJ1Ijoic3l1MjAxOCIsImEiOiJjamNzYmFjbmEwYWJqMzNxcWJ6dnhoaGlxIn0."+"qFH3N3Fi6rXHsoGsi8BtjA");

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite Map": satelliteMap,
    "Outdoor Map": outdoorMap,
    "Light Map": lightMap
  };
  // Add a tectonic plate layer
  var tectonicPlates = new L.LayerGroup();

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic Plates": tectonicPlates
  };
  
  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71],
    zoom: 5,
    layers: [lightMap, earthquakes, tectonicPlates]
  });

  // Add Fault lines data
   d3.json(TectonicPlatesUrl, function(plateData) {
     // Adding our geoJSON data, along with style information, to the tectonicplates layer.
     L.geoJson(plateData, {
       color: "green",
       weight: 2
     })
     .addTo(tectonicPlates);
   });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


// Create legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
              grades = [0, 1, 2, 3, 4, 5],
              labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(myMap);
}

function getColor(d) {
  return d > 5 ? 'FF3300' :
    d > 4  ? 'FF6600' :
    d > 3  ? 'FF9900' :
    d > 2  ? 'FFCC00' :
    d > 1   ? 'FFFF00' :
            'FFFF99';
}

function getRadius(value){
  return value*40000
}