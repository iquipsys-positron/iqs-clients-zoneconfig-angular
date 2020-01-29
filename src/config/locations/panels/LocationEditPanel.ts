import { LocationParams, ZoomParams } from '../../../common';

declare var google;

interface ILocationEditPanelBindings {
    [key: string]: any;

    onLocationSave: any;
    onLocationCancel: any;
    onZoomChange: any;
    nameCollection: any;
    zoom: any;
    newItem: any;
    editItem: any;
    ngDisabled: any;
}

const LocationEditPanelBindings: ILocationEditPanelBindings = {
    // save location
    onLocationSave: '&iqsSave',
    // cancel change 
    onLocationCancel: '&iqsCancel',
    onZoomChange: '&iqsZoomChange',
    nameCollection: '<?iqsNameCollection',
    zoom: '=iqsZoom',
    //location for edit
    newItem: '=?iqsNewItem',
    editItem: '=?iqsEditItem',
    ngDisabled: '&?'
}

class LocationEditPanelChanges implements ng.IOnChangesObject, ILocationEditPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    onLocationSave: ng.IChangesObject<() => ng.IPromise<void>>;
    onLocationCancel: ng.IChangesObject<() => ng.IPromise<void>>;
    onZoomChange: ng.IChangesObject<() => ng.IPromise<void>>;
    zoom: ng.IChangesObject<number>;
    nameCollection: ng.IChangesObject<string[]>;
    newItem: ng.IChangesObject<iqs.shell.Location>;
    editItem: ng.IChangesObject<iqs.shell.Location>;
    ngDisabled: ng.IChangesObject<() => ng.IPromise<void>>;
}

class LocationEditPanelController implements ng.IController {
    public $onInit() { }
    public location: iqs.shell.Location;
    private mapControl: any;
    public mapOptions: any;
    private organizationCenter: any;
    public currentLocation: any;

    public newItem: iqs.shell.Location;
    public editItem: iqs.shell.Location;
    public zoom: number;
    public onLocationSave: (eventTempl: LocationParams) => void;
    public onZoomChange: (value: ZoomParams) => void;
    public onLocationCancel: () => void;
    public ngDisabled: () => boolean;
    public startPause: boolean = true;

    public section: any;

    public sections: any[] = [
        {
            title: 'Pan',
            type: 'pan',
            id: 0
        }, {
            title: 'POINT',
            type: 'point',
            id: 1
        }
    ];

    public error: string = '';
    public form: any;
    public touchedErrorsWithHint: Function;
    public nameCollection: string[];
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        private $element: JQuery,
        private $state: ng.ui.IStateService,
        private $scope: ng.IScope,
        private $timeout: ng.ITimeoutService,
        private pipFormErrors: pip.errors.IFormErrorsService,
        public pipMedia: pip.layouts.IMediaService,
        private iqsMapConfig: iqs.shell.IMapService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        $element.addClass('iqs-location-edit-panel');

        this.touchedErrorsWithHint = pipFormErrors.touchedErrorsWithHint;
        const runWhenReady = () => {
            this.section = 0;
            this.getMapOptions();
            this.startPause = false;
            this.$timeout(() => {
                this.setOrganizationCenter();
                this.currentLocation = this.location || {};
                if (this.currentLocation.latitude !== null && this.currentLocation.latitude !== undefined &&
                    this.currentLocation.longitude !== null && this.currentLocation.longitude !== undefined) {
                    this.organizationCenter = this.currentLocation;
                }
                this.toCenter();
            }, 100);
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public $postLink() {
        this.form = this.$scope.form;
    }

    public $onChanges(changes: LocationEditPanelChanges): void {
        if (changes.newItem) {
            if (!_.isEqual(this.newItem, changes.newItem.previousValue)) {
                this.location = _.cloneDeep(this.newItem);
                this.prepare();

                return;
            }
        }

        if (changes.editItem) {
            if (!_.isEqual(this.editItem, changes.editItem.previousValue)) {
                this.location = _.cloneDeep(this.editItem);
                this.prepare();

                return;
            }
        }

        this.init();
    }

    private init() {
        if (this.editItem) {
            this.location = _.cloneDeep(this.editItem);
        } else {
            this.location = _.cloneDeep(this.newItem);
        }

        this.prepare()
    }

    public setControl(control) {
        this.mapControl = control;
    }

    private prepare() {
        this.currentLocation = this.location || {};
        if (this.location.pos) {
            this.currentLocation.latitude = this.location.pos.coordinates[1];
            this.currentLocation.longitude = this.location.pos.coordinates[0];
        }

        this.currentLocation.type = 'marker';
        this.error = null;
    }

    private getMapOptions() {
        this.mapOptions = angular.extend(this.iqsMapConfig.organizationConfigs, {
            zoom: this.zoom,
            map: {
                mapTypeId: 'hybrid',
                draggable: true,
                scrollwheel: true,
                disableDoubleClickZoom: false
            }
        });
    }

    private setOrganizationCenter() {
        this.organizationCenter = _.cloneDeep(this.iqsMapConfig.organizationConfigs.center);
    }

    public clearMap() {
        this.mapControl.clearMap();
        this.changeType('pan');
        this.section = 0;
    }

    private changeType(type) {
        if (!this.mapControl) return;

        switch (type) {
            case 'point':
                this.mapControl.addMarker();
                break;
            case 'pan':
                this.mapControl.drawingManagerOptions.drawingMode = null;
                break;
        }
    }

    public selectSection(sectionIndex) {
        this.error = '';
        this.section = sectionIndex;
        const section = this.sections[this.section];
        this.changeType(this.sections[this.section].type);
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

    public onEdit(overlay, type, path, center, radius) {
        if (center.lat) {
            this.currentLocation.latitude = center.lat();
            this.currentLocation.longitude = center.lng();
            this.section = 0;
            this.error = null;
        }
    }

    public onSaveClick(): void {
        if (this.form.$invalid) {
            this.pipFormErrors.resetFormErrors(this.form, true);

            return;
        }

        if (this.onLocationSave) {
            if ((this.currentLocation.latitude) &&
                (this.currentLocation.longitude)) {
                let pos = {
                    coordinates: []
                };
                pos.coordinates[1] = _.clone(this.currentLocation.latitude ? this.currentLocation.latitude : this.currentLocation.pos.coordinates[1]);
                pos.coordinates[0] = _.clone(this.currentLocation.longitude ? this.currentLocation.longitude : this.currentLocation.pos.coordinates[0]);
                this.location.pos = pos;

                this.onLocationSave({ item: this.location });
            } else {
                this.error = 'LOCATION_NOT_POSITION';
            }

            this.pipFormErrors.resetFormErrors(this.form, false);
        }
    }

    public onCancelClick(): void {
        if (this.onLocationCancel) {
            this.onLocationCancel();
        }
    }
}

(() => {
    angular
        .module('iqsLocationEditPanel', ['ValidateDirectives'])
        .component('iqsLocationEditPanel', {
            bindings: LocationEditPanelBindings,
            templateUrl: 'config/locations/panels/LocationEditPanel.html',
            controller: LocationEditPanelController,
            controllerAs: '$ctrl'
        })
})();
