import { IZoneObjectsSaveService } from './IZoneObjectsSaveService';
export const ConfigZoneObjectsStateName: string = 'app.zone_objects';

class ZoneObjectsController implements ng.IController {
    public $onInit() { }
    private mediaSizeGtSm: boolean;
    public accessConfig: any;
    public details: boolean;
    public searchCriteria: string = '';
    public searchQuery: string = '';
    public currentState: string;
    public new: iqs.shell.Zone;
    public edit: iqs.shell.Zone;
    public nameCollection: string[];
    public isPreLoading: boolean = true;
    private cf: Function[] = [];

    constructor(
        private $window: ng.IWindowService,
        private $state: ng.ui.IStateService,
        private $location: ng.ILocationService,
        $scope: ng.IScope,
        private pipNavService: pip.nav.INavService,
        private pipMedia: pip.layouts.IMediaService,
        private pipScroll: pip.services.IScrollService,
        private pipConfirmationDialog: pip.dialogs.IConfirmationDialogService,
        private pipTranslate: pip.services.ITranslateService,
        private $rootScope: ng.IRootScopeService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private iqsZonesViewModel: iqs.shell.IZonesViewModel,
        private iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        private iqsZoneObjectsSaveService: IZoneObjectsSaveService,
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
            this.iqsZonesViewModel.zonesCategory = 'object'
            this.iqsZonesViewModel.isSort = true;
            this.iqsZonesViewModel.reload(() => {
                this.iqsZonesViewModel.getCollection(this.searchCriteria);
                this.prepareNameCollection();
                this.isPreLoading = false;
            });
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

    public $onDestroy() {
        this.saveCurrentState();
        for (const f of this.cf) { f(); }
    }

    private saveCurrentState() {
        this.iqsZoneObjectsSaveService.zoneId = this.collection && this.collection.length > 0 && this.selectedIndex > -1 ? this.collection[this.selectedIndex].id : null;
        this.iqsZoneObjectsSaveService.currState = this.currentState;
        this.iqsZoneObjectsSaveService.search = this.searchQuery;
        this.iqsZoneObjectsSaveService.zone = this.new ? this.new : this.edit;
    }

    private restoreState() {
        this.searchQuery = this.iqsZoneObjectsSaveService.search ? this.iqsZoneObjectsSaveService.search : this.$location.search()['search'] || '';
        this.searchCriteria = this.searchQuery;
        if (!this.$location.search()['zone_id'] && this.iqsZoneObjectsSaveService.zoneId) {
            this.$location.search('zone_id', this.iqsZoneObjectsSaveService.zoneId);
        }
        let currentState: string = this.iqsZoneObjectsSaveService.currState ? this.iqsZoneObjectsSaveService.currState : null;
        currentState = currentState == iqs.shell.States.Add || currentState == iqs.shell.States.Edit ? null : currentState;
        if (currentState === iqs.shell.States.Add) {
            this.new = this.iqsZoneObjectsSaveService.zone;
            this.edit = null;
        } else if (currentState === iqs.shell.States.Edit) {
            this.new = null;
            if (this.iqsZoneObjectsSaveService.zone) {
                this.edit = this.iqsZoneObjectsSaveService.zone;
            } else {
                this.edit = null;
                currentState = null;
            }
        }
        this.prepareNameCollection();
        this.currentState = currentState;
    }

    private prepareNameCollection() {
        this.nameCollection = [];
        _.each(this.iqsZonesViewModel.zones, (item: iqs.shell.Zone) => {
            if (this.edit && this.edit.id && this.edit.id != item.id || !this.edit || !this.edit.id) {
                if (item.name) this.nameCollection.push(item.name);
            }
        });
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
                ? 'ZONES_OBJECTS_DETAILS_NEW'
                : this.currentState === iqs.shell.States.Edit
                    ? 'ZONES_OBJECTS_DETAILS_EDIT'
                    : 'ZONES_OBJECTS_DETAILS';

            this.pipNavService.breadcrumb.items = [
                <pip.nav.BreadcrumbItem>{
                    title: "ZONES_OBJECTS", click: () => {
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
            this.pipNavService.breadcrumb.text = 'ZONES_OBJECTS';
            this.pipNavService.icon.showMenu();
        }

        this.pipNavService.actions.hide();
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

    public get selectedIndex() {
        return this.state != iqs.shell.States.Add ? this.iqsZonesViewModel.selectedIndex : -1;
    }

    public set selectedIndex(value: number) {

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
                    title: this.pipTranslate.translate('ZONES_OBJECTS_DELETE_CONFIRMATION_TITLE') + ' "' + this.collection[this.selectedIndex].name + '"?',
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
        if (!this.pipMedia('gt-sm')) {
            this.details = true;
            this.$location.search('details', 'details');
            this.appHeader();
        }
        this.new = new iqs.shell.Zone();
        this.edit = null;
        this.prepareNameCollection();
        this.currentState = iqs.shell.States.Add;


        if (this.pipMedia('gt-sm')) {
            this.focusedNewButton();
        }
    }

    public onSave(item: iqs.shell.Zone): void {
        if (this.transaction.busy() || !item) {
            return;
        }

        if (this.currentState == iqs.shell.States.Add) {
            item.org_id = this.iqsOrganization.orgId;
            item.type = iqs.shell.ZoneType.Object;
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

function configureZoneObjectsRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(ConfigZoneObjectsStateName, {
            url: '/zone_objects?zone_id&search&section&details',
            reloadOnSearch: false,
            controller: ZoneObjectsController,
            auth: true,
            controllerAs: '$ctrl',
            templateUrl: 'config/zone_objects/ZoneObjects.html'
        });
}

function configureZoneObjectsAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.manager;
    let accessConfig: any = {
        addZone: iqs.shell.AccessRole.manager,
        editZone: iqs.shell.AccessRole.manager,
        deleteZone: iqs.shell.AccessRole.manager
    };
    iqsAccessConfigProvider.registerStateAccess(ConfigZoneObjectsStateName, accessLevel);
    iqsAccessConfigProvider.registerStateConfigure(ConfigZoneObjectsStateName, accessConfig);
}

(() => {

    angular
        .module('iqsConfigZoneObjects', [
            'pipNav', 'iqsZones.ViewModel',
            'iqsGlobalSearch',

            'iqsAccessConfig',
            'iqsZoneObjectsEmptyPanel',
            'iqsDetailsZoneObjectsPanel',

            'iqsConfigZoneObjects.SaveService'

        ])
        .config(configureZoneObjectsRoute)
        .config(configureZoneObjectsAccess);
})();
