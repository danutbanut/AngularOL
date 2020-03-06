import {Component, OnInit} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {HomePage} from '../pages/home/home';

import {Map} from 'ol';
import {OSM} from 'ol/source.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import {fromLonLat} from 'ol/proj';
import {Icon, Style} from 'ol/style';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import {Vector as VectorLayer} from 'ol/layer';

import {Geolocation} from "@ionic-native/geolocation";

@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnInit {
  rootPage: any = HomePage;
  map: Map;
  lat = 0;
  lng = 0;
  iconFeature;
  vectorSource;
  vectorLayer;
  rasterLayer;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private geo: Geolocation) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  ngOnInit() {
    this.initMap();
    this.getCurrentPositionAndAddMarker();
    this.registerPositionListener();
  }

  initMap() {
    this.rasterLayer = new TileLayer({
      source: new OSM()
    });

    this.map = new Map({
      layers: [this.rasterLayer],
      target: document.getElementById('map'),
      view: new View({
        center: [this.lng, this.lat],
        zoom: 3
      })
    });
  }

  getCurrentPositionAndAddMarker() {
    this.geo.getCurrentPosition({
      enableHighAccuracy: true
    }).then(location => {
      this.lat = location.coords.latitude;
      this.lng = location.coords.longitude;
      this.initMarkerLayer();
    });
  }

  initMarkerLayer() {
    this.iconFeature = new Feature({
      geometry: new Point(fromLonLat([this.lng, this.lat])),
      name: 'Null Island',
      population: 4000,
      rainfall: 500
    });

    let iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: '../assets/icon/mapMarker.png'
      })
    });

    this.iconFeature.setStyle(iconStyle);

    this.vectorSource = new VectorSource({
      features: [this.iconFeature]
    });

    this.vectorLayer = new VectorLayer({
      source: this.vectorSource
    });

    this.map.addLayer(this.vectorLayer);
    this.map.getView().setCenter(fromLonLat([this.lng, this.lat]));
    this.map.getView().setZoom(15);
  }

  registerPositionListener() {
    let watch = this.geo.watchPosition();
    watch.subscribe((data) => {
      if (this.lat != data.coords.latitude || this.lng != data.coords.longitude) {
        // set new lat, lng
        this.lat = data.coords.latitude;
        this.lng = data.coords.longitude;

        // set marker at new position and center map
        this.iconFeature.setGeometry(new Point(fromLonLat([this.lng, this.lat])));
        this.map.getView().setCenter(fromLonLat([this.lng, this.lat]));
      }
    });
  }
}

