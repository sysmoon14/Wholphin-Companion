function ensureWholphinStyles() {
    if (document.querySelector('link[data-wholphin-style="true"]')) {
        return;
    }

    var baseUrl = window.location.origin + '/web/';
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = baseUrl + 'configurationpage?name=WholphinCompanion.css&v=20260206';
    link.setAttribute('data-wholphin-style', 'true');
    document.head.appendChild(link);
}

ensureWholphinStyles();

var WholphinCompanionConfig = {
    pluginUniqueId: 'c54a4aaf-ffba-4a5a-b2de-8c0d38e21229'
};

var currentConfig = null;
var currentScopeKey = 'Global';
var collectionCache = [];
var nativeRowOptions = [
    { key: 'ContinueWatching', label: 'Continue Watching' },
    { key: 'NextUp', label: 'Next Up' },
    { key: 'ContinueWatchingCombined', label: 'Continue Watching (Combined)' },
    { key: 'RecentlyAddedMovies', label: 'Recently Added Movies' },
    { key: 'RecentlyAddedShows', label: 'Recently Added Shows' },
    { key: 'LatestMovies', label: 'Latest Movies' },
    { key: 'LatestShows', label: 'Latest Shows' },
    { key: 'BecauseYouWatched', label: 'Because You Watched' },
    { key: 'WatchItAgain', label: 'Watch it Again' }
];

function ensureConfigDefaults(config) {
    if (!config.LayoutProfiles || !Array.isArray(config.LayoutProfiles)) {
        config.LayoutProfiles = [];
    }
    if (!findProfileEntry('Global')) {
        config.LayoutProfiles.push({
            Key: 'Global',
            Profile: createEmptyProfile()
        });
    }
}

function createEmptyProfile() {
    return {
        HomeLayout: { Sections: [] },
        LibraryLayout: {},
        ThemeSettings: {}
    };
}

function paramsArrayToObject(paramsArray) {
    var paramsObject = {};
    if (!Array.isArray(paramsArray)) {
        return paramsObject;
    }
    paramsArray.forEach(function(entry) {
        if (entry && entry.Key) {
            paramsObject[entry.Key] = entry.Value || '';
        }
    });
    return paramsObject;
}

function paramsObjectToArray(paramsObject) {
    var paramsArray = [];
    Object.keys(paramsObject || {}).forEach(function(key) {
        paramsArray.push({
            Key: key,
            Value: String(paramsObject[key])
        });
    });
    return paramsArray;
}

function loadCollections() {
    var userId = ApiClient.getCurrentUserId ? ApiClient.getCurrentUserId() : null;
    var query = {
        IncludeItemTypes: 'BoxSet',
        Recursive: true,
        SortBy: 'SortName',
        SortOrder: 'Ascending'
    };

    var promise = null;
    if (ApiClient.getItems && userId) {
        promise = ApiClient.getItems(userId, query);
    } else if (ApiClient.getItems) {
        promise = ApiClient.getItems(query);
    }

    if (!promise) {
        collectionCache = [];
        return Promise.resolve();
    }

    return promise.then(function(result) {
        collectionCache = (result && result.Items) ? result.Items : [];
        refreshCollectionSelects();
    }).catch(function() {
        collectionCache = [];
        refreshCollectionSelects();
    });
}

function refreshCollectionSelects() {
    var selects = document.querySelectorAll('.wholphin-row-collection');
    selects.forEach(function(select) {
        var selected = select.value;
        populateCollectionSelect(select, selected);
    });
}

function populateCollectionSelect(select, selectedId) {
    select.innerHTML = '';

    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = collectionCache.length ? 'Select collection' : 'No collections found';
    select.appendChild(placeholder);

    collectionCache.forEach(function(collection) {
        var option = document.createElement('option');
        option.value = collection.Id;
        option.textContent = collection.Name;
        select.appendChild(option);
    });

    if (selectedId) {
        select.value = selectedId;
    }
}

function findProfileEntry(scopeKey) {
    if (!currentConfig || !Array.isArray(currentConfig.LayoutProfiles)) {
        return null;
    }
    return currentConfig.LayoutProfiles.find(function(entry) {
        return entry.Key === scopeKey;
    }) || null;
}

function ensureProfile(scopeKey) {
    ensureConfigDefaults(currentConfig);
    var entry = findProfileEntry(scopeKey);
    if (!entry) {
        entry = {
            Key: scopeKey,
            Profile: createEmptyProfile()
        };
        currentConfig.LayoutProfiles.push(entry);
    }
    if (!entry.Profile) {
        entry.Profile = createEmptyProfile();
    }
    return entry.Profile;
}

function loadUsers() {
    var scopeSelect = document.querySelector('#ScopeSelect');
    scopeSelect.innerHTML = '';

    var globalOption = document.createElement('option');
    globalOption.value = 'Global';
    globalOption.textContent = 'Global';
    scopeSelect.appendChild(globalOption);

    ApiClient.getUsers().then(function(users) {
        users.forEach(function(user) {
            var option = document.createElement('option');
            option.value = user.Id;
            option.textContent = user.Name;
            scopeSelect.appendChild(option);
        });
        scopeSelect.value = currentScopeKey;
    }).catch(function() {
        scopeSelect.value = currentScopeKey;
    });
}

