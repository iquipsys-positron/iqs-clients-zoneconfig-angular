interface IZoneEmptyPanelBindings {
    [key: string]: any;

    onZoneAdd: any;
    state: any;
    isPreLoading: any;
}

const ZoneEmptyPanelBindings: IZoneEmptyPanelBindings = {
    // change operational event
    onZoneAdd: '&iqsAdd',
    state: '<?iqsState',
    isPreLoading: '<?iqsPreLoading'
}

class ZoneEmptyPanelChanges implements ng.IOnChangesObject, IZoneEmptyPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    onZoneAdd: ng.IChangesObject<() => ng.IPromise<void>>;
    state: ng.IChangesObject<string>;
    isPreLoading: ng.IChangesObject<boolean>;
}

class ZoneEmptyPanelController implements ng.IController {
    public $onInit() { }
    public onZoneAdd: () => void;
    public state: string;
    public accessConfig: any;
    public isPreLoading;

    constructor(
        $rootScope: ng.IRootScopeService,
        private $element: JQuery,
        private $state: ng.ui.IStateService,
        public pipMedia: pip.layouts.IMediaService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        $element.addClass('iqs-zone-empty-panel');
        if (this.iqsLoading.isDone) { this.accessConfig = iqsAccessConfig.getStateConfigure().access; }
        $rootScope.$on(iqs.shell.LoadingCompleteEvent, () => { this.accessConfig = iqsAccessConfig.getStateConfigure().access; });
    }

    public onAdd(): void {
        if (this.onZoneAdd) {
            this.onZoneAdd();
        }
    }


}

(() => {
    angular
        .module('iqsZoneEmptyPanel', [])
        .component('iqsZoneEmptyPanel', {
            bindings: ZoneEmptyPanelBindings,
            templateUrl: 'config/zones/panels/ZonesEmptyPanel.html',
            controller: ZoneEmptyPanelController,
            controllerAs: '$ctrl'
        })
})();
