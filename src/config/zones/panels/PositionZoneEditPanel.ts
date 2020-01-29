import { ZoneParams, ZoomParams } from '../../../common';

declare var google;

interface IPositionZoneEditPanelBindings {
    [key: string]: any;

    onZoneSave: any;
    onZoneCancel: any;
    onZoomChange: any;
    zoom: any;
    mapOptions: any;
    nameCollection: any;
    newItem: any;
    editItem: any;
    ngDisabled: any;
}

const PositionZoneEditPanelBindings: IPositionZoneEditPanelBindings = {
    // change operational event
    onZoneSave: '&iqsSave',
    // add operational event
    onZoneCancel: '&iqsCancel',
    onZoomChange: '&iqsZoomChange',
    zoom: '=iqsZoom',
    mapOptions: '<iqsMapOptions',
    nameCollection: '<?iqsNameCollection',
    // event template for edit
    newItem: '<?iqsNewItem',
    editItem: '<?iqsEditItem',
    ngDisabled: '&?'
}

class PositionZoneEditPanelChanges implements ng.IOnChangesObject, IPositionZoneEditPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    onZoneSave: ng.IChangesObject<() => ng.IPromise<void>>;
    onZoneCancel: ng.IChangesObject<() => ng.IPromise<void>>;
    onZoomChange: ng.IChangesObject<() => ng.IPromise<void>>;
    zoom: ng.IChangesObject<number>;
    mapOptions: ng.IChangesObject<any>;
    newItem: ng.IChangesObject<iqs.shell.Zone>;
    nameCollection: ng.IChangesObject<string[]>;
    editItem: ng.IChangesObject<iqs.shell.Zone>;
    ngDisabled: ng.IChangesObject<() => ng.IPromise<void>>;
}

class PositionZoneEditPanelController implements ng.IController {
    public $onInit() { }
    public zone: iqs.shell.Zone;
    public zoneZones: iqs.shell.Zone[];

    public zoneTypeCollection: iqs.shell.TypeCollection;
    public error: string = '';

    public newItem: iqs.shell.Zone;
    public editItem: iqs.shell.Zone;
    public zoom: number;
    public mapOptions: any;
    public onZoneSave: (eventTempl: ZoneParams) => void;
    public onZoomChange: (value: ZoomParams) => void;
    public onZoneCancel: () => void;
    public ngDisabled: () => boolean;

    public form: any;
    public touchedErrorsWithHint: Function;

    private _zoneCopy: iqs.shell.Zone;
    private _originType: string;
    private _mapControl: any;
    private organizationCenter: any;
    public startPause: boolean = true;
    private cf: Function[] = [];

    public section: any;

    public sections: any[] = [
        {
            title: 'CIRCLE',
            type: 'circle',
            id: 0
        }, {
            title: 'POLYGON',
            type: 'polygon',
            id: 1
        }, {
            title: 'Line',
            type: 'line',
            id: 2
        },
        {
            title: 'Pan',
            type: null,
            id: 3
        }
    ];

    public zoneOptions: any = {
        fill: 'fill',
        stroke: 'stroke',
        radius: 'distance'
    };

    public polygons: iqs.shell.Zone[];
    public lines: iqs.shell.Zone[];
    public circles: iqs.shell.Zone[];
    public nameCollection: string[];
    public zoneDistance: number;

    constructor(
        $rootScope: ng.IRootScopeService,
        private $element: JQuery,
        private $scope: ng.IScope,
        private $state: ng.ui.IStateService,
        private $timeout: ng.ITimeoutService,
        public pipMedia: pip.layouts.IMediaService,
        private pipFormErrors: pip.errors.IFormErrorsService,
        private pipTranslate: pip.services.ITranslateService,
        private iqsZonesViewModel: iqs.shell.IZonesViewModel,
        private iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        $element.addClass('iqs-position-zone-edit-panel');

        this.touchedErrorsWithHint = pipFormErrors.touchedErrorsWithHint;
        const runWhenReady = () => {
            this.zoneTypeCollection = this.iqsTypeCollectionsService.getZoneType();
            this.iqsZonesViewModel.read(() => { this.prepare(); });

            this.$timeout(() => {
                this.startPause = false;
                this.toCenter();
            }, 1000);
        };
        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));

    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public $onChanges(changes: PositionZoneEditPanelChanges): void {
        let change: boolean = false;

        if (changes.newItem) {
            if (!_.isEqual(this.newItem, changes.newItem.previousValue)) {
                this.prepare();

                return;
            }
        }

        if (changes.editItem) {
            if (!_.isEqual(this.editItem, changes.editItem.previousValue)) {
                this.prepare();

                return;
            }
        }

        this.prepare();
    }

    public $postLink() {
        this.form = this.$scope.form;
    }

    private setOrganizationCenter() {
        this.organizationCenter = _.cloneDeep(this.mapOptions.center);
    }

    private prepare() {
        if (this.editItem) {
            this.setZone(this.editItem);
            if ((this.zone.type === 'line' || this.zone.type === 'polyline') && this.zone.distance) {
                this.zoneDistance = this.zone.distance * 2;
            }
        } else {
            this.setZone(this.newItem);
        }
        if (this.zone.type === 'line') this.zone.type = 'polyline';
        this.section = 3;
        this.setOrganizationCenter();
        this.prepareOtherZones();
    }

    public onEdit(overlay, type, path, center, radius) {
        this.section = 3;
        if (!type) return;

        switch (type) {
            case 'circle':
                this.zone.geometry = {};
                this.zone.center = { latitude: center.lat(), longitude: center.lng() };
                this.zone.distance = radius;
                break;
            default:
                this.zone.geometry = {
                    type: type === 'polygon' ? 'Polygon' : 'LineString',
                    coordinates: this.convertPathToCoors(path, type === 'polygon')
                };

                break;
        }

        this.zone.type = type;
    }

    public clearMap() {
        this.zone.geometry = null;
        this.zone.center = null;
        this.zone.distance = null;
        this._mapControl.clearMap();
        this.changeType(this.section[this.section].type);
    }

    public setControl(control) {
        this._mapControl = control;
    }

    public onZoomIn() {
        if (!this._mapControl) return;

        const curZ = this._mapControl.map.control.getGMap().getZoom() + 1;
        this._mapControl.map.control.getGMap().setZoom(curZ);

        if (this.onZoomChange) {
            this.onZoomChange({ zoom: curZ })
        }
    }

    public onZoomOut() {
        if (!this._mapControl) return;

        const curZ = this._mapControl.map.control.getGMap().getZoom() - 1;
        this._mapControl.map.control.getGMap().setZoom(curZ);

        if (this.onZoomChange) {
            this.onZoomChange({ zoom: curZ })
        }
    }

    public toCenter() {
        if (this._mapControl) this._mapControl.map.control.getGMap().panTo(new google.maps.LatLng(
            this.organizationCenter.latitude,
            this.organizationCenter.longitude
        ));
    }

    private setZone(zone) {
        this.zone = _.cloneDeep(zone);
        this._originType = zone.type;

        this._zoneCopy = _.cloneDeep(zone);
    }

    private convertPathToCoors(path, isPolygon = false) {
        const coordinates = isPolygon ? [[]] : [];

        if (path.forEach) {
            path.forEach((point) => {
                if (isPolygon) {
                    coordinates[0].push([point.lng(), point.lat()]);
                } else {
                    coordinates.push([point.lng(), point.lat()]);
                }
            });
        }

        return coordinates;
    }

    private setSection() {
        if (this.zone && this.zone.type) {
            this.section = _.findIndex(this.sections, (section) => {
                return section.type === this.zone.type;
            });

            if (this.section < 0) this.section = 3;
        } else {
            this.section = 3;
            this.$timeout(() => {
                this.changeType('pan');
            }, 100);
        }
    }

    private changeType(type) {
        if (!this._mapControl) return;
        switch (type) {
            case 'circle':
                this._mapControl.addCircle();
                break;
            case 'polygon':
                this._mapControl.addPolygon();
                break;
            case 'line':
                this._mapControl.addLine();
                break;
            case 'polyline':
                this._mapControl.addLine();
                break;
            case 'pan':
                this._mapControl.drawingManagerOptions.drawingMode = null;
                break;
        }
    }

    private createEmptyOverlayCopy(zone, newType) {
        let nZone = new iqs.shell.Zone();
        if (zone) {
            nZone = _.cloneDeep(angular.extend(zone, { geometry: {}, distance: null, center: {} }));
            nZone.type = newType;
        }

        return nZone;
    }

    public selectSection(sectionIndex) {
        this.error = '';
        this.section = sectionIndex;
        const section = this.sections[this.section];
        if (section.type === null) {
            this.changeType('pan');
            return;
        }

        //if (section.type !== this._originType) {
        this.zone.type = section.type;
        this.zone = this.createEmptyOverlayCopy(this.zone, section.type);
        this.$timeout(() => {
            this.changeType(section.type);
        }, 100);
        /* } else {
             this.setZone(this._zoneCopy);
         }*/
    }

    public onSaveClick(): void {
        if (this.form.$invalid) {
            this.pipFormErrors.resetFormErrors(this.form, true);

            return;
        }

        if (!this.zone.type) {
            this.error = 'ZONE_TYPE_REQUERED';

            return;
        }

        if (this.zone.type == 'polyline') this.zone.type = 'line';

        switch (this.zone.type) {
            case 'circle':
                if (!this.zone.center || _.isEmpty(this.zone.center) || !this.zone.distance) {
                    this.error = 'ZONE_NOT_SET';
                    this.zone.type = null;
                    this.section = 3;

                    return;
                }
                break;
            case 'polygon':
                if (!this.zone.geometry || _.isEmpty(this.zone.geometry)) {
                    this.error = 'ZONE_NOT_SET';
                    this.zone.type = null;
                    this.section = 3;

                    return;
                }
                break;
            case 'line':
                if (this.zoneDistance) this.zone.distance = this.zoneDistance / 2;
                if (!this.zone.geometry || _.isEmpty(this.zone.geometry)) {
                    this.error = 'ZONE_NOT_SET';
                    this.zone.type = null;
                    this.section = 3;

                    return;
                }
                break;
        }

        if (this.onZoneSave) {

            if (!this.error) {
                this.onZoneSave({ item: this.zone });
                this.pipFormErrors.resetFormErrors(this.form, false);
            }
        }
    }

    public onCancelClick(): void {
        this.setZone(this._zoneCopy);
        if (this.onZoneCancel) {
            this.onZoneCancel();
        }
    }

    private prepareOtherZones() {
        this.polygons = _.filter(this.iqsZonesViewModel.polygons, (zone) => { return this.zone.id !== zone.id; });
        this.lines = _.filter(this.iqsZonesViewModel.lines, (zone) => { return this.zone.id !== zone.id; });
        this.circles = _.filter(this.iqsZonesViewModel.circles, (zone) => { return this.zone.id !== zone.id; });
    }
}

(() => {
    angular
        .module('iqsPositionZoneEditPanel', [])
        .component('iqsPositionZoneEditPanel', {
            bindings: PositionZoneEditPanelBindings,
            templateUrl: 'config/zones/panels/PositionZoneEditPanel.html',
            controller: PositionZoneEditPanelController,
            controllerAs: '$ctrl'
        })
})();
