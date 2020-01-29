
{
    function declareZonesTranslateResources(pipTranslateProvider: pip.services.ITranslateProvider) {
        pipTranslateProvider.translations('en', {
            ZONES_EMPTY_TITLE: 'Geo-zones were not found',
            ZONES_EMPTY_SUBTITLE: 'Geo-zones define the areas of the organization to apply rules or locate events',
            ZONES_EMPTY_ADD_BUTTON: 'Add geo-zone',
            ZONES_LOADING_TITLE: 'Loading geo-zones...',
            ZONE_ID: 'System identifier',
            ZONES_SEARCH_PLACEHOLDER: 'Search zones...',
            ZONE_NEW_ZONE: 'New geo-zone',
            ZONES: 'Geo-zones',
            ZONE_DETAILS: 'Geo-zone',
            ZONE_DETAILS_NEW: 'New geo-zone',
            ZONE_DETAILS_EDIT: 'Edit geo-zone',
            ZONE_SAVE: 'Save',
            ZONE_CANCEL: 'Cancel',
            ZONE_EDIT: 'Edit',
            ZONE_DELETE: 'Delete',
            ZONE_DELETE_CONFIRMATION_TITLE: 'Delete the geo-zone',
            ZONE_NAME_LABEL: 'Zone name',
            ZONE_NAME_REQUIRED_ERROR: 'Enter the zone name',
            ZONE_TYPE_REQUERED: 'Create a zone',

            ZONE_ZOOM_IN: 'Zoom in',
            ZONE_ZOOM_OUT: 'Zoom out',
            ZONE_TO_CENTER: 'To the organization center',
            ZONE_CLEAR_MAP: 'Start over',
            ZONE_DRAW_LINE: 'Draw a line',
            ZONE_DRAW_POLYGON: 'Draw a poligon',
            ZONE_DRAW_CIRCLE: 'Draw a circle',
            ZONE_PAN: 'Pan the map',

            ZONES_EVENT_RULE_INCLUDE_TITLE: 'Rules apply',
            ZONE_DIALOG_INCLUDE_ADD: 'Apply',
            ZONES_EVENT_RULE_EXCLUDE_TITLE: 'Exclude from rules',
            ZONE_DIALOG_EXCLUDE_ADD: 'Exclude',

            ZONE_INCLUDE_EVENT_RULE_BUTTON: 'Include rule',
            ZONE_EXCLUDE_EVENT_RULE_BUTTON: 'Exclude rule',

            ZONE_TAB_POSITION: 'Location',
            ZONE_TAB_RULES: 'Rules',

            ZONE_INCLUDE_RULES_LABEL: 'Rules apply',
            ZONE_INCLUDE_RULES_EMPTY_LABEL: 'There are no rules to apply',
            ZONE_EXCLUDE_RULES_LABEL: 'Exclude from rules',
            ZONE_EXCLUDE_RULES_EMPTY_LABEL: 'The are no exclusions',
            ZONE_LINE_DISTANCE_LABEL: 'Line width',
            ZONE_LINE_DISTANCE_REQUIRED_ERROR: 'Enter the width in meters',
            ZONE_LINE_DISTANCE_NOTVALID_ERROR: 'The value is not a number or greater than allowed maximum (9999999)',
            ZONE_LINE_DISTANCE_MEASURE: 'm',
            ZONE_NOT_SET: 'The zone geometry is not set. Use map to define the geometry',
            ZONE_NAME_UNIQUE_ERROR: 'The entered zone name is already in use',
        });

        pipTranslateProvider.translations('ru', {
            ZONES_EMPTY_TITLE: 'Гео-зоны не найдены',
            ZONES_EMPTY_SUBTITLE: 'Гео-зоны определяют участки рабочей площадки в которых действуют определенные правила или происходят события',
            ZONES_EMPTY_ADD_BUTTON: 'Добавить гео-зону',
            ZONES_LOADING_TITLE: 'Загрузка гео-зон...',
            ZONE_ID: 'Системный идентификатор',
            ZONES_SEARCH_PLACEHOLDER: 'Найти зоны...',
            ZONE_NEW_ZONE: 'Новая гео-зона',
            ZONES: 'Гео-зоны',
            ZONE_DETAILS: 'Гео-зона',
            ZONE_DETAILS_NEW: 'Новая гео-зона',
            ZONE_DETAILS_EDIT: 'Редактирование гео-зоны',
            ZONE_SAVE: 'Сохранить',
            ZONE_CANCEL: 'Отменить',
            ZONE_EDIT: 'Изменить',
            ZONE_DELETE: 'Удалить',
            ZONE_DELETE_CONFIRMATION_TITLE: 'Удалить гео-зону',
            ZONE_NAME_LABEL: 'Название зоны',
            ZONE_NAME_REQUIRED_ERROR: 'Задайте название гео-зоны',
            ZONE_TYPE_REQUERED: 'Необходимо создать зону',

            ZONE_ZOOM_IN: 'Уменьшить масштаб',
            ZONE_ZOOM_OUT: 'Увеличить масштаб',
            ZONE_TO_CENTER: 'К центру площадки',
            ZONE_CLEAR_MAP: 'Начать заново',
            ZONE_DRAW_LINE: 'Нарисовать линию',
            ZONE_DRAW_POLYGON: 'Нарисовать область',
            ZONE_DRAW_CIRCLE: 'Нарисовать круг',
            ZONE_PAN: 'Передвинуть карту',

            ZONES_EVENT_RULE_INCLUDE_TITLE: 'Применить правила',
            ZONE_DIALOG_INCLUDE_ADD: 'Применить',
            ZONES_EVENT_RULE_EXCLUDE_TITLE: 'Исключения из правил',
            ZONE_DIALOG_EXCLUDE_ADD: 'Исключить',

            ZONE_INCLUDE_EVENT_RULE_BUTTON: 'Применить правило',
            ZONE_EXCLUDE_EVENT_RULE_BUTTON: 'Исключить из правила',

            ZONE_TAB_POSITION: 'Позиция',
            ZONE_TAB_RULES: 'Правила',

            ZONE_INCLUDE_RULES_LABEL: 'Применяются правила',
            ZONE_INCLUDE_RULES_EMPTY_LABEL: 'Применяемые правила не заданы',
            ZONE_EXCLUDE_RULES_LABEL: 'Исключается из правил',
            ZONE_EXCLUDE_RULES_EMPTY_LABEL: 'Нет исключений',
            ZONE_LINE_DISTANCE_LABEL: 'Ширина полосы',
            ZONE_LINE_DISTANCE_REQUIRED_ERROR: 'Введите ширину полосы в метрах',
            ZONE_LINE_DISTANCE_NOTVALID_ERROR: 'Введенное значение не является числом или больше допустимого значения (9999999)',
            ZONE_LINE_DISTANCE_MEASURE: 'м',
            ZONE_NOT_SET: 'Геометрия зоны не определена. Определите геометрию на карте.',
            ZONE_NAME_UNIQUE_ERROR: 'Введеное имя уже используется',
        });
    }

    angular
        .module('iqsConfigZones')
        .config(declareZonesTranslateResources);
}
