
{
    function declareZoneObjectsTranslateResources(pipTranslateProvider: pip.services.ITranslateProvider) {
        pipTranslateProvider.translations('en', {
            ZONES_OBJECTS: 'Object zones',
            ZONE_ID: 'System identifier',
            ZONES_OBJECTS_DELETE_CONFIRMATION_TITLE: 'Delete the zone',
            ZONES_OBJECTS_DETAILS_EDIT: 'Edit object zone',
            ZONES_OBJECTS_DETAILS_NEW: 'New object zone',
            ZONES_OBJECTS_DETAILS: 'Object zone',
            ZONE_OBJECTS_NEW_ZONE: 'New zone',
            ZONES_OBJECTS_EMPTY_TITLE: 'Object zones were not found',
            ZONES_OBJECTS_EMPTY_SUBTITLE1: 'Object zones around objects are used to create rules around moving objects.',
            ZONES_OBJECTS_EMPTY_SUBTITLE2: 'For instance: presence of a haul truck for more than 10 minutes around an excavator may indicate a queueing.',
            ZONES_OBJECTS_EMPTY_ADD_BUTTON: 'Add object zone',
            ZONES_OBJECTS_LOADING_TITLE: 'Loading object zones...',
            ZONE_OBJECTS_NAME_LABEL: 'Zone name',
            ZONE_OBJECTS_NAME_REQUIRED_ERROR: 'Enter zone name',
            ZONE_OBJECTS_RADIUS_LABEL: 'Radius around object',
            ZONE_OBJECTS_RADIUS_LABEL1: 'Radius around object',
            ZONE_OBJECTS_RADIUS_REQUIRED_ERROR: 'Enter the radius around the object in meters',
            ZONE_OBJECTS_RADIUS_NOTVALID_ERROR: 'The value is not a number or it is greater than allowed maximum (9999999)',
            ZONE_OBJECTS_RADIUS_MEASURE: 'm',
            ZONE_OBJECTS_SAVE: 'Save',
            ZONE_OBJECTS_CANCEL: 'Cancel',
            ZONE_OBJECTS_EDIT: 'Edit',
            ZONE_OBJECTS_DELETE: 'Delete',
            ZONE_OBJECTS_INCLUDE_OBJECT: 'Include objects',
            ZONE_OBJECTS_EXCLUDE_OBJECT: 'Exclude objects',
            ZONE_INCLUDE_OBJECTS_LABEL: 'Around objects',
            ZONE_INCLUDE_OBJECTS_EMPTY_LABEL: 'Applies to all objects',
            ZONE_EXCLUDE_OBJECTS_LABEL: 'Exclude objects',
            ZONE_EXCLUDE_OBJECTS_EMPTY_LABEL: 'There are no exclusions',
            ZONES_OBJECTS_SEARCH_PLACEHOLDER: 'Search zones...',
            RULES_OBJECT_INCLUDE_TITLE: 'Add objects or groups',
            RULES_OBJECT_EXCLUDE_TITLE: 'Exclude objects or groups',
            EVENT_RULE_DIALOG_INCLUDE_ADD: 'Include',
            EVENT_RULE_DIALOG_EXCLUDE_ADD: 'Exclude',
        });

        pipTranslateProvider.translations('ru', {
            ZONES_OBJECTS: 'Зоны объектов',
            ZONE_ID: 'Системный идентификатор',
            ZONES_OBJECTS_DELETE_CONFIRMATION_TITLE: 'Удалить зону',
            ZONES_OBJECTS_DETAILS_EDIT: 'Редактирование зоны объектов',
            ZONES_OBJECTS_DETAILS_NEW: 'Новая зона объектов',
            ZONES_OBJECTS_DETAILS: 'Зона объектов',
            ZONE_OBJECTS_NEW_ZONE: 'Новая зона',
            ZONES_OBJECTS_EMPTY_TITLE: 'Зоны объектов не найдены',
            ZONES_OBJECTS_EMPTY_SUBTITLE1: 'Зоны вокруг объектов позволяют создать правила, применяемые в зоне действия некоторых подвижных объектов. ',
            ZONES_OBJECTS_EMPTY_SUBTITLE2: 'Например: нахождение самосвала более 10 минут в зоне экскаватора может означать наличие очереди.',
            ZONES_OBJECTS_EMPTY_ADD_BUTTON: 'Добавить зону объектов',
            ZONES_OBJECTS_LOADING_TITLE: 'Загрузка зон объектов...',
            ZONE_OBJECTS_NAME_LABEL: 'Название зоны',
            ZONE_OBJECTS_NAME_REQUIRED_ERROR: 'Задайте название зоны',
            ZONE_OBJECTS_RADIUS_LABEL: 'Радиус вокруг объекта',
            ZONE_OBJECTS_RADIUS_LABEL1: 'радиус вокруг объекта',
            ZONE_OBJECTS_RADIUS_REQUIRED_ERROR: 'Введите радиус вокруг объекта в метрах',
            ZONE_OBJECTS_RADIUS_NOTVALID_ERROR: 'Введенное значение не является числом или больше допустимого значения (9999999)',
            ZONE_OBJECTS_RADIUS_MEASURE: 'м',
            ZONE_OBJECTS_SAVE: 'Сохранить',
            ZONE_OBJECTS_CANCEL: 'Отменить',
            ZONE_OBJECTS_EDIT: 'Изменить',
            ZONE_OBJECTS_DELETE: 'Удалить',
            ZONE_OBJECTS_INCLUDE_OBJECT: 'Выбрать объекты',
            ZONE_OBJECTS_EXCLUDE_OBJECT: 'Исключить объекты',
            ZONE_INCLUDE_OBJECTS_LABEL: 'Вокруг объектов',
            ZONE_INCLUDE_OBJECTS_EMPTY_LABEL: 'Действует для всех объектов',
            ZONE_EXCLUDE_OBJECTS_LABEL: 'Исключая объекты',
            ZONE_EXCLUDE_OBJECTS_EMPTY_LABEL: 'Нет исключений',
            ZONES_OBJECTS_SEARCH_PLACEHOLDER: 'Найти зоны...',
            RULES_OBJECT_INCLUDE_TITLE: 'Добавить объекты или группы',
            RULES_OBJECT_EXCLUDE_TITLE: 'Исключить объекты или группы',
            EVENT_RULE_DIALOG_INCLUDE_ADD: 'Добавить',
            EVENT_RULE_DIALOG_EXCLUDE_ADD: 'Исключить',
        });
    }

    angular
        .module('iqsConfigZoneObjects')
        .config(declareZoneObjectsTranslateResources);
}

