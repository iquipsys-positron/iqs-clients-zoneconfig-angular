import { ILocationsSaveService } from './ILocationsSaveService';

class LocationsSaveService implements ILocationsSaveService {
    private _locationId: string;
    private _currState: string;
    private _search: string;
    private _location: iqs.shell.Location;
    private _zoom: number;

    constructor(

    ) {
        "ngInject";

        // set zoom default value
        this._zoom = 14;
    }

    public set location(location: iqs.shell.Location) {
        this._location = location;
    }

    public get location(): iqs.shell.Location {
        return this._location;
    }

    public set locationId(locationId: string) {
        this._locationId = locationId;
    }

    public get locationId(): string {
        return this._locationId;
    }

    public set zoom(zoom: number) {
        this._zoom = zoom;
    }

    public get zoom(): number {
        return this._zoom;
    }

    public set currState(currState: string) {
        this._currState = currState;
    }

    public get currState(): string {
        return this._currState;
    }

    public set search(search: string) {
        this._search = search;
    }

    public get search(): string {
        return this._search;
    }

}

{
    angular.module('iqsLocations.SaveService', [])
        .service('iqsLocationsSaveService', LocationsSaveService);

}