export interface IZoneSaveService {
    zoneId: string;
    currState: string;
    search: string;
    zone: iqs.shell.Zone;
    section: number;
    zoom: number;
}
