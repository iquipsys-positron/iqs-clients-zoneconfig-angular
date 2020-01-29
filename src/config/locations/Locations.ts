import { ILocationsSaveService } from './ILocationsSaveService';

export const ConfigLocationsStateName: string = 'app.locations';

class ConfigLocationsController implements ng.IController {
    public $onInit() { }
    private cf: Function[] = [];
    private mediaSizeGtSm: boolean;
    public details: boolean;
    public searchCriteria: string = '';
    public searchQuery: string = '';
    public currentState: string;
    public new: iqs.shell.Location;
    public edit: iqs.shell.Location;
    public accessConfig: any;
    public mapZoom: number;
    public nameCollection: string[];
    public isPreLoading: boolean = true;

    constructor(
        private $window: ng.IWindowService,
        private $state: ng.ui.IStateService,
        private $location: ng.ILocationService,
        $scope: ng.IScope,
        private pipNavService: pip.nav.INavService,
        private pipMedia: pip.layouts.IMediaService,
        private pipScroll: pip.services.IScrollService,
        private pipTranslate: pip.services.ITranslateService,
        private pipConfirmationDialog: pip.dialogs.IConfirmationDialogService,
        private $rootScope: ng.IRootScopeService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private iqsLocationsViewModel: iqs.shell.ILocationsViewModel,
        private iqsLocationsSaveService: ILocationsSaveService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        this.restoreState();
        this.mediaSizeGtSm = this.pipMedia('gt-sm');

        const runWhenReady = () => {
            this.accessConfig = iqsAccessConfig.getStateConfigure().access;
            this.iqsLocationsViewModel.filter = null;
            this.iqsLocationsViewModel.isSort = true;
            this.iqsLocationsViewModel.reload(() => {
                let collection = this.iqsLocationsViewModel.getCollection(this.searchCriteria);
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
        this.iqsLocationsSaveService.locationId = this.collection && this.collection.length > 0 && this.selectedIndex > -1 ? this.collection[this.selectedIndex].id : null;
        this.iqsLocationsSaveService.currState = this.currentState;
        this.iqsLocationsSaveService.search = this.searchCriteria;
        this.iqsLocationsSaveService.location = this.new ? this.new : this.edit;
        this.iqsLocationsSaveService.zoom = this.mapZoom;
    }

    private restoreState() {
        this.searchQuery = this.iqsLocationsSaveService.search ? this.iqsLocationsSaveService.search : this.$location.search()['search'] || '';
        this.searchCriteria = this.searchQuery;
        if (!this.$location.search()['location_id'] && this.iqsLocationsSaveService.locationId) {
            this.$location.search('location_id', this.iqsLocationsSaveService.locationId);
        }
        this.currentState = this.iqsLocationsSaveService.currState ? this.iqsLocationsSaveService.currState : null;
        this.currentState = this.currentState == iqs.shell.States.Add || this.currentState == iqs.shell.States.Edit ? null : this.currentState;
        if (this.currentState === iqs.shell.States.Add) {
            this.new = this.iqsLocationsSaveService.location;
            this.edit = null;
        } else if (this.currentState === iqs.shell.States.Edit) {
            this.new = null;
            if (this.iqsLocationsSaveService.location) {
                this.edit = this.iqsLocationsSaveService.location;
            } else {
                this.edit = null;
                this.currentState = null;
            }

            this.new = null;
            this.edit = this.iqsLocationsSaveService.location;
        }
        this.mapZoom = this.iqsLocationsSaveService.zoom;
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
                ? 'LOCATION_DETAILS_NEW'
                : this.currentState === iqs.shell.States.Edit
                    ? 'LOCATION_DETAILS_EDIT'
                    : 'LOCATION_DETAILS';

            this.pipNavService.breadcrumb.items = [
                <pip.nav.BreadcrumbItem>{
                    title: "LOCATIONS", click: () => {
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
            this.pipNavService.breadcrumb.text = 'LOCATIONS';
            this.pipNavService.icon.showMenu();
        }

        this.pipNavService.actions.hide();
    }

    private focusedNewButton() {
        this.pipScroll.scrollTo('.pip-list-container', '#new-item', 300);
    }


    public selectItem(index: number) {
        if (this.state != iqs.shell.States.Data) { return };

        if (index !== undefined && index !== null) this.iqsLocationsViewModel.selectItem(index);
        if (!this.pipMedia('gt-sm')) {
            this.details = true;
            this.$location.search('details', 'details');
            this.appHeader();
        }
    }

    public get selectedIndex() {
        return this.state != iqs.shell.States.Add ? this.iqsLocationsViewModel.selectedIndex : -1;
    }

    public set selectedIndex(value: number) {

    }

    public get collection(): iqs.shell.Location[] {
        return this.iqsLocationsViewModel.getCollection(this.searchCriteria);
    }

    public get state(): string {
        // return 'empty'
        return this.currentState ? this.currentState : this.iqsLocationsViewModel.state;
    }

    public get transaction(): pip.services.Transaction {
        return this.iqsLocationsViewModel.getTransaction();
    }

    public get searchedCollection(): string[] {
        return this.iqsLocationsViewModel.searchedCollection;
    }

    public reload(): void {
        this.iqsLocationsViewModel.reload();
    }

    public onRetry() {
        this.$window.history.back();
    }

    private prepareNameCollection() {
        this.nameCollection = [];
        _.each(this.iqsLocationsViewModel.getCollection(), (item: iqs.shell.Location) => {
            if (this.edit && this.edit.id && this.edit.id != item.id || !this.edit || !this.edit.id) {
                if (item.name) this.nameCollection.push(item.name);
            }
        });
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
                    title: this.pipTranslate.translate('LOCATION_DELETE_CONFIRMATION_TITLE') + ' "' + this.collection[this.selectedIndex].name + '"?',
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
            this.iqsLocationsViewModel.getCollection(this.searchCriteria);
        }
    }

    public onCanselSearch() {
        this.searchCriteria = '';
        this.searchQuery = '';
        this.$location.search('search', this.searchCriteria);
        if (this.state == iqs.shell.States.Empty) {
            this.iqsLocationsViewModel.getCollection(this.searchCriteria);
        }
    }

    public onAdd() {
        if (!this.pipMedia('gt-sm')) {
            this.details = true;
            this.$location.search('details', 'details');
            this.appHeader();
        }

        this.new = new iqs.shell.Location();
        this.edit = null;
        this.prepareNameCollection();
        this.currentState = iqs.shell.States.Add;
        if (this.pipMedia('gt-sm')) {
            this.focusedNewButton();
        }
    }

    public onZoomChange(zoom: number) {
        this.mapZoom = zoom;
    }

    public onSave(item: iqs.shell.Location): void {
        if (this.transaction.busy() || !item) {
            return;
        }

        if (this.currentState == iqs.shell.States.Add) {
            item.org_id = this.iqsOrganization.orgId;
            this.iqsLocationsViewModel.create(
                item,
                (data: iqs.shell.Location) => {
                    this.currentState = null
                    this.new = null;
                    this.searchCriteria = '';
                    if (this.state == iqs.shell.States.Empty) {
                        this.iqsLocationsViewModel.getCollection(this.searchCriteria);
                    }
                },
                (error: any) => { }
            );
        } else if (this.currentState == iqs.shell.States.Edit) {
            this.iqsLocationsViewModel.updateLocationById(
                item.id,
                item,
                (data: iqs.shell.Location) => {
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

    public onDeleteItem(item: iqs.shell.Location) {
        if (this.transaction.busy()) {
            return;
        }

        if (item && item.id) {
            this.iqsLocationsViewModel.deleteLocationById(
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

function configureConfigLocationsRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(ConfigLocationsStateName, {
            url: '/locations?location_id&search&details',
            controller: ConfigLocationsController,
            reloadOnSearch: false,
            auth: true,
            controllerAs: '$ctrl',
            templateUrl: 'config/locations/Locations.html'
        });
}

function configureConfigLocationsAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.manager;
    let accessConfig: any = {
        addLocation: iqs.shell.AccessRole.manager,
        editLocation: iqs.shell.AccessRole.manager,
        deleteLocation: iqs.shell.AccessRole.manager
    }

    iqsAccessConfigProvider.registerStateAccess(ConfigLocationsStateName, accessLevel);

    iqsAccessConfigProvider.registerStateConfigure(ConfigLocationsStateName, accessConfig);
}

(() => {

    angular
        .module('iqsConfigLocations')
        .config(configureConfigLocationsRoute)
        .config(configureConfigLocationsAccess);
})();
