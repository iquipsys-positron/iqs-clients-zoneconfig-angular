import { IZoneSaveService } from '../IZoneSaveService';
import { IEventRulesMultiSelectDialogService } from '../../../common/dialogs/rules_multiselect_dialog/IEventRulesMultiSelectDialogService';

let async = require('async');

class ZonesTabs {
    title: string;
    id: number;
}

class ZoneParams {
    public item: iqs.shell.Zone;
}

class ZoomParams {
    public zoom: number;
}

interface IZonePanelBindings {
    [key: string]: any;

    onZoneEdit: any;
    onZoneDelete: any;
    onZoomChange: any;
    zoom: any;
    mapOptions: any;
    item: any;
    ngDisabled: any;
    transaction: any;
    details: any;
    mapControl: any;
}

const ZonePanelBindings: IZonePanelBindings = {
    onZoneEdit: '&iqsEdit',
    onZoneDelete: '&iqsDelete',
    onZoomChange: '&iqsZoomChange',
    zoom: '=iqsZoom',
    mapOptions: '<iqsMapOptions',
    item: '<?iqsZoneItem',
    ngDisabled: '&?',
    transaction: '=?iqsTransaction',
    details: '<?iqsDetails',
    mapControl: '&?iqsMapControl'
}

class ZonePanelChanges implements ng.IOnChangesObject, IZonePanelBindings {
    [key: string]: ng.IChangesObject<any>;

    onZoneEdit: ng.IChangesObject<() => ng.IPromise<void>>;
    onZoneDelete: ng.IChangesObject<() => ng.IPromise<void>>;
    onZoomChange: ng.IChangesObject<() => ng.IPromise<void>>;
    zoom: ng.IChangesObject<number>;
    mapOptions: ng.IChangesObject<any>;
    item: ng.IChangesObject<iqs.shell.Zone>;
    ngDisabled: ng.IChangesObject<() => ng.IPromise<void>>;
    transaction: ng.IChangesObject<pip.services.Transaction>;
    details: ng.IChangesObject<boolean>;
    mapControl: ng.IChangesObject<() => ng.IPromise<void>>;
}

class ZonePanelController implements ng.IController {
    public $onInit() { }
    public item: iqs.shell.Zone;
    public zoom: number;
    public mapOptions: any;
    public transaction: pip.services.Transaction;
    public onZoneEdit: () => void;
    public onZoneDelete: () => void;
    public onZoomChange: (value: ZoomParams) => void;
    public ngDisabled: () => boolean;
    public showTabs: boolean = false;
    public error: string = '';
    public startPause: boolean = true;
    public details: boolean;
    public zoneType: iqs.shell.TypeCollection;
    public severityCollection: iqs.shell.TypeNumericCollection;
    public section: number;
    public sections: ZonesTabs[] = [
        { title: 'ZONE_TAB_POSITION', id: 0 },
        { title: 'ZONE_TAB_RULES', id: 1 }
    ];

    private _mapControl: any;
    private ruleCollection: iqs.shell.EventRule[];
    public rulesInclude: iqs.shell.EventRule[];
    public rulesExclude: iqs.shell.EventRule[];
    private debounceUpdateEventRules: Function;
    public objectType: string;

    public zoneOptions: any = {
        fill: 'fill',
        stroke: 'stroke',
        radius: 'distance'
    };
    public accessConfig: any;
    private cf: Function[] = [];

    constructor(
        private $element: JQuery,
        private $location: ng.ILocationService,
        private $timeout: ng.ITimeoutService,
        $scope: ng.IScope,
        $rootScope: ng.IRootScopeService,
        private $state: ng.ui.IStateService,
        private iqsEventRulesViewModel: iqs.shell.IEventRulesViewModel,
        private iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        public pipMedia: pip.layouts.IMediaService,
        private iqsZoneSaveService: IZoneSaveService,
        private iqsZonesViewModel: iqs.shell.IZonesViewModel,
        private iqsEventRulesMultiSelectDialog: IEventRulesMultiSelectDialogService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        $element.addClass('iqs-zone-details');
        const runWhenReady = () => {
            this.accessConfig = iqsAccessConfig.getStateConfigure().access;
            this.zoneType = this.iqsTypeCollectionsService.getZoneType();
            this.severityCollection = this.iqsTypeCollectionsService.getSeverity();

            this.section = this.$location.search()['section'] || this.iqsZoneSaveService.section || this.sections[0].id;
            this.selectSection(this.section);

            this.objectType = iqs.shell.SearchObjectTypes.Zone;

            this.prepare();
            this.debounceUpdateEventRules = _.debounce((addToInclude: iqs.shell.EventRule[], removeFromInclude: iqs.shell.EventRule[], addToExclude: iqs.shell.EventRule[], removeFromExclude: iqs.shell.EventRule[]) => {
                this.updateEventRules(addToInclude, removeFromInclude, addToExclude, removeFromExclude);
            }, 500);

            // fill rules description
            this.ruleCollection = this.iqsEventRulesViewModel.getEventRulesWithDescription();
        };
        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
    }

