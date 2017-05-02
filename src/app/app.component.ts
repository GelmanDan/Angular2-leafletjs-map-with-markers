import {Component, OnInit} from '@angular/core';
import { HttpService} from './http.services';
import { LocationPoint } from './local';
import {FormGroup, FormControl, FormBuilder, Validators, AbstractControl} from '@angular/forms';
// import {Control} from '@angular2/common';

import { ValidatorFormService } from './validator.services';
import {Map, control, tileLayer} from 'leaflet';
import map = L.map;
import Icon = L.Icon;
import Control = L.Control;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [HttpService, ValidatorFormService]
})
export class AppComponent implements OnInit {
  namePoint: string;
  width: number;
  length: number;
  locations: Array<Object>;
  locationObj: LocationPoint;
  mapElement: Map;
  icoOne: Icon;
  icoTwo: Icon;
  marks: any;
  jsonLength: number;
  myForm: FormGroup;
  isFormedOpen: boolean = true;
  indexOfMarkerSelected: number = -1;

  constructor(private httpService: HttpService, private _fb: FormBuilder, private validatorForm: ValidatorFormService) {
    this.namePoint = '';
    this.width = 0;
    this.length = 0;
    this.locations = [];
    this.marks = [];
    this.jsonLength = 0;
    }

  public ngOnInit(): void {
    console.log('ok');
    this.httpService.getLocation()
      .subscribe(result => {this.locations = result.json(); this.AddJsonMarkers(); });
    this.jsonLength = this.locations.length;


    this.initMap();
    this.formHide();

    this.myForm = this._fb.group({
      namePoint: ['', [Validators.required, Validators.minLength(5)]],
      width: ['', [Validators.required, this.validatorForm.maxWidthValidator]],
      length: ['', [Validators.required, this.validatorForm.maxLengthValidator]]
    });


  }
  initMap() {
    this.mapElement = map('map', { zoomControl: false })
      .setView([51.505, -0.09], 13);
    tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png')
      .addTo(this.mapElement);
    const zoom = control.zoom({ position: 'topright' });
    zoom.addTo(this.mapElement);
    const scale = control.scale({ position: 'bottomright' });
    scale.addTo(this.mapElement);
    this.icoOne = L.icon( { iconUrl: 'assets/marker-orange.png', iconAnchor: [11, 40], popupAnchor: [-3, -76]}  );
    this.icoTwo = L.icon( { iconUrl: 'assets/marker-red.png', iconAnchor: [11, 40], popupAnchor: [-3, -76]} );
  }

  AddJsonMarkers() {
    for ( let i = 0; i < this.locations.length; i ++) {
      const mark = L.marker([this.locations[i]['length'], this.locations[i]['width']], {icon: this.icoTwo})
        .addTo(this.mapElement)
        .on('click', (e) => {
          this.onClickedMarker(e);
        });
      this.marks.push(mark);
    }
  }

  onClickedList(event, i ) {
    if ((i !== this.indexOfMarkerSelected) && (this.locations[this.indexOfMarkerSelected]['selected'] == false)) {
      this.locations[this.indexOfMarkerSelected]['selected'] = !this.locations[this.indexOfMarkerSelected]['selected'];
      this.marks[this.indexOfMarkerSelected].setIcon(this.icoTwo);
    }
    this.indexOfMarkerSelected = i;
    if (event.selected) {
      event.selected = !event.selected;
      this.marks[i].setIcon(this.icoOne);
    } else {
      event.selected = !event.selected;
      this.marks[i].setIcon(this.icoTwo);
    }
  }
  onClickedMarker(e) {
    let index = -1;
    for (let i = 0; i < this.locations.length; i++) {
      if ((this.locations[i]['width'] == e.latlng.lng) && (this.locations[i]['length'] == e.latlng.lat)) {
        index = i;
      }
    }
    if ((this.indexOfMarkerSelected !== -1) &&
      (index !== this.indexOfMarkerSelected) && (this.locations[this.indexOfMarkerSelected]['selected'] !== true)) {
        this.onClickedMarkerChangeIcon(this.locations[this.indexOfMarkerSelected], this.indexOfMarkerSelected);
    }
    this.indexOfMarkerSelected = index;
    if (index !== -1) {
      this.onClickedMarkerChangeIcon(this.locations[index], index);
    } else {
      console.log('error index = -1');
    }
  }
  onClickedMarkerChangeIcon(event, i) {
    if (event.selected) {
      event.selected = !event.selected;
      this.marks[i].setIcon(this.icoOne);
    } else {
      event.selected = !event.selected;
      this.marks[i].setIcon(this.icoTwo);
    }
  }

  formHide() {
    this.isFormedOpen = !this.isFormedOpen;
    // const elementForm = document.getElementById('form');
    // const elementButton = document.getElementById('button-form');
    // elementButton.textContent = (elementButton.textContent === 'Open') ? 'Close' : 'Open';
    // elementForm.style.display = (elementForm.style.display === 'none') ? 'block' : 'none';
  }

  addLocation(event): void {
    this.locationObj = {
        namePoint: event.namePoint,
        width: event.width,
        length: event.length,
        selected: false
      };
    console.log(this.locationObj);
      const lon = <number>this.locationObj.length;
      const lat = <number>this.locationObj.width;

      const markerLocation = new L.LatLng(lon, lat);
      const mark = L.marker(markerLocation, {icon: this.icoTwo})
        .addTo(this.mapElement)
        .on('click', (e) => {
          this.onClickedMarker(e);
        });
      this.marks.push(mark);
      this.mapElement.setView(markerLocation, 35);
      this.locations.push(this.locationObj);
      event.namePoint = '';
      event.width = 0;
      event.length = 0;
      console.log(this.locations);
  }

  deleteLocation(index) {
      console.log(index, this.marks, this.locations);
      if (confirm('are you sure?') === true ) {
        this.mapElement.removeLayer(this.marks[index]);
        this.marks.splice(index, 1);
        this.locations.splice(index, 1);
      }
    }
}
