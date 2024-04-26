<script setup lang="ts">
import { onMounted, onUnmounted, ref, type Ref } from 'vue';

import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoibWFkYXN0ZXIiLCJhIjoiY2x2M24wZGhyMGIzdDJrbWZ5NzhoNGpiMCJ9.DSlcAXte8xThtWln1pFrBw';

onMounted(() => {
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v11', // style URL
    center: [5.351186656179891, 52.029395707987604], // starting position [lng, lat]
    zoom: 19, // starting zoom
    pitch: 45,
    bearing: -45.6,
    antialias: true,
    hash: true,
	  attributionControl: false
  });

  const att = new mapboxgl.AttributionControl();

  att._updateAttributions = function() {
    this._container.innerHTML='&copy; <a href="http://3dbag.bk.tudelft.nl" target="_blank" rel="noopener">3D Geoinformation Group</a> | <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors | <a href="http://www.mapbox.com" target="_blank" rel="noopener">Mapbox</a>';
  };
  map.addControl(att);

  map.on('style.load', () => {
    // Insert the layer beneath any symbol layer.
    const layers = map.getStyle().layers;
    const labelLayerId = layers.find((layer) => layer.type === 'symbol' && layer.layout['text-field'])?.id;

    // The 'building' layer in the Mapbox Streets vector tileset contains building height data from OpenStreetMap.

    const layer: mapboxgl.AnyLayer = {
      'id': '3d-buildings',
      'source': 'composite',
      'source-layer': 'building',
      'filter': ['==', 'extrude', 'true'],
      'type': 'fill-extrusion',
      'minzoom': 12,
      'paint': {
        'fill-extrusion-color': '#398684',
        'fill-extrusion-color': ['case',
          ['==',['feature-state', 'hover'], true], '#000',
          ['==',['feature-state', 'selected'], true], '#3d3d3d',
          '#398684'
        ],
        // Use an 'interpolate' expression to add a smooth transition effect to the buildings as the user zooms in.
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'height']
        ],
        'fill-extrusion-base': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'min_height']
        ],
        'fill-extrusion-opacity': 0.7
      }
    };

    map.addLayer(layer, labelLayerId);

    let selected: mapboxgl.MapboxGeoJSONFeature | null = null;
    map.on('click', (e) => {
      const bbox = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5]
      ];
      const features = map.queryRenderedFeatures(bbox, { layers: ['3d-buildings'] });

      if (selected !== null) {
        map.setFeatureState(selected, {
          'selected': false
        });
        selected = null;
      }

      const feature = features[0];
      map.setFeatureState(feature, {
        'selected': true
      });
      selected = feature;

    });

    let hovered: mapboxgl.MapboxGeoJSONFeature[] = [];
    map.on('mousemove', (e) => {
      // Set `bbox` as 5px reactangle area around clicked point.
      const bbox = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5]
      ];
      const features = map.queryRenderedFeatures(bbox, { layers: ['3d-buildings'] });
      map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

      for (const feature of hovered) {
        map.setFeatureState(feature, {
          'hover': false
        });
      }

      const seen = {};
      hovered = features;
      let i = 0;
      for (const feature of hovered) {
        if (seen[feature.id]) continue;

        seen[feature.id] = true;
        map.setFeatureState(feature, {
          'hover': i === 0 ? true : false
        });
        i++;
      }
    });
  });

  // const hovered = [];
  // window.addEventListener('mousemove', function(e) {
  //   e.point = new mapboxgl.Point(e.clientX, e.clientY);
  //   const features = map.queryRenderedFeatures(e.point, { layers: ['3d-buildings'] });

    
  // });
  // for (const feature of hovered) {
  //   map.setFeatureState(feature, {
  //     'hover': false
  //   });
  // }

  // const seen = {};
  // hovered = features;
  // if(hovered.length==0){
  //   popup_control.popup_extrusion_event(e);
  // }
  // let i = 0;
  // for (const feature of hovered) {
  //     if (seen[feature.id]) continue;

  //     seen[feature.id] = true;
  //     map.setFeatureState(feature, {
  //         'hover': i === 0 ? true : false
  //     });
  //   if(i===0){

  //     popup_control.popup_extrusion_event(e,feature);
  //   }
	  //           i++;
	  //       }
	  //   });

});

</script>

<template>
  <v-app>
    <v-app-bar title="Vue, Typescript and MapBox" />

    <v-main>
      <div
        id="map"
        style="height: 100vh;"
      />
    </v-main>
  </v-app>
</template>
