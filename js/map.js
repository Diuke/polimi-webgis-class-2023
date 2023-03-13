/**
 * This file is the main map script. The contents of this script gets executed sequentially
 * when it is imported.
 */

//The OSM layer. This is a tile layer direclty implemented in OpenLayers.
let osm = new ol.layer.Tile({
    visible: true,
    source: new ol.source.OSM()
});

//The Colombia Departments layer definition. This is a WMS layer
var colombiaDepartments = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_adm1' }
    }),
    opacity: 0.5 //Transparency at 50%
});

//The Colombian roads layer definition. This is a WMS layer.
var colombiaRoads = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_roads' }
    }),
    visible: false //This layer will not be initially visible, but still will be added to the map!
});

//The Colombian rivers layer definition. This is a WMS layer.
var colombiaRivers = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_water_lines' }
    }),
    //Here we assign a conditional rendering resolution for this layer.
    minResolution: 1000, 
    maxResolution: 5000
});

//The main map object.
const initialZoom = 5;
const initialCoordinates = [-74, 4.6];
let map = new ol.Map({
    target: document.getElementById('map'),
    layers: [osm, colombiaDepartments, colombiaRivers, colombiaRoads],
    view: new ol.View({
        center: ol.proj.fromLonLat(initialCoordinates), //We have to convert from EPSG:4326 to EPSG:3857 because openlayers uses it by default!
        zoom: initialZoom
    })
});