function renderSections(profile) {
    var container = document.querySelector('#SectionsContainer');
    container.innerHTML = '';

    if (!profile.HomeLayout.Sections.length) {
        var emptyEl = document.createElement('div');
        emptyEl.className = 'wholphin-empty';
        emptyEl.textContent = 'No sections yet. Add one to start building your home screen.';
        container.appendChild(emptyEl);
        return;
    }

    profile.HomeLayout.Sections.forEach(function(section) {
        container.appendChild(createSectionElement(section));
    });

    if (window.Sortable) {
        Sortable.create(container, {
            handle: '.wholphin-section-handle',
            animation: 150
        });
    }
}

function createSectionElement(section) {
    var sectionEl = document.createElement('div');
    sectionEl.className = 'wholphin-section';

    var headerEl = document.createElement('div');
    headerEl.className = 'wholphin-section-header';

    var sectionHandle = document.createElement('span');
    sectionHandle.className = 'wholphin-section-handle';
    sectionHandle.textContent = '::';

    var titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'emby-input';
    titleInput.value = section.Title || '';
    titleInput.placeholder = 'Section title';

    var shuffleLabel = document.createElement('label');
    shuffleLabel.className = 'emby-checkbox-label';
    var shuffleInput = document.createElement('input');
    shuffleInput.type = 'checkbox';
    shuffleInput.is = 'emby-checkbox';
    shuffleInput.checked = !!section.ShuffleRows;
    var shuffleText = document.createElement('span');
    shuffleText.textContent = 'Shuffle rows';
    shuffleLabel.appendChild(shuffleInput);
    shuffleLabel.appendChild(shuffleText);

    var removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'emby-button';
    removeButton.textContent = 'Remove Section';
    removeButton.addEventListener('click', function() {
        sectionEl.remove();
    });

    headerEl.appendChild(sectionHandle);
    headerEl.appendChild(titleInput);
    headerEl.appendChild(shuffleLabel);
    headerEl.appendChild(removeButton);

    var rowsContainer = document.createElement('div');
    rowsContainer.className = 'wholphin-rows';

    var sectionBody = document.createElement('div');
    sectionBody.className = 'wholphin-section-body';

    (section.HomeRows || []).forEach(function(row) {
        rowsContainer.appendChild(createRowElement(row));
    });

    var addRowButton = document.createElement('button');
    addRowButton.type = 'button';
    addRowButton.className = 'emby-button';
    addRowButton.textContent = 'Add Row';
    addRowButton.addEventListener('click', function() {
        rowsContainer.appendChild(createRowElement({
            RowType: 'System',
            NativeRowKey: 'ContinueWatching',
            Label: '',
            PluginId: '',
            EndpointParams: []
        }));
    });

    sectionEl.appendChild(headerEl);
    sectionBody.appendChild(rowsContainer);
    sectionEl.appendChild(sectionBody);
    var sectionActions = document.createElement('div');
    sectionActions.className = 'wholphin-section-actions';
    sectionActions.appendChild(addRowButton);
    sectionEl.appendChild(sectionActions);

    if (window.Sortable) {
        Sortable.create(rowsContainer, {
            handle: '.wholphin-row-handle',
            animation: 150
        });
    }

    return sectionEl;
}

function createRowElement(row) {
    var rowEl = document.createElement('div');
    rowEl.className = 'wholphin-row';

    var handle = document.createElement('span');
    handle.className = 'wholphin-row-handle';
    handle.textContent = '::';

    var typeSelect = document.createElement('select');
    typeSelect.className = 'emby-select-withcolor emby-select';
    typeSelect.is = 'emby-select';
    typeSelect.classList.add('wholphin-row-type');
    var nativeOption = document.createElement('option');
    nativeOption.value = 'System';
    nativeOption.textContent = 'Native Row';
    typeSelect.appendChild(nativeOption);

    var collectionOption = document.createElement('option');
    collectionOption.value = 'Collection';
    collectionOption.textContent = 'Collection';
    typeSelect.appendChild(collectionOption);

    typeSelect.value = row.RowType || 'System';

    var nativeSelect = document.createElement('select');
    nativeSelect.className = 'emby-select-withcolor emby-select wholphin-row-native';
    nativeSelect.is = 'emby-select';
    nativeRowOptions.forEach(function(optionItem) {
        var option = document.createElement('option');
        option.value = optionItem.key;
        option.textContent = optionItem.label;
        nativeSelect.appendChild(option);
    });

    var initialNativeKey = row.NativeRowKey || 'ContinueWatching';
    if (!row.NativeRowKey && Array.isArray(row.EndpointParams)) {
        row.EndpointParams.some(function(entry) {
            if (entry && entry.Key === 'NativeRow') {
                initialNativeKey = entry.Value || initialNativeKey;
                return true;
            }
            return false;
        });
    }
    nativeSelect.value = initialNativeKey;

    var collectionSelect = document.createElement('select');
    collectionSelect.className = 'emby-select-withcolor emby-select wholphin-row-collection';
    collectionSelect.is = 'emby-select';
    populateCollectionSelect(collectionSelect, row.PluginId || '');

    function createField(labelText, control) {
        var field = document.createElement('div');
        field.className = 'wholphin-field';
        var label = document.createElement('label');
        label.textContent = labelText;
        field.appendChild(label);
        field.appendChild(control);
        return field;
    }

    var removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'emby-button wholphin-row-remove';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', function() {
        rowEl.remove();
    });

    var typeField = createField('Row Type', typeSelect);
    var nativeField = createField('Native Row', nativeSelect);
    var collectionField = createField('Collection', collectionSelect);

    var updateVisibility = function() {
        var isNative = typeSelect.value === 'System';
        nativeField.style.display = isNative ? '' : 'none';
        collectionField.style.display = isNative ? 'none' : '';
    };

    typeSelect.addEventListener('change', updateVisibility);
    updateVisibility();

    rowEl.appendChild(handle);
    rowEl.appendChild(typeField);
    rowEl.appendChild(nativeField);
    rowEl.appendChild(collectionField);
    rowEl.appendChild(removeButton);

    return rowEl;
}

