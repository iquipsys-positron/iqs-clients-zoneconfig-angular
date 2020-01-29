import { IZoneSaveService } from './IZoneSaveService';

class ZoneSaveService implements IZoneSaveService {
    private _zoneId: string;
    private _currState: string;
    private _section: number;
    private _search: string;
    private _zone: iqs.shell.Zone;
    private _zoom: number;

    constructor(

    ) {
        "ngInject";

        this._zoom = 14;
    }

    public set zone(zone: iqs.shell.Zone) {
        this._zone = zone;
    }

    public get zone(): iqs.shell.Zone {
        return this._zone;
    }

    public set zoneId(zoneId: string) {
        this._zoneId = zoneId;
    }

    public get zoneId(): string {
        return this._zoneId;
    }

    public set currState(currState: string) {
        this._currState = currState;
    }

    public get currState(): string {
        return this._currState;
    }

    public set section(section: number) {
        this._section = section;
    }

    public get section(): number {
        return this._section;
    }

    public set search(search: string) {
        this._search = search;
    }

    public get search(): string {
        return this._search;
    }

    public set zoom(zoom: number) {
        this._zoom = zoom;
    }

    public get zoom(): number {
        return this._zoom;
    }

}

{
    angular.module('iqsConfigZones.SaveService', [])
        .service('iqsZoneSaveService', ZoneSaveService);

}