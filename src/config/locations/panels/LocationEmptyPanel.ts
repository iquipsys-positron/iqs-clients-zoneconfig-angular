interface ILocationEmptyPanelBindings {
    [key: string]: any;

    onLocationAdd: any;
    state: any;
    isPreLoading: any;
}

const LocationEmptyPanelBindings: ILocationEmptyPanelBindings = {
    // change operational event
    onLocationAdd: '&iqsAdd',
    state: '<?iqsState',
    isPreLoading: '<?iqsPreLoading'
}

class LocationEmptyPanelChanges implements ng.IOnChangesObject, ILocationEmptyPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    onLocationAdd: ng.IChangesObject<() => ng.IPromise<void>>;
    state: ng.IChangesObject<string>;
    isPreLoading: ng.IChangesObject<boolean>;
}

class LocationEmptyPanelController implements ng.IController {
    public $onInit() { }
    public onLocationAdd: () => void;
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

        $element.addClass('iqs-location-empty-panel');
        if (this.iqsLoading.isDone) { this.accessConfig = iqsAccessConfig.getStateConfigure().access; }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, () => { this.accessConfig = iqsAccessConfig.getStateConfigure().access; }));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public onAdd(): void {
        if (this.onLocationAdd) {
            this.onLocationAdd();
        }
    }
}

(() => {
    angular
        .module('iqsLocationEmptyPanel', [])
        .component('iqsLocationEmptyPanel', {
            bindings: LocationEmptyPanelBindings,
            templateUrl: 'config/locations/panels/LocationEmptyPanel.html',
            controller: LocationEmptyPanelController,
            controllerAs: '$ctrl'
        })
})();
