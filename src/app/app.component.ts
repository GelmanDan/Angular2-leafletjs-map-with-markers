import {Component, OnInit} from '@angular/core';
import { HttpService} from './http.services';
import { LocationPoint } from './local';
import {FormGroup, FormControl, FormBuilder, Validators, AbstractControl} from '@angular/forms';
//import {Control} from '@angular2/common';

import {Map, control, tileLayer} from 'leaflet';
import map = L.map;
import Icon = L.Icon;
import Control = L.Control;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [HttpService]
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

  constructor(private httpService: HttpService, private _fb: FormBuilder) {
    this.namePoint = '';
    this.width = 0;
    this.length = 0;
    this.locations = [];
    this.marks = [];
    this.jsonLength = 0;
    }

  public ngOnInit(): void {

    this.httpService.getLocation()
      .subscribe(result => {this.locations = result.json(); this.AddJsonMarkers(); });
    this.jsonLength = this.locations.length;


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

    this.myForm = this._fb.group({
      namePoint: ['', [<any>Validators.required, <any>Validators.minLength(5)]],
      width: ['', [<any>Validators.required, <any>this.maxWidthValidator]],
      length: ['', [<any>Validators.required, <any>this.maxLengthValidator]]
    });

    this.formHide();
  }

  maxWidthValidator(control: AbstractControl ) {
      const num = + control.value;
      if ((num < -90) || (num > 90)) {
        return {
          minValue: {valid: false}
        };
      }
      return null;
    }

  maxLengthValidator(control: AbstractControl ) {

    const num = + control.value;
    if ((num < -180) || (num > 180)) {
      return {
        minValue: {valid: false}
      };
    }
    return null;
  }

  AddJsonMarkers() {
    for ( let i = 0; i < this.locations.length; i ++) {
      const mark = L.marker([this.locations[i]['length'], this.locations[i]['width']], {icon: this.icoTwo})
        .addTo(this.mapElement)
        .on('click', (e) => {
          this.onClicked(e);
        });
      this.marks.push(mark);
    }
  }

  clicked(event, i ) {
    console.log(event.selected);
    debugger
    if (event.selected === true) {
      event.selected = false;
      this.marks[i].setIcon(this.icoTwo);
    } else {
      event.selected = true;
      this.marks[i].setIcon(this.icoOne);
    }
  }

  onClicked(e) {
    let index = -1;
    for (let i = 0; i < this.locations.length; i++) {
      if ((this.locations[i]['width'] == e.latlng.lng) && (this.locations[i]['length'] == e.latlng.lat)) {
        index = i;
        console.log(index);
      }
    }
    this.clicked(this.locations[index], index);
  }

  formHide() {
    const elementForm = document.getElementById('form');
    const elementButton = document.getElementById('button-form');
    elementButton.textContent = (elementButton.textContent === 'Open') ? 'Close' : 'Open';
    elementForm.style.display = (elementForm.style.display === 'none') ? 'block' : 'none';
  }

  addLocation(event): void {
    console.log(event);
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
          this.onClicked(e);
        });
      this.marks.push(mark);
      this.mapElement.setView(markerLocation, 35);
      this.locations.push(this.locationObj);
      event.namePoint = '';
      event.width = 0;
      event.length = 0;
      console.log(this.locations);
      //  event.preventDefault();
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
