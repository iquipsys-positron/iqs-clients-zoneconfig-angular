import { ZoomParams } from '../../../common';

declare var google;

interface ILocationPanelBindings {
    [key: string]: any;

    onLocationEdit: any;
    onLocationDelete: any;
    onZoomChange: any;
    zoom: any;
    item: any;
    ngDisabled: any;
}

const LocationPanelBindings: ILocationPanelBindings = {
    // change location
    onLocationEdit: '&iqsEdit',
    // add location
    onLocationDelete: '&iqsDelete',
    onZoomChange: '&iqsZoomChange',
    zoom: '=iqsZoom',
    // location
    item: '<?iqsLocationItem',
    ngDisabled: '&?'
}

class LocationPanelChanges implements ng.IOnChangesObject, ILocationPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    onLocationEdit: ng.IChangesObject<() => ng.IPromise<void>>;
    onLocationDelete: ng.IChangesObject<() => ng.IPromise<void>>;
    onZoomChange: ng.IChangesObject<() => ng.IPromise<void>>;
    zoom: ng.IChangesObject<number>;
    item: ng.IChangesObject<Location>;
    ngDisabled: ng.IChangesObject<() => ng.IPromise<void>>;
}

class LocationPanelController implements ng.IController {
    public $onInit() { }

    private mapControl: any;
    public mapOptions: any;
    private organizationCenter: any;
    private currentLocation: any;
    public accessConfig: any;
    private currentLocations: any[];
    public curLocation: any;
    public item: Location;
    public zoom: number;
    public onLocationEdit: () => void;
    public onZoomChange: (value: ZoomParams) => void;
    public onLocationDelete: () => void;
    public ngDisabled: () => boolean;
    private cf: Function[] = [];

    private markerOptions: any = {
        icon: {
            path: 0,
            scale: 4,
            strokeWeight: 8,
            fillColor: '#fbd93e',
            strokeColor: '#fbd93e',
            strokeOpacity: 0.9
        }
    };

    constructor(
        $rootScope: ng.IRootScopeService,
        private $element: JQuery,
        private $state: ng.ui.IStateService,
        private $timeout: ng.ITimeoutService,
        public pipMedia: pip.layouts.IMediaService,
        private iqsMapConfig: iqs.shell.IMapService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        $element.addClass('iqs-location-panel');
        const runWhenReady = () => {
            this.accessConfig = iqsAccessConfig.getStateConfigure().access;
            this.getMapOptions();
            this.setOrganizationCenter();
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, () => { runWhenReady(); }));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public setControl(control) {
        this.mapControl = control;
        if (this.item) {
            this.$timeout(() => {
                this.createLocationPoint(this.item);
            }, 300);
        }
    }

    // public setControl(control) {
    //     if (!this.iqsLoading.isDone) {
    //         this.runWhenReady.push(() => { this.setControlOnReady(control); });
    //     } else {
    //         this.setControlOnReady(control);
    //     }
    // }

    private createLocationPoint(location, isEditable = false) {
        if (this.currentLocation && this.currentLocation.setMap) this.currentLocation.setMap(null);

        if (location && location.pos && location.pos.coordinates) {
            const pos = new google.maps.LatLng(location.pos.coordinates[1], location.pos.coordinates[0])

            this.currentLocation = new google.maps.Marker(angular.extend(this.markerOptions, {
                position: pos,
                draggable: isEditable,
                editable: isEditable
            }));

            this.curLocation = {
                id: location.id || '0',
                latitude: pos.lat(),
                longitude: pos.lng(),
                pos: {
                    coordinates: []
                },
                icon: this.markerOptions.icon
            };

            this.curLocation.pos.coordinates[1] = pos.lat();
            this.curLocation.pos.coordinates[0] = pos.lng();

            if (this.mapControl) {
                this.currentLocation.setMap(this.mapControl.map.control.getGMap());
                this.mapControl.map.control.getGMap().panTo(pos);
            }
        }
    }

    private prepare() {
        if (!this.item || !this.iqsLoading.isDone) return;

        this.createLocationPoint(this.item);
    }

    private getMapOptions() {
        this.mapOptions = angular.extend(this.iqsMapConfig.organizationConfigs, {
            zoom: this.zoom,
            map: {
                mapTypeId: 'hybrid',
                draggable: false,
                scrollwheel: false,
                disableDoubleClickZoom: true
            }
        });
    }

    private setOrganizationCenter() {
        this.organizationCenter = _.cloneDeep(this.mapOptions.center);
    }

    public $onChanges(changes: LocationPanelChanges): void {
        if (changes.item && changes.item.currentValue) {
            this.item = changes.item.currentValue;

            this.prepare();
        }
    }

    public onEdit(item: Location): void {
        if (this.onLocationEdit) {
            this.onLocationEdit();
        }
    }

    public onDelete(item: Location): void {
        if (this.onLocationDelete) {
            this.onLocationDelete();
        }
    }

    public onZoomIn() {
        if (!this.mapControl) return;

        const curZ = this.mapControl.map.control.getGMap().getZoom() + 1;
        this.mapControl.map.control.getGMap().setZoom(curZ);

        if (this.onZoomChange) {
            this.onZoomChange({ zoom: curZ })
        }
    }

    public onZoomOut() {
        if (!this.mapControl) return;

        const curZ = this.mapControl.map.control.getGMap().getZoom() - 1;
        this.mapControl.map.control.getGMap().setZoom(curZ);

        if (this.onZoomChange) {
            this.onZoomChange({ zoom: curZ })
        }
    }

    public toCenter() {
        if (this.mapControl) this.mapControl.map.control.getGMap().panTo(new google.maps.LatLng(
            this.organizationCenter.latitude,
            this.organizationCenter.longitude
        ));
    }

}

(() => {
    angular
        .module('iqsLocationPanel', ['iqsIncidents.Panel.Map'])
        .component('iqsLocationPanel', {
            bindings: LocationPanelBindings,
            templateUrl: 'config/locations/panels/LocationPanel.html',
            controller: LocationPanelController,
            controllerAs: '$ctrl'
        })
})();