    public $onDestroy() {
        this.iqsZoneSaveService.section = this.section;
        for (const f of this.cf) { f(); }
    }

    private prepare() {
        if (this.item) {
            this.rulesInclude = this.iqsEventRulesViewModel.getEventRulesWithIncludeZone(this.item.id);
            this.rulesExclude = this.iqsEventRulesViewModel.getEventRulesWithExcludeZone(this.item.id);
            this.error = '';
        }
    }

    public $onChanges(changes: ZonePanelChanges): void {
        this.prepare();
    }

    private updateEventRules(addToInclude: iqs.shell.EventRule[], removeFromInclude: iqs.shell.EventRule[], addToExclude: iqs.shell.EventRule[], removeFromExclude: iqs.shell.EventRule[]): void {
        let collection: iqs.shell.EventRule[] = [];
        let ruleCollection: iqs.shell.EventRule[] = this.iqsEventRulesViewModel.getCollection();
        // rules id was changed
        let changed: string[] = [];

        // add to include zone to rules
        _.each(addToInclude, (rule: iqs.shell.EventRule) => {
            let index = _.findIndex(ruleCollection, { id: rule.id });
            if (index > -1) {
                if (!ruleCollection[index].include_zone_ids) {
                    ruleCollection[index].include_zone_ids = [];
                }

                if (!ruleCollection[index].all_zones && ruleCollection[index].include_zone_ids.indexOf(this.item.id) == -1) {
                    ruleCollection[index].include_zone_ids.push(this.item.id);
                    if (changed.indexOf(rule.id) == -1) {
                        changed.push(rule.id);
                    }
                }

                // remove from exclude
                let pos = ruleCollection[index].exclude_zone_ids.indexOf(this.item.id);
                if (pos !== -1) {
                    ruleCollection[index].exclude_zone_ids.splice(pos, 1);
                    if (changed.indexOf(rule.id) == -1) {
                        changed.push(rule.id);
                    }
                }
            }
        });

        // add to exclude zone to rules
        _.each(addToExclude, (rule: iqs.shell.EventRule) => {
            let index = _.findIndex(ruleCollection, { id: rule.id });
            if (index > -1) {
                if (!ruleCollection[index].exclude_zone_ids) {
                    ruleCollection[index].exclude_zone_ids = [];
                }
                if (ruleCollection[index].exclude_zone_ids.indexOf(this.item.id) == -1) {
                    ruleCollection[index].exclude_zone_ids.push(this.item.id);
                    if (changed.indexOf(rule.id) == -1) {
                        changed.push(rule.id);
                    }
                }

                // remove from include 
                let pos = ruleCollection[index].include_zone_ids.indexOf(this.item.id);
                if (pos !== -1) {
                    ruleCollection[index].include_zone_ids.splice(pos, 1);
                    if (changed.indexOf(rule.id) == -1) {
                        changed.push(rule.id);
                    }
                }
            }
        });

        // remove from include zone to rules
        _.each(removeFromInclude, (rule: iqs.shell.EventRule) => {
            let index = _.findIndex(ruleCollection, { id: rule.id });
            if (index > -1) {
                if (!ruleCollection[index].all_zones && ruleCollection[index].include_zone_ids) {
                    let pos = ruleCollection[index].include_zone_ids.indexOf(this.item.id);
                    if (pos !== -1) {
                        ruleCollection[index].include_zone_ids.splice(pos, 1);
                        if (changed.indexOf(rule.id) == -1) {
                            changed.push(rule.id);
                        }
                    }
                }
                // add to exclude
                else if (ruleCollection[index].all_zones) {
                    if (!ruleCollection[index].exclude_zone_ids) {
                        ruleCollection[index].exclude_zone_ids = [];
                    }
                    if (ruleCollection[index].exclude_zone_ids.indexOf(this.item.id) == -1) {
                        ruleCollection[index].exclude_zone_ids.push(this.item.id);
                        if (changed.indexOf(rule.id) == -1) {
                            changed.push(rule.id);
                        }
                    }
                }
            }
        });

        // remove from exclude zone to rules
        _.each(removeFromExclude, (rule: iqs.shell.EventRule) => {
            let index = _.findIndex(ruleCollection, { id: rule.id });
            if (index > -1) {
                if (ruleCollection[index].exclude_zone_ids) {
                    let pos = ruleCollection[index].exclude_zone_ids.indexOf(this.item.id);
                    if (pos !== -1) {
                        ruleCollection[index].exclude_zone_ids.splice(pos, 1);
                        if (changed.indexOf(rule.id) == -1) {
                            changed.push(rule.id);
                        }
                    }
                }
            }
        });

        // filters changed rules
        collection = _.filter(ruleCollection, (rule: iqs.shell.EventRule) => {
            return changed.indexOf(rule.id) > -1;
        });
        if (this.transaction) {
            this.transaction.begin('RULES_UPDATE');
        }
        // update changed rules
        async.each(collection,
            (item, callback) => {
                this.iqsEventRulesViewModel.updateEventRuleById(item.id, item, () => {
                    callback();
                },
                    (error) => {
                        callback(error);
                    })
            },
            (error, result) => {
                if (error) {
                    this.error = 'RULES_NOT_UPDATED';
                }
                if (this.transaction) {
                    this.prepare();
                    this.transaction.end();
                }
            });
    }

