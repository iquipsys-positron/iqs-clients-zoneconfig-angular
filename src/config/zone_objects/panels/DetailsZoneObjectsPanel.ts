import { IZoneObjectsSaveService } from '../IZoneObjectsSaveService';
import { IEventRulesMultiSelectDialogService } from '../../../common';

let async = require('async');

class ZonesTabs {
    title: string;
    id: number;
}

class ZoneParams {
    public item: iqs.shell.Zone;
}

interface IZoneObjectsPanelBindings {
    [key: string]: any;

    onZoneEdit: any;
    onZoneDelete: any;
    onZoneSave: any;
    onZoneCancel: any;
    zone: any;
    newItem: any;
    nameCollection: any;
    editItem: any;
    ngDisabled: any;
    transaction: any;
    details: any;
}

const ZoneObjectsPanelBindings: IZoneObjectsPanelBindings = {
    onZoneEdit: '&iqsEdit',
    onZoneDelete: '&iqsDelete',
    onZoneSave: '&iqsSave',
    onZoneCancel: '&iqsCancel',
    zone: '<?iqsItem',
    newItem: '<?iqsNewItem',
    editItem: '<?iqsEditItem',
    nameCollection: '<?iqsNameCollection',
    ngDisabled: '&?',
    transaction: '=?iqsTransaction',
    details: '<?iqsDetails'
}

class ZoneObjectsPanelChanges implements ng.IOnChangesObject, IZoneObjectsPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    onZoneEdit: ng.IChangesObject<() => ng.IPromise<void>>;
    onZoneDelete: ng.IChangesObject<() => ng.IPromise<void>>;
    onZoneSave: ng.IChangesObject<() => ng.IPromise<void>>;
    onZoneCancel: ng.IChangesObject<() => ng.IPromise<void>>;
    zone: ng.IChangesObject<iqs.shell.Zone>;
    newItem: ng.IChangesObject<iqs.shell.Zone>;
    editItem: ng.IChangesObject<iqs.shell.Zone>;
    nameCollection: ng.IChangesObject<string[]>;
    ngDisabled: ng.IChangesObject<() => ng.IPromise<void>>;
    transaction: ng.IChangesObject<pip.services.Transaction>;
    details: ng.IChangesObject<boolean>;
}

