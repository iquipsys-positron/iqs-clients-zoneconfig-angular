export interface ILocationsSaveService {
    locationId: string;
    currState: string;
    search: string;
    location: iqs.shell.Location;
    zoom: number;
}
