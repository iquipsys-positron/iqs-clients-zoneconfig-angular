import { IZoneObjectsSaveService } from './IZoneObjectsSaveService';

class ZoneObjectsSaveService implements IZoneObjectsSaveService {
    private _zoneId: string;
    private _currState: string;
    private _section: number;
    private _search: string;
    private _zone: iqs.shell.Zone;

    constructor(

    ) {
        "ngInject";

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
}

{
    angular.module('iqsConfigZoneObjects.SaveService', [])
        .service('iqsZoneObjectsSaveService', ZoneObjectsSaveService);

}