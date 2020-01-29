interface IZoneObjectsEmptyPanelBindings {
    [key: string]: any;

    onZoneAdd: any;
    state: any;
    isPreLoading: any;
}

const ZoneObjectsEmptyPanelBindings: IZoneObjectsEmptyPanelBindings = {
    // change operational event
    onZoneAdd: '&iqsAdd',
    state: '<?iqsState',
    isPreLoading: '<?iqsPreLoading'
}

class ZoneObjectsEmptyPanelChanges implements ng.IOnChangesObject, IZoneObjectsEmptyPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    onZoneAdd: ng.IChangesObject<() => ng.IPromise<void>>;
    state: ng.IChangesObject<string>;
    isPreLoading: ng.IChangesObject<boolean>;
}

class ZoneObjectsEmptyPanelController implements ng.IController {
    public $onInit() { }
    public onZoneAdd: () => void;
    public state: string;
    public accessConfig: any;
    public isPreLoading: boolean;
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        private $element: JQuery,
        private $state: ng.ui.IStateService,
        public pipMedia: pip.layouts.IMediaService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        $element.addClass('iqs-zone-objects-empty-panel');
        if (this.iqsLoading.isDone) { this.accessConfig = iqsAccessConfig.getStateConfigure().access; }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, () => { this.accessConfig = iqsAccessConfig.getStateConfigure().access; }));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public onAdd(): void {
        if (this.onZoneAdd) {
            this.onZoneAdd();
        }
    }


}

(() => {
    angular
        .module('iqsZoneObjectsEmptyPanel', [])
        .component('iqsZoneObjectsEmptyPanel', {
            bindings: ZoneObjectsEmptyPanelBindings,
            templateUrl: 'config/zone_objects/panels/ZoneObjectsEmptyPanel.html',
            controller: ZoneObjectsEmptyPanelController,
            controllerAs: '$ctrl'
        })
})();