function serializeSections() {
    var sections = [];
    var sectionEls = document.querySelectorAll('.wholphin-section');

    sectionEls.forEach(function(sectionEl) {
        var header = sectionEl.querySelector('.wholphin-section-header');
        var title = header.querySelector('input[type="text"]').value.trim();
        var shuffle = header.querySelector('input[type="checkbox"]').checked;

        var rows = [];
        var rowEls = sectionEl.querySelectorAll('.wholphin-row');
        rowEls.forEach(function(rowEl) {
            var typeSelect = rowEl.querySelector('.wholphin-row-type');
            var nativeSelect = rowEl.querySelector('.wholphin-row-native');
            var collectionSelect = rowEl.querySelector('.wholphin-row-collection');
            var rowType = typeSelect.value;
            var nativeKey = nativeSelect ? nativeSelect.value : '';
            var collectionId = collectionSelect ? collectionSelect.value : '';
            var label = '';

            if (rowType === 'System') {
                var nativeOption = nativeRowOptions.find(function(option) {
                    return option.key === nativeKey;
                });
                label = nativeOption ? nativeOption.label : nativeKey;
            } else {
                var collectionOption = collectionSelect ? collectionSelect.selectedOptions[0] : null;
                label = collectionOption ? collectionOption.textContent : '';
            }

            rows.push({
                RowType: rowType,
                Label: label,
                NativeRowKey: rowType === 'System' ? nativeKey : null,
                PluginId: rowType === 'Collection' ? collectionId : null,
                EndpointParams: []
            });
        });

        sections.push({
            Title: title,
            ShuffleRows: shuffle,
            HomeRows: rows
        });
    });

    return sections;
}

function loadScope(scopeKey) {
    currentScopeKey = scopeKey;
    var profile = ensureProfile(scopeKey);
    renderSections(profile);
}

function getAdminConfigUrl() {
    return ApiClient.getUrl('Wholphin/AdminConfig');
}

document.querySelector('#WholphinCompanionConfigPage')
    .addEventListener('pageshow', function() {
        Dashboard.showLoadingMsg();
        ApiClient.ajax({
            url: getAdminConfigUrl(),
            type: 'GET',
            dataType: 'json'
        }).then(function(config) {
            currentConfig = config || createEmptyProfile();
            ensureConfigDefaults(currentConfig);
            loadUsers();
            loadCollections().then(function() {
                loadScope(currentScopeKey);
                Dashboard.hideLoadingMsg();
            });
        });
    });

document.querySelector('#ScopeSelect')
    .addEventListener('change', function(event) {
        loadScope(event.target.value);
    });

document.querySelector('#AddSectionButton')
    .addEventListener('click', function() {
        var container = document.querySelector('#SectionsContainer');
        container.appendChild(createSectionElement({
            Title: '',
            ShuffleRows: false,
            HomeRows: []
        }));
    });

document.querySelector('#WholphinCompanionConfigForm')
    .addEventListener('submit', function(e) {
        e.preventDefault();
        Dashboard.showLoadingMsg();
        try {
            var sections = serializeSections();
            var profile = ensureProfile(currentScopeKey);
            profile.HomeLayout.Sections = sections;
            ensureProfile(currentScopeKey);
            var entry = findProfileEntry(currentScopeKey);
            if (entry) {
                entry.Profile = profile;
            }

            ApiClient.ajax({
                url: getAdminConfigUrl(),
                type: 'POST',
                data: JSON.stringify(currentConfig),
                contentType: 'application/json'
            }).then(function() {
                Dashboard.hideLoadingMsg();
                Dashboard.alert('Configuration saved.');
            });
        } catch (err) {
            Dashboard.hideLoadingMsg();
            Dashboard.alert(err.message || 'Failed to save configuration.');
        }
        return false;
    });
