<script setup lang="ts">
import { onMounted, ref } from 'vue';

import mapboxgl, { type PointLike } from 'mapbox-gl';
import { MadasterControl } from '../controls/madastercontrol';

const mapContainer = ref<HTMLDivElement>();


mapboxgl.accessToken = 'pk.eyJ1IjoibWFkYXN0ZXIiLCJhIjoiY2x2M24wZGhyMGIzdDJrbWZ5NzhoNGpiMCJ9.DSlcAXte8xThtWln1pFrBw';

onMounted(() => {
  if (mapContainer.value === undefined) {
    return;
  }
  
  const map = new mapboxgl.Map({
    container: mapContainer.value, // container ID
    // style: {
    //   version: 8,
    //   sources: {
    //     'osm-raster-tiles': {
    //       type: 'raster',
    //       tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    //       tileSize: 256,
    //       attribution:
    //         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    //     }
    //   },
    //   layers: [
    //     {
    //       id: 'osm-raster-layer',
    //       type: 'raster',
    //       source: 'osm-raster-tiles',
    //       minzoom: 0,
    //       maxzoom: 22
    //     }
    //   ]
    // }, //'mapbox://styles/mapbox/standard', // style URL 
    //style: //'mapbox://styles/mapbox/light-v10', 
    style: 'mapbox://styles/madaster/clvmqh7vi01kb01ocddzk3psz',
    center: [5.351186656179891, 52.029395707987604], // starting position [lng, lat]
    zoom: 16, // starting zoom
    pitch: 45,
    bearing: -45.6,
    antialias: true,
    hash: true,
    maxZoom: 18,
    //maxBounds: [[5.349, 52.028], [5.353, 52.030]],
    customAttribution: '<a href="http://3dbag.bk.tudelft.nl" target="_blank" rel="noopener">3D Geoinformation Group</a>'
  });

  map.on('style.load', () => {
    // Insert the layer beneath any symbol layer.
    const layers = map.getStyle().layers;
    const labelLayerId = layers.find((layer) => layer.type === 'symbol' && layer.layout && layer.layout['text-field'])?.id;

    // The 'building' layer in the Mapbox Streets vector tileset contains building height data from OpenStreetMap.

    map.addSource('doorn', {
      'type': 'vector',
      'url': 'mapbox://madaster.netherlands'
    });

    const layer: mapboxgl.AnyLayer = {
      'id': '3d-buildings',
      'source': 'doorn',
      'source-layer': 'netherlands',
      'type': 'fill-extrusion',
      minzoom: 10,
      maxzoom: 18.1,
      'paint': {
        'fill-extrusion-color': ['case',
          ['==',['feature-state', 'hover'], true], '#000',
          ['==',['feature-state', 'selected'], true], '#3d3d3d',
          '#398684'
        ],
        // Use an 'interpolate' expression to add a smooth transition effect to the buildings as the user zooms in.
        'fill-extrusion-height': ['case',
          ['all',['has','h'],['>',['get', 'h'],2]],
          ['get', 'h'],
          8
        ],
        'fill-extrusion-opacity': 0.7,
      }
    };

    map.addLayer(layer, labelLayerId);

    let selected: mapboxgl.MapboxGeoJSONFeature | null = null;
    map.on('click', (e) => {
      const bbox: [PointLike, PointLike] = [
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

      console.log(feature.properties);

    });

    let hoveredPolygon: mapboxgl.MapboxGeoJSONFeature | null = null;
    map.on('mousemove', '3d-buildings', (e) => {
      if (e.features && e.features.length > 0) {
        if (hoveredPolygon !== null) {
          map.setFeatureState(
            hoveredPolygon,
            { hover: false }
          );
        }
        hoveredPolygon = e.features[0];
        map.setFeatureState(
          hoveredPolygon,
          { hover: true }
        );
      }
    });

    // When the mouse leaves the state-fill layer, update the feature state of the
    // previously hovered feature.
    map.on('mouseleave', '3d-buildings', () => {
      if (hoveredPolygon !== null) {
        map.setFeatureState(
          hoveredPolygon,
          { hover: false }
        );
      }
      hoveredPolygon = null;
    });

    map.addControl(new mapboxgl.NavigationControl({
      visualizePitch: true
    }));

    const m = new MadasterControl();
    map.addControl(m, 'top-right');

    m.on('blabla', () => {
      alert('blabla');
    });
  });

});

</script>

<template>
  <div
    ref="mapContainer"
    style="height: calc(100vh - var(--v-layout-top))"
  />
</template>
