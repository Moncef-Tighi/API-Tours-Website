const mapLocation = document.querySelector("#map");
const locations = JSON.parse(mapLocation.dataset.locations);

mapboxgl.accessToken = 'pk.eyJ1Ijoib3NlZiIsImEiOiJja3hva3M4b2QwNHRuMnBwNDJ4MjAxcjNrIn0.JeQgTDQEbgMMTdJmuPqopg';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/osef/ckxol470r49f914o53iekbbwg', // style URL
    center: locations[0].coordinates,  // starting position [lng, lat]
    zoom: 11, // starting zoom
    scrollZoom : false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(location=> {
    let element= document.createElement("div");
    element.className= 'marker';
    new mapboxgl.Marker({
        element : element,
        anchor : "bottom"
    }).setLngLat(location.coordinates).addTo(map);

    new mapboxgl.Popup({
        offset : 40
    })
        .setLngLat(location.coordinates)
        .setHTML(`<p>${location.day} : ${location.description}</p>`)
        .addTo(map);


    //élargit les limites de la map pour inclure tout les éléments
    bounds.extend(location.coordinates);
})

map.fitBounds(bounds,{
    padding : {
        top : 200,
        bottom : 150,
        left : 100,
        right : 100
    }
});