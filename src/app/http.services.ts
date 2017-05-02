import { Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class HttpService {

    constructor(private http: Http) {}

    getLocation(): Observable<any> {
        return this.http.get('assets/locations.json');
    }

}