    public onIncludeEventRule() {
        this.iqsEventRulesMultiSelectDialog.show(
            {
                dialogTitle: 'ZONES_EVENT_RULE_INCLUDE_TITLE',
                initCollection: this.rulesInclude,
                ruleCollection: this.ruleCollection,
                addButtonLabel: 'ZONE_DIALOG_INCLUDE_ADD'
            },
            (res: iqs.shell.EventRule[]) => {
                let removeFromInclude: iqs.shell.EventRule[] = [];
                let addToInclude: iqs.shell.EventRule[] = [];
                // add to include
                _.each(res, (rule: iqs.shell.EventRule) => {
                    if (_.findIndex(this.rulesInclude, { id: rule.id }) == -1) {
                        addToInclude.push(rule);
                    }
                });
                // remove from include
                _.each(this.rulesInclude, (rule: iqs.shell.EventRule) => {
                    if (_.findIndex(res, { id: rule.id }) == -1) {
                        removeFromInclude.push(rule);
                    }
                });

                this.rulesInclude = res;
                this.updateEventRules(addToInclude, removeFromInclude, [], []);
            },
            () => {

            });
    }

    public onExcludeEventRule() {
        this.iqsEventRulesMultiSelectDialog.show(
            {
                dialogTitle: 'ZONES_EVENT_RULE_EXCLUDE_TITLE',
                initCollection: this.rulesExclude,
                ruleCollection: this.ruleCollection,
                addButtonLabel: 'ZONE_DIALOG_EXCLUDE_ADD'
            },
            (res: iqs.shell.EventRule[]) => {
                let removeFromExclude: iqs.shell.EventRule[] = [];
                let addToExclude: iqs.shell.EventRule[] = [];
                // add to exclude
                _.each(res, (rule: iqs.shell.EventRule) => {
                    if (_.findIndex(this.rulesExclude, { id: rule.id }) == -1) {
                        addToExclude.push(rule);
                    }
                });
                // remove from exclude
                _.each(this.rulesExclude, (rule: iqs.shell.EventRule) => {
                    if (_.findIndex(res, { id: rule.id }) == -1) {
                        removeFromExclude.push(rule);
                    }
                });

                this.rulesExclude = res;
                this.updateEventRules([], [], addToExclude, removeFromExclude);
            },
            () => {

            });
    }
    public onDeleteEventRule(type, item) {
        if (this.ngDisabled && this.ngDisabled()) return;

        switch (type) {
            case 'rulesInclude':
                _.remove(this.rulesInclude, { id: item.id });
                let removeFromInclude: iqs.shell.EventRule[] = [];
                removeFromInclude.push(item);
                this.updateEventRules([], removeFromInclude, [], []);
                break;
            case 'rulesExclude':
                _.remove(this.rulesExclude, { id: item.id });
                let removeFromExclude: iqs.shell.EventRule[] = [];
                removeFromExclude.push(item);
                this.updateEventRules([], [], [], removeFromExclude);
                break;
            default:
                break;
        }
    }

    public selectSection(id: number) {
        if (this.section == 0) {
            this.startPause = true;
            this.$timeout(() => {
                this.startPause = false;
            }, 300);
        }
        this.$location.search('section', this.section);
    }

    public onEdit(item: iqs.shell.Zone): void {
        if (this.onZoneEdit) {
            this.onZoneEdit();
        }
    }

    public onDelete(item: iqs.shell.Zone): void {
        if (this.onZoneDelete) {
            this.onZoneDelete();
        }
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

    public get polygons() {
        return this.iqsZonesViewModel.polygons;
    }

    public get lines() {
        return this.iqsZonesViewModel.lines;
    }

    public get circles() {
        return this.iqsZonesViewModel.circles;
    }
}

(() => {
    angular
        .module('iqsDetailsZonePanel', [
            'iqsEventRulesMultiSelectDialog',
            'iqsFormats.EventRuleFilter',
        ])
        .component('iqsDetailsZonePanel', {
            bindings: ZonePanelBindings,
            transclude: true,
            templateUrl: 'config/zones/panels/DetailsZonePanel.html',
            controller: ZonePanelController,
            controllerAs: '$ctrl'
        })
})();
