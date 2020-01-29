/// <reference path="../typings/tsd.d.ts" />
import './config';
import './config/Config';

class PositronConfigAppController implements ng.IController {
    public $onInit() { }
    public isChrome: boolean;

    constructor(
        $rootScope: ng.IRootScopeService,
        $state: ng.ui.IStateService,
        pipSystemInfo: pip.services.ISystemInfo,
    ) {
        "ngInject";

        this.isChrome = pipSystemInfo.browserName == 'chrome' && pipSystemInfo.os == 'windows';
    }
}

angular
    .module('iqsPositronConfigApp', [
        'iqsPositronConfig.Config',
        'iqsPositronConfig.Templates',
        'iqsOrganizations.Service',
        'iqsConfig'
    ])
    .controller('iqsPositronConfigAppController', PositronConfigAppController);


