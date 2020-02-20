import { IZoneSaveService } from './IZoneSaveService';

export const ConfigZonesStateName: string = 'app.zones';

class ZonesController implements ng.IController {
    private cleanUpFunc: Function;
    private mediaSizeGtSm: boolean;
    public details: boolean;
    public searchCriteria: string = '';
    public searchQuery: string = '';
    public currentState: string;
    public new: iqs.shell.Zone;
    public edit: iqs.shell.Zone;
    public mapZoom: number;
    public accessConfig: any;
    public mapOptions: any;
    public mapControl: any;
    public nameCollection: string[];
    public isPreLoading: boolean = true;
    private cf: Function[] = [];

    constructor(
        private $window: ng.IWindowService,
        private $state: ng.ui.IStateService,
        private $timeout: ng.ITimeoutService,
        private $location: ng.ILocationService,
        $scope: ng.IScope,
        private pipNavService: pip.nav.INavService,
        private pipMedia: pip.layouts.IMediaService,
        private pipScroll: pip.services.IScrollService,
        private pipTranslate: pip.services.ITranslateService,
        private pipConfirmationDialog: pip.dialogs.IConfirmationDialogService,
        private $rootScope: ng.IRootScopeService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private iqsZonesViewModel: iqs.shell.IZonesViewModel,
        private iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        private iqsZoneSaveService: IZoneSaveService,
        private iqsMapConfig: iqs.shell.IMapService,
        private iqsGlobalSearch: iqs.shell.IGlobalSearchService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        this.restoreState();
        this.mediaSizeGtSm = this.pipMedia('gt-sm');

        const runWhenReady = () => {
            this.accessConfig = iqsAccessConfig.getStateConfigure().access;
            this.iqsZonesViewModel.filter = null;
            this.iqsZonesViewModel.zonesCategory = 'zone'
            this.iqsZonesViewModel.isSort = true;

            this.iqsZonesViewModel.reload(() => {
                this.iqsZonesViewModel.getCollection(this.searchCriteria);
                this.prepareNameCollection();
                this.isPreLoading = false;
            });
            this.getMapOptions();
        };
        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));

        if (!this.pipMedia('gt-sm')) {
            if (this.currentState === iqs.shell.States.Add || this.currentState === iqs.shell.States.Edit) {
                this.details = true;
            } else {
                this.details = $location.search().details == 'details' ? true : false;
            }
        } else {
            this.details = false;
            this.$location.search('details', 'main');
        }

        this.cf.push($rootScope.$on('pipMainResized', () => {
            if (this.mediaSizeGtSm !== this.pipMedia('gt-sm')) {
                this.mediaSizeGtSm = this.pipMedia('gt-sm');

                if (this.pipMedia('gt-sm')) {
                    this.details = false;
                } else {
                    if (this.currentState === iqs.shell.States.Add || this.currentState === iqs.shell.States.Edit) {
                        this.details = true;
                    }
                }
                this.appHeader();
            }
        }));

        this.appHeader();
        this.cf.push($rootScope.$on(pip.services.IdentityChangedEvent, () => {
            this.appHeader();
        }));
    }

    public $onInit() { }

    public $onDestroy() {
        this.saveCurrentState();
        for (const f of this.cf) { f(); }
    }

    private saveCurrentState() {
        this.iqsZoneSaveService.zoneId = this.collection && this.collection.length > 0 && this.selectedIndex > -1 ? this.collection[this.selectedIndex].id : null;
        this.iqsZoneSaveService.currState = this.currentState;
        this.iqsZoneSaveService.search = this.searchQuery;
        this.iqsZoneSaveService.zone = this.new ? this.new : this.edit;
        this.iqsZoneSaveService.zoom = this.mapZoom;
    }

    private restoreState() {
        this.searchQuery = this.iqsZoneSaveService.search ? this.iqsZoneSaveService.search : this.$location.search()['search'] || '';
        this.searchCriteria = this.searchQuery;
        if (!this.$location.search()['zone_id'] && this.iqsZoneSaveService.zoneId) {
            this.$location.search('zone_id', this.iqsZoneSaveService.zoneId);
        }
        let currentState: string = this.iqsZoneSaveService.currState ? this.iqsZoneSaveService.currState : null;
        currentState = currentState == iqs.shell.States.Add || currentState == iqs.shell.States.Edit ? null : currentState;
        if (currentState === iqs.shell.States.Add) {
            this.new = this.iqsZoneSaveService.zone;
            this.edit = null;
        } else if (currentState === iqs.shell.States.Edit) {
            this.new = null;
            if (this.iqsZoneSaveService.zone) {
                this.edit = this.iqsZoneSaveService.zone;
            } else {
                this.edit = null;
                currentState = null;
            }
        }
        this.prepareNameCollection();
        this.currentState = currentState;
        this.mapZoom = this.iqsZoneSaveService.zoom;
    }

    private toMainFromDetails(): void {
        this.$location.search('details', 'main');
        this.details = false;
        this.onCancel();
        this.appHeader();
    }

    private appHeader(): void {
        this.pipNavService.appbar.removeShadow();
        this.pipNavService.appbar.parts = { 'icon': true, 'actions': 'primary', 'menu': true, 'title': 'breadcrumb', 'organizations': this.pipMedia('gt-sm') };
        this.pipNavService.breadcrumb.breakpoint = 'gt-sm';

        if (!this.pipMedia('gt-sm') && this.details) {
            const detailsTitle = this.currentState === iqs.shell.States.Add
                ? 'ZONE_DETAILS_NEW'
                : this.currentState === iqs.shell.States.Edit
                    ? 'ZONE_DETAILS_EDIT'
                    : 'ZONE_DETAILS';

            this.pipNavService.breadcrumb.items = [
                <pip.nav.BreadcrumbItem>{
                    title: "ZONES", click: () => {
                        this.toMainFromDetails();
                    }, subActions: []
                },
                <pip.nav.BreadcrumbItem>{
                    title: detailsTitle, click: () => { }, subActions: []
                }
            ];
            this.pipNavService.icon.showBack(() => {
                this.toMainFromDetails();
            });
        } else {
            this.pipNavService.breadcrumb.text = 'ZONES';
            this.pipNavService.icon.showMenu();
        }

        this.pipNavService.actions.hide();
    }

    private getMapOptions() {
        this.mapOptions = angular.extend(this.iqsMapConfig.organizationConfigs, {
            zoom: this.mapZoom,
            map: {
                mapTypeId: 'hybrid',
                draggable: true,
                scrollwheel: true,
                disableDoubleClickZoom: false
            }
        });
    }

    private focusedNewButton() {
        this.pipScroll.scrollTo('.pip-list-container', '#new-item', 300);
    }

    public selectItem(index: number) {
        if (this.state == iqs.shell.States.Add || this.state == iqs.shell.States.Edit) { return };

        if (index !== undefined && index !== null) this.iqsZonesViewModel.selectItem(index);
        if (!this.pipMedia('gt-sm')) {
            this.details = true;
            this.$location.search('details', 'details');
            this.appHeader();
        }
    }

    public setMapControl(control) {
        this.mapControl = control;
    }

    public get selectedIndex() {
        return this.state != iqs.shell.States.Add ? this.iqsZonesViewModel.selectedIndex : -1;
    }

    public set selectedIndex(value: number) {

    }

    private prepareNameCollection() {
        this.nameCollection = [];
        _.each(this.iqsZonesViewModel.zones, (item: iqs.shell.Zone) => {
            if (this.edit && this.edit.id && this.edit.id != item.id || !this.edit || !this.edit.id) {
                if (item.name) this.nameCollection.push(item.name);
            }
        });
    }

    public get collection(): iqs.shell.Zone[] {
        // return [];
        return this.iqsZonesViewModel.getCollection(this.searchCriteria);
    }

    public get state(): string {
        // return 'empty'
        return this.currentState ? this.currentState : this.iqsZonesViewModel.state;
    }

    public get transaction(): pip.services.Transaction {
        return this.iqsZonesViewModel.getTransaction();
    }

    public get searchedCollection(): string[] {
        return this.iqsZonesViewModel.searchedCollection;
    }

    public reload(): void {
        this.iqsZonesViewModel.reload();
    }

    public onRetry() {
        this.$window.history.back();
    }

    public onEdit() {
        if (this.selectedIndex > -1 && this.collection[this.selectedIndex]) {
            this.edit = _.cloneDeep(this.collection[this.selectedIndex]);
            this.new = null;
            this.prepareNameCollection();
            this.currentState = iqs.shell.States.Edit;
            this.$location.search('state', iqs.shell.States.Edit);
        }
    }

    public onDelete() {
        if (this.transaction.busy()) {
            return;
        }

        if (this.selectedIndex > -1 && this.collection[this.selectedIndex]) {
            this.pipConfirmationDialog.show(
                {
                    event: null,
                    title: this.pipTranslate.translate('ZONE_DELETE_CONFIRMATION_TITLE') + ' "' + this.collection[this.selectedIndex].name + '"?',
                    ok: 'CONFIRM_DELETE',
                    cancel: 'CONFIRM_CANCEL'
                },
                () => {
                    this.onDeleteItem(this.collection[this.selectedIndex]);
                },
                () => {
                    console.log('You disagreed');
                }
            );
        }
    }

    public onSearchResult(searchQuery: string): void {
        this.searchCriteria = searchQuery;
        this.$location.search('search', this.searchCriteria);

        if (this.state == iqs.shell.States.Empty) {
            this.iqsZonesViewModel.getCollection(this.searchCriteria);
        }
    }

    public onCanselSearch() {
        this.searchCriteria = '';
        this.searchQuery = '';
        this.$location.search('search', this.searchCriteria);
        if (this.state == iqs.shell.States.Empty) {
            this.iqsZonesViewModel.getCollection(this.searchCriteria);
        }
    }

    public onAdd() {
        this.mapOptions.center = { latitude: this.iqsOrganization.organization.center.coordinates[1], longitude: this.iqsOrganization.organization.center.coordinates[0] };
        if (!this.pipMedia('gt-sm')) {
            this.details = true;
            this.$location.search('details', 'details');
            this.appHeader();
        }
        this.new = new iqs.shell.Zone();
        this.edit = null;
        this.prepareNameCollection();
        this.currentState = iqs.shell.States.Add;
        this.$location.search('state', iqs.shell.States.Add);

        if (this.pipMedia('gt-sm')) {
            this.focusedNewButton();
        }
    }

    public onZoomChange(zoom: number) {
        this.mapZoom = zoom;
        this.getMapOptions();
    }

    public onSave(item: iqs.shell.Zone): void {
        if (this.transaction.busy() || !item) {
            return;
        }

        if (this.currentState == iqs.shell.States.Add) {
            item.org_id = this.iqsOrganization.orgId;
            this.iqsZonesViewModel.saveZone(
                item,
                (data: iqs.shell.Zone) => {
                    this.currentState = null
                    this.new = null;
                    this.searchCriteria = '';
                    if (this.state == iqs.shell.States.Empty) {
                        this.iqsZonesViewModel.getCollection(this.searchCriteria);
                    }
                },
                (error: any) => { }
            );
        } else {
            // update zone
            this.iqsZonesViewModel.updateZone(
                item.id,
                item,
                (data: iqs.shell.Zone) => {
                    this.currentState = null
                    this.edit = null;
                },
                (error: any) => { }
            );
        }
    }

    public onCancel() {
        this.details = this.currentState == iqs.shell.States.Add ? false : this.details;
        this.currentState = null;
        this.new = null;
        this.edit = null;
        this.appHeader();
    }

    public onDeleteItem(item: iqs.shell.Zone) {
        if (this.transaction.busy()) {
            return;
        }

        if (item && item.id) {
            this.iqsZonesViewModel.deleteZone(
                item.id,
                () => {
                    this.details = false;
                    this.$location.search('details', 'main');
                    this.appHeader();
                    // todo toast deleted
                },
                (error: any) => { }
            );
        }
    }

}

function configureZonesZonesRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(ConfigZonesStateName, {
            url: '/zones?zone_id&search&section&details&state',
            controller: ZonesController,
            reloadOnSearch: false,
            auth: true,
            controllerAs: '$ctrl',
            templateUrl: 'config/zones/Zones.html'
        });
}

function configureZonesZonesAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.manager;
    let accessConfig: any = {
        addZone: iqs.shell.AccessRole.manager,
        editZone: iqs.shell.AccessRole.manager,
        deleteZone: iqs.shell.AccessRole.manager
    };
    iqsAccessConfigProvider.registerStateAccess(ConfigZonesStateName, accessLevel);
    iqsAccessConfigProvider.registerStateConfigure(ConfigZonesStateName, accessConfig);
}

(() => {

    angular
        .module('iqsConfigZones', [
            'pipNav', 'iqsZones.ViewModel',
            'iqsGlobalSearch',
            'iqsZoomButtonsPanel',

            'iqsAccessConfig',
            'iqsZoneEmptyPanel',
            'iqsDetailsZonePanel',
            'iqsPositionZoneEditPanel',

            'iqsConfigZones.SaveService'

        ])
        .config(configureZonesZonesRoute)
        .config(configureZonesZonesAccess);

})();
