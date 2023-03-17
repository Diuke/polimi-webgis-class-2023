var BING_MAPS_KEY = "AqbDxABFot3cmpxfshRqLmg8UTuPv_bg69Ej3d5AkGmjaJy_w5eFSSbOzoHeN2_H";

let osm = new ol.layer.Tile({
    title: 'OpenStreetMap',
    type: 'base',
    visible: true,
    source: new ol.source.OSM()
});

var bingRoads = new ol.layer.Tile({
    title: 'Bing Maps—Roads',
    type: 'base',
    visible: false,
    source: new ol.source.BingMaps({
        key: BING_MAPS_KEY,
        imagerySet: 'Road'
    })
});

var bingAerial = new ol.layer.Tile({
    title: 'Bing Maps—Aerial',
    type: 'base',
    visible: false,
    source: new ol.source.BingMaps({
        key: BING_MAPS_KEY,
        imagerySet: 'Aerial'
    })
});

var stamenWatercolor = new ol.layer.Tile({
    title: 'Stamen Watercolor',
    type: 'base',
    visible: false,
    source: new ol.source.Stamen({
        layer: 'watercolor'
    })
});

var stamenToner = new ol.layer.Tile({
    title: 'Stamen Toner',
    type: 'base',
    visible: false,
    source: new ol.source.Stamen({
        layer: 'toner'
    })
});

let corineLandCover = new ol.layer.Image({
    title: 'CORINE land cover',
    source: new ol.source.ImageWMS({
        url: 'https://image.discomap.eea.europa.eu/arcgis/services/Corine/CLC2018_WM/MapServer/WMSServer',
        params: { 'LAYERS': '12' }
    })
});

let colombiaBoundary = new ol.layer.Image({
    title: 'Colombia adm0',
    source: new ol.source.ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_adm0', 'STYLES': 'restricted' }
    })
});
var colombiaDepartments = new ol.layer.Image({
    title: 'Colombia adm1',
    source: new ol.source.ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_adm1' }
    }),
    opacity: 0.5
});

var colombiaRoads = new ol.layer.Image({
    title: 'Colombia Roads',
    source: new ol.source.ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_roads' }
    }),
    visible: false
});
var colombiaRivers = new ol.layer.Image({
    title: 'Colombia Rivers',
    source: new ol.source.ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_water_lines' }
    }),
    minResolution: 1000,
    maxResolution: 5000
});
let map = new ol.Map({
    target: document.getElementById('map'),
    layers: [
        new ol.layer.Group({
            title: 'Base Maps',
            layers: [osm, stamenToner, stamenWatercolor, bingAerial, bingRoads]
        }),
        new ol.layer.Group({
            title: 'Overlay Layers',
            layers: [colombiaBoundary, colombiaDepartments, colombiaRivers, colombiaRoads, corineLandCover]
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([-74, 4.6]),
        zoom: 5
    }),
    controls: ol.control.defaults().extend([
        new ol.control.ScaleLine(),
        new ol.control.FullScreen(),
        new ol.control.OverviewMap(),
        new ol.control.MousePosition({
            coordinateFormat: ol.coordinate.createStringXY(4),
            projection: 'EPSG:4326',
            className: 'custom-control',
            placeholder: '0.0000, 0.0000'
        })
    ])
});

var layerSwitcher = new ol.control.LayerSwitcher({});
map.addControl(layerSwitcher);

let vectorSource = new ol.source.Vector({});
const vectorLayer = new ol.layer.Vector({
    title: "Colombia Water Areas",
    source: vectorSource,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgb(58, 255, 81)',
            width: 4
        })
    })
});
map.addLayer(vectorLayer);

function loadFeatures(response) {
    vectorSource.addFeatures(new ol.format.GeoJSON().readFeatures(response))
}

//var base_url = "https://www.gis-geoserver.polimi.it/geoserver/gis/ows?";
var base_url = "http://localhost:8082/geoserver/Ex_GeoServer/ows?"
var wfs_url = base_url;
wfs_url += "service=WFS&"
wfs_url += "version=1.0.0&"
wfs_url += "request=GetFeature&"
wfs_url += "typeName=Ex_GeoServer%3ACOL_water_areas&"
wfs_url += "outputFormat=text%2Fjavascript&"
wfs_url += "srsname=EPSG:3857&"
wfs_url += "format_options=callback:loadFeatures"

$.ajax({ url: wfs_url, dataType: 'jsonp' });


const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

var popup = new ol.Overlay({
    element: container
});
map.addOverlay(popup);

map.on('singleclick', function (event) {
    var feature = map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
        return feature;
    });
    if (feature != null) {
        var pixel = event.pixel;
        var coord = map.getCoordinateFromPixel(pixel);
        popup.setPosition(coord);
        content.innerHTML =
            '<h5>Colombia Water Areas</h5><br><b>Name: </b>' +
            feature.get('NAME') +
            '</br><b>Description: </b>' +
            feature.get('HYC_DESCRI');
    }
    else {
        if(colombiaRoads.getVisible()){
            var viewResolution = (map.getView().getResolution());
            var url = colombiaRoads.getSource().getFeatureInfoUrl(event.coordinate,
                viewResolution, 'EPSG:3857', { 'INFO_FORMAT': 'text/html' });
            if (url){
                var pixel = event.pixel;
                var coord = map.getCoordinateFromPixel(pixel);
                popup.setPosition(coord);
                $.ajax({ url: url })
                 .done((data) => {
                    console.log(data);
                    content.innerHTML = data;
                 })
                
            }   
        }            
    }
});

closer.onclick = function () {
    popup.setPosition(undefined);
    closer.blur();
    return false;
};

map.on('pointermove', function (event) {
    if (event.dragging) {
        $(elementPopup).popover('dispose');
        return;
    }
    var pixel = map.getEventPixel(event.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);
    map.getTarget().style.cursor = hit ? 'pointer' : '';
});
