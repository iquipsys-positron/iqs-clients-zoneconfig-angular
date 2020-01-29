{

    function configureConfigLocationsTranslations(
        pipTranslateProvider: pip.services.ITranslateProvider
    ) {
        pipTranslateProvider.translations('en', {
            LOCATION_NAME: 'Location name',
            LOCATION_EMPTY_TITLE: 'Locations were not found',
            LOCATION_EMPTY_SUBTITLE: 'Locations allow to navigate the map and set the positions of events',
            LOCATION_EMPTY_ADD_BUTTON: 'Add location',
            LOCATION_LOADING_TITLE: 'Loading locations...',
            TO_CENTER: 'To the organization center',

            LOCATION_NEW_LOCATION: 'New Location',
            LOCATION_EDIT: 'Edit',
            LOCATION_DELETE: 'Delete',
            LOCATION_SAVE: 'Save',
            LOCATION_DELETE_CONFIRMATION_TITLE: 'Delete the location',
            LOCATION_DETAILS: 'Location',
            LOCATION_DETAILS_NEW: 'New location',
            LOCATION_DETAILS_EDIT: 'Edit location',
            LOCATION_CANCEL: 'Cancel',
            LOCATION_NOT_POSITION: 'The location position is not set. Use map to define the position',
            LOCATION_ADD_POINT: 'Add point',
            LOCATION_LABEL_UNIQUE_ERROR: 'The entered label is already in use',

            LOCATION_ID: 'System identifier'
        });

        pipTranslateProvider.translations('ru', {
            LOCATION_NAME: 'Название места',
            LOCATION_EMPTY_TITLE: 'Места не найдены',
            LOCATION_EMPTY_SUBTITLE: 'Места позволяют быстро перемещаться по карте и указывать позицию различных событий',
            LOCATION_EMPTY_ADD_BUTTON: 'Добавить место',
            LOCATION_LOADING_TITLE: 'Загрузка мест...',
            TO_CENTER: 'К центру площадки',

            LOCATION_NEW_LOCATION: 'Новое место',
            LOCATION_EDIT: 'Изменить',
            LOCATION_DELETE: 'Удалить',
            LOCATION_SAVE: 'Сохранить',
            LOCATION_DELETE_CONFIRMATION_TITLE: 'Удалить место',
            LOCATION_DETAILS: 'Место',
            LOCATION_DETAILS_NEW: 'Новое место',
            LOCATION_DETAILS_EDIT: 'Редактирование места',
            LOCATION_CANCEL: 'Отменить',
            LOCATION_NOT_POSITION: 'Позиция места не определена. Определите позицию на карте',
            LOCATION_ADD_POINT: 'Добавить позицию',
            LOCATION_LABEL_UNIQUE_ERROR: 'Введеная метка уже используется',

            LOCATION_ID: 'Системный идентификатор'
        });
    }

    angular
        .module('iqsConfigLocations')
        .config(configureConfigLocationsTranslations);

}