class ZoneObjectsPanelController implements ng.IController {
    public $onInit() { }
    public item: iqs.shell.Zone;
    public transaction: pip.services.Transaction;
    public onZoneEdit: () => void;
    public onZoneDelete: () => void;
    public zone: iqs.shell.Zone;
    public newItem: iqs.shell.Zone;
    public editItem: iqs.shell.Zone;
    public onZoneSave: (eventTempl: ZoneParams) => void;
    public onZoneCancel: () => void;
    public ngDisabled: () => boolean;
    public accessConfig: any;
    public error: string = '';
    public details: boolean;
    public zoneType: iqs.shell.TypeCollection;
    public severityCollection: iqs.shell.TypeNumericCollection;
    public section: number;
    public sections: ZonesTabs[] = [
        { title: 'ZONE_TAB_POSITION', id: 0 },
        { title: 'ZONE_TAB_RULES', id: 1 }
    ];
    private ruleCollection: iqs.shell.EventRule[];
    public rulesInclude: iqs.shell.EventRule[];
    public rulesExclude: iqs.shell.EventRule[];
    public objectInclude: iqs.shell.MultiSelectDialogData[];
    public objectExclude: iqs.shell.MultiSelectDialogData[];
    private debounceUpdateEventRules: Function;
    private debounceSave: Function;
    public objectType: string;
    public isEdit: boolean;
    public form: any;
    public touchedErrorsWithHint: Function;
    public nameCollection: string[];
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        private $element: JQuery,
        private $location: ng.ILocationService,
        private $scope: ng.IScope,
        private $state: ng.ui.IStateService,
        private iqsEventRulesViewModel: iqs.shell.IEventRulesViewModel,
        private iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        public pipMedia: pip.layouts.IMediaService,
        private iqsZoneObjectsSaveService: IZoneObjectsSaveService,
        private iqsObjectsViewModel: iqs.shell.IObjectsViewModel,
        private pipFormErrors: pip.errors.IFormErrorsService,
        private iqsMultiSelectDialog: iqs.shell.IMultiSelectDialogService,
        private iqsObjectGroupsViewModel: iqs.shell.IObjectGroupsViewModel,
        private iqsEventRulesMultiSelectDialog: IEventRulesMultiSelectDialogService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        $element.addClass('iqs-zone-objects-details');
        const runWhenReady = () => {
            this.accessConfig = iqsAccessConfig.getStateConfigure().access;
            this.zoneType = this.iqsTypeCollectionsService.getZoneType();
            this.severityCollection = this.iqsTypeCollectionsService.getSeverity();
            this.touchedErrorsWithHint = pipFormErrors.touchedErrorsWithHint;

            this.section = this.$location.search()['section'] || this.iqsZoneObjectsSaveService.section || this.sections[0].id;
            this.selectSection(this.section);

            this.objectType = iqs.shell.SearchObjectTypes.Zone;


            if (this.newItem != null) {
                this.item = this.newItem;
                this.isEdit = true;
                return;
            } else if (this.editItem != null) {
                this.item = this.editItem;
                this.isEdit = true;
                return;
            } else {
                this.item = this.zone;
                this.isEdit = false;
            }
            this.prepare();

            this.debounceUpdateEventRules = _.debounce((addToInclude: iqs.shell.EventRule[], removeFromInclude: iqs.shell.EventRule[], addToExclude: iqs.shell.EventRule[], removeFromExclude: iqs.shell.EventRule[]) => {
                this.updateEventRules(addToInclude, removeFromInclude, addToExclude, removeFromExclude);
            }, 500);

            // fill rules description
            this.ruleCollection = this.iqsEventRulesViewModel.getEventRulesWithDescription();

            this.debounceSave = _.debounce(() => {
                this.onZoneSave({ item: this.item });
            }, 500);
        };
        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
    }

    public $onDestroy() {
        this.iqsZoneObjectsSaveService.section = this.section;
        for (const f of this.cf) { f(); }
    }

    private getCollection(collection: any[], collectionIds: string[], type?: string): iqs.shell.MultiSelectDialogData[] {
        let result: iqs.shell.MultiSelectDialogData[] = [];

        _.each(collectionIds, (id: string) => {
            let index = _.findIndex(collection, { id: id });
            if (index != -1) {
                let item = collection[index];
                item.object_type = type;
                result.push(item);
            }
        });

        return result;
    }

    public $onChanges(changes: ZoneObjectsPanelChanges): void {
        let change: boolean = false;

        if (changes.newItem) {
            if (!_.isEqual(this.newItem, changes.newItem.previousValue)) {
                if (this.newItem != null) {
                    this.item = this.newItem;
                    this.isEdit = true;
                    this.prepare();
                    return;
                }
            }
        }

        if (changes.editItem) {
            if (!_.isEqual(this.editItem, changes.editItem.previousValue)) {
                if (this.editItem != null) {
                    this.item = this.editItem;
                    this.isEdit = true;
                    this.prepare();
                    return;
                }
            }
        }

        if (changes.zone) {
            if (!_.isEqual(this.zone, changes.zone.previousValue)) {
                this.item = this.zone;
                this.isEdit = false;
                this.prepare();

                return;
            }
        }
        if (!this.newItem && !this.editItem) {
            this.item = this.zone;
            this.isEdit = false;
            this.prepare();
        }
    }

    private fillObjects(): void {

        let includeObjects: iqs.shell.MultiSelectDialogData[];
        let includeObjectGroups: iqs.shell.MultiSelectDialogData[];
        let excludeObjects: iqs.shell.MultiSelectDialogData[];
        let excludeObjectGroups: iqs.shell.MultiSelectDialogData[];

        includeObjects = this.getCollection(this.iqsObjectsViewModel.allObjects, this.item.include_object_ids, iqs.shell.SearchObjectTypes.ControlObject);
        includeObjectGroups = this.getCollection(this.iqsObjectGroupsViewModel.getCollection(
            () => {
                this.prepare();
            }
        ), this.item.include_group_ids, iqs.shell.SearchObjectTypes.ObjectGroup);
        excludeObjects = this.getCollection(this.iqsObjectsViewModel.allObjects, this.item.exclude_object_ids, iqs.shell.SearchObjectTypes.ControlObject);
        excludeObjectGroups = this.getCollection(this.iqsObjectGroupsViewModel.getCollection(
            () => {
                this.prepare();
            }
        ), this.item.exclude_group_ids, iqs.shell.SearchObjectTypes.ObjectGroup);

        this.objectInclude = _.unionBy(includeObjects, includeObjectGroups, 'id');
        this.objectExclude = _.unionBy(excludeObjects, excludeObjectGroups, 'id');
    }

    private prepare() {
        if (this.item) {
            this.rulesInclude = this.iqsEventRulesViewModel.getEventRulesWithIncludeZone(this.item.id);
            this.rulesExclude = this.iqsEventRulesViewModel.getEventRulesWithExcludeZone(this.item.id);
            this.error = '';

            this.fillObjects();
        }
    }

    private getIds(collection: any[], entityType?: string): string[] {
        let result: string[] = [];
        _.each(collection, (item: any) => {
            if (entityType && item.object_type == entityType) {
                result.push(item.id);
            }
        });

        return result;
    }

    public onIncludeObject() {
        this.iqsMultiSelectDialog.show(
            {
                dialogTitle: 'RULES_OBJECT_INCLUDE_TITLE',
                entityType: iqs.shell.SearchObjectTypes.ObjectsAndGroups,
                initCollection: this.objectInclude,
                configState: 'app.objects',
                addButtonLabel: 'EVENT_RULE_DIALOG_INCLUDE_ADD'
            },
            (res: iqs.shell.SearchResult[]) => {
                this.item.include_object_ids = this.getIds(res, iqs.shell.SearchObjectTypes.ControlObject);
                this.item.include_group_ids = this.getIds(res, iqs.shell.SearchObjectTypes.ObjectGroup);
                this.error = '';
                this.fillObjects();
            },
            () => {

            });
    }

    public onExcludeObject() {
        this.iqsMultiSelectDialog.show(
            {
                dialogTitle: 'RULES_OBJECT_EXCLUDE_TITLE',
                entityType: iqs.shell.SearchObjectTypes.ObjectsAndGroups,
                initCollection: this.objectExclude,
                configState: 'app.objects',
                addButtonLabel: 'EVENT_RULE_DIALOG_EXCLUDE_ADD'
            },
            (res: iqs.shell.SearchResult[]) => {
                this.item.exclude_object_ids = this.getIds(res, iqs.shell.SearchObjectTypes.ControlObject);
                this.item.exclude_group_ids = this.getIds(res, iqs.shell.SearchObjectTypes.ObjectGroup);
                this.error = '';
                this.fillObjects();
            },
            () => {

            });
    }

    public onDeleteEntry(type, item) {
        if (this.ngDisabled && this.ngDisabled()) return;

        switch (type) {
            case 'objectInclude':
                _.remove(this.objectInclude, { id: item.id });
                this.item.include_object_ids = this.getIds(this.objectInclude, iqs.shell.SearchObjectTypes.ControlObject);
                this.item.include_group_ids = this.getIds(this.objectInclude, iqs.shell.SearchObjectTypes.ObjectGroup);
                break;
            case 'objectExclude':
                _.remove(this.objectExclude, { id: item.id });
                this.item.exclude_object_ids = this.getIds(this.objectExclude, iqs.shell.SearchObjectTypes.ControlObject);
                this.item.exclude_group_ids = this.getIds(this.objectExclude, iqs.shell.SearchObjectTypes.ObjectGroup);
                break;
            default:
                break;
        }
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
        this.$location.search('section', this.section);
    }

    public onEdit(item: iqs.shell.Zone): void {
        this.isEdit = true;
        if (this.onZoneEdit) {
            this.onZoneEdit();
        }
    }

    public onDelete(item: iqs.shell.Zone): void {
        if (this.onZoneDelete) {
            this.onZoneDelete();
        }
    }

    public $postLink() {
        this.form = this.$scope.form;
    }

    public onFormInit(form1) {
        this.form = this.$scope.form;
    }

    public onSaveClick(): void {
        if (this.form && this.form.$invalid) {
            this.pipFormErrors.resetFormErrors(this.form, true);

            return;
        }

        if (this.onZoneSave) {
            if (!this.error) {
                this.onZoneSave({ item: this.item });
                this.pipFormErrors.resetFormErrors(this.form, false);
            }
        }
    }

    public onCancelClick(): void {
        if (this.onZoneCancel) {
            this.onZoneCancel();
        }
    }

}

(() => {
    angular
        .module('iqsDetailsZoneObjectsPanel', [
            'iqsEventRulesMultiSelectDialog',
            'iqsMultiSelectDialog',
            'iqsFormats.EventRuleFilter',
        ])
        .component('iqsDetailsZoneObjectsPanel', {
            bindings: ZoneObjectsPanelBindings,
            templateUrl: 'config/zone_objects/panels/DetailsZoneObjectsPanel.html',
            controller: ZoneObjectsPanelController,
            controllerAs: '$ctrl'
        })
})();
