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

var maxBitrateOptions = [
    '500 kbps', '750 kbps', '1 Mbps', '2 Mbps', '3 Mbps', '5 Mbps', '8 Mbps', '10 Mbps',
    '15 Mbps', '20 Mbps', '30 Mbps', '40 Mbps', '50 Mbps', '60 Mbps', '70 Mbps', '80 Mbps',
    '90 Mbps', '100 Mbps', '120 Mbps', '140 Mbps', '160 Mbps', '180 Mbps', '200 Mbps'
];

var fontColors = ['White', 'Black', 'Light Gray', 'Dark Gray', 'Red', 'Yellow', 'Green', 'Cyan', 'Blue', 'Magenta'];

var settingsSchema = {
    global: [
        {
            title: 'Global (device-only)',
            fields: [
                { key: 'sign_in_auto', label: 'Sign in automatically', type: 'boolean', default: 'true' },
                { key: 'update_url', label: 'Update URL', type: 'string', default: 'https://api.github.com/repos/sysmoon14/Wholphin/releases/latest' },
                { key: 'max_bitrate', label: 'Max bitrate', type: 'choice', options: maxBitrateOptions, defaultIndex: 17 }
            ]
        }
    ],
    user: [
        {
            title: 'Sign-in & home',
            fields: [
                { key: 'signin_nav_actions', type: 'action_group', actions: [
                    { key: 'seerr_login', label: 'Sign-In (Seerr)' },
                    { key: 'customize_nav_bar', label: 'Customize nav bar' }
                ] },
                { key: 'max_homepage_items', label: 'Max items on home page rows', type: 'integer', min: 5, max: 50, step: 1, default: 25 },
                { key: 'hide_settings_cog', label: 'Hide settings cog', type: 'boolean', default: 'false' },
                { key: 'allow_settings_override', label: 'Allow settings override', type: 'boolean', default: 'true' },
                { key: 'rewatch_next_up', label: 'Rewatch next up', type: 'boolean', default: 'false' },
                { key: 'backdrop_display', label: 'Backdrop display', type: 'choice', options: ['Image with dynamic color', 'Image only', 'None'], defaultIndex: 0 }
            ]
        },
        {
            title: 'Appearance',
            fields: [
                { key: 'play_theme_music', label: 'Play theme music', type: 'choice', options: ['Disabled', 'Lowest', 'Low', 'Medium', 'High', 'Full'], defaultIndex: 3 },
                { key: 'remember_selected_tab', label: 'Remember selected tab', type: 'boolean', default: 'true' },
                { key: 'app_theme', label: 'App theme (color)', type: 'choice', options: ['Purple', 'Blue', 'Green', 'Orange', 'Bold Blue', 'Black'] },
                { key: 'show_clock', label: 'Show clock', type: 'boolean', default: 'true' },
                { key: 'combined_search_results', label: 'Combined search results', type: 'boolean', default: 'false' },
                { key: 'nav_drawer_switch_on_focus', label: 'Switch nav drawer pages on focus', type: 'boolean', default: 'true' }
            ]
        },
        {
            title: 'Playback',
            fields: [
                { key: 'skip_forward_preference', label: 'Skip forward', type: 'integer', min: 10, max: 300, step: 5, default: 30, unit: 'seconds' },
                { key: 'skip_back_preference', label: 'Skip back', type: 'integer', min: 5, max: 300, step: 5, default: 10, unit: 'seconds' },
                { key: 'skip_back_on_resume_preference', label: 'Skip back when resuming playback', type: 'integer', min: 0, max: 10, step: 1, default: 0, unit: 'seconds' },
                { key: 'hide_controller_timeout', label: 'Hide playback controls', type: 'integer', min: 500, max: 15000, step: 100, default: 5000, unit: 'ms', unitLabel: 'seconds' },
                { key: 'seek_bar_steps', label: 'Seek bar steps', type: 'integer', min: 4, max: 64, step: 1, default: 16 },
                { key: 'playback_debug_info', label: 'Show playback debug info', type: 'boolean', default: 'false' },
                { key: 'global_content_scale', label: 'Global content scale', type: 'choice', options: ['Fit', 'None', 'Crop', 'Fill', 'Fill Width', 'Fill Height'], defaultIndex: 0 },
                { key: 'one_click_pause', label: 'Pause with one click', type: 'boolean', default: 'false' }
            ]
        },
        {
            title: 'Next up & skip',
            fields: [
                { key: 'auto_play_next', label: 'Auto play next up', type: 'boolean', default: 'true' },
                { key: 'auto_play_next_delay', label: 'Delay before playing next up', type: 'integer', min: 0, max: 60, step: 5, default: 15, unit: 'seconds' },
                { key: 'show_next_up_when', label: 'Show next up', type: 'choice', options: ['At the end of playback', 'During end credits/outro'], defaultIndex: 0 },
                { key: 'pass_out_protection', label: 'Passout Protection', type: 'integer', min: 0, max: 3, step: 1, default: 2, unit: 'hours' },
                { key: 'skip_intro_behavior', label: 'Skip intro behavior', type: 'choice', options: ['Ignore', 'Skip automatically', 'Ask to skip'], defaultIndex: 1 },
                { key: 'skip_outro_behavior', label: 'Skip outro behavior', type: 'choice', options: ['Ignore', 'Skip automatically', 'Ask to skip'], defaultIndex: 1 },
                { key: 'skip_commercials_behavior', label: 'Skip commercials behavior', type: 'choice', options: ['Ignore', 'Skip automatically', 'Ask to skip'], defaultIndex: 1 },
                { key: 'skip_previews_behavior', label: 'Skip previews behavior', type: 'choice', options: ['Ignore', 'Skip automatically', 'Ask to skip'], defaultIndex: 0 },
                { key: 'skip_recap_behavior', label: 'Skip recap behavior', type: 'choice', options: ['Ignore', 'Skip automatically', 'Ask to skip'], defaultIndex: 0 }
            ]
        },
        {
            title: 'Live TV',
            fields: [
                { key: 'show_details', label: 'Show details', type: 'boolean', default: 'true' },
                { key: 'favorite_channels_at_beginning', label: 'Favorite channels at beginning', type: 'boolean', default: 'true' },
                { key: 'sort_channels_recently_watched', label: 'Sort channels by recently watched', type: 'boolean', default: 'false' },
                { key: 'color_code_programs', label: 'Color code programs', type: 'boolean', default: 'true' }
            ]
        },
        {
            title: 'Subtitle style',
            subgroup: 'subtitle'
        }
    ],
    subtitle: [
        { key: 'font_size', label: 'Font size', type: 'integer', min: 8, max: 70, step: 2, default: 24 },
        { key: 'font_color', label: 'Font color', type: 'choice', options: fontColors, defaultIndex: 0 },
        { key: 'bold_font', label: 'Bold font', type: 'boolean', default: 'false' },
        { key: 'italic_font', label: 'Italicize font', type: 'boolean', default: 'false' },
        { key: 'font_opacity', label: 'Font opacity', type: 'integer', min: 10, max: 100, step: 10, default: 100, unit: 'percent' },
        { key: 'edge_style', label: 'Edge style', type: 'choice', options: ['None', 'Outline', 'Shadow'], defaultIndex: 1 },
        { key: 'edge_color', label: 'Edge color', type: 'choice', options: fontColors, defaultIndex: 1 },
        { key: 'edge_size', label: 'Edge size', type: 'integer', min: 1, max: 32, step: 1, default: 4 },
        { key: 'background_style', label: 'Background style', type: 'choice', options: ['None', 'Wrap', 'Boxed'], defaultIndex: 0 },
        { key: 'background_color', label: 'Background color', type: 'choice', options: fontColors, defaultIndex: 0 },
        { key: 'background_opacity', label: 'Background opacity', type: 'integer', min: 10, max: 100, step: 10, default: 50, unit: 'percent' },
        { key: 'subtitle_margin', label: 'Margin', type: 'integer', min: 0, max: 100, step: 1, default: 8, unit: 'percent' },
        { key: 'reset', label: 'Reset', type: 'action' }
    ]
};

function getGlobalGroups() {
    return settingsSchema.global.concat(settingsSchema.user);
}

function getGlobalSettingKeys() {
    var keys = {};
    function addFromFields(fields) {
        (fields || []).forEach(function(f) {
            if (f.key && f.type !== 'action' && f.type !== 'action_group' && f.type !== 'subsection') { keys[f.key] = true; }
        });
    }
    settingsSchema.global.forEach(function(g) {
        if (g.fields) { addFromFields(g.fields); }
    });
    settingsSchema.user.forEach(function(g) {
        if (g.fields) { addFromFields(g.fields); }
        if (g.subgroup === 'subtitle') {
            (settingsSchema.subtitle || []).forEach(function(f) {
                if (f.key && f.type !== 'action') { keys[f.key] = true; }
            });
        }
    });
    return keys;
}

var USE_GLOBAL_SETTINGS_KEY = 'use_global_settings';
var USE_GLOBAL_KEYS_KEY = 'use_global_keys';

function ensureConfigDefaults(config) {
    if (!config.LayoutProfiles || !Array.isArray(config.LayoutProfiles)) {
        config.LayoutProfiles = [];
    }
    if (!config.GlobalSettings || typeof config.GlobalSettings !== 'object') {
        config.GlobalSettings = {};
    }
    if (!findProfileEntry('Global')) {
        config.LayoutProfiles.push({
            Key: 'Global',
            Profile: createEmptyProfile()
        });
    }
    config.LayoutProfiles.forEach(function(entry) {
        if (entry.Profile && (!entry.Profile.UserSettings || typeof entry.Profile.UserSettings !== 'object')) {
            entry.Profile.UserSettings = {};
        }
    });
}

function createEmptyProfile() {
    return {
        HomeLayout: { Sections: [] },
        LibraryLayout: {},
        ThemeSettings: {},
        UserSettings: {}
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

    var row1 = document.createElement('div');
    row1.className = 'wholphin-section-header-row1';
    var sectionHandle = document.createElement('span');
    sectionHandle.className = 'wholphin-section-handle';
    sectionHandle.textContent = '::';
    var titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'emby-input wholphin-section-title';
    titleInput.value = section.Title || '';
    titleInput.placeholder = 'Section title';
    var removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'emby-button wholphin-section-remove';
    removeButton.textContent = 'Remove Section';
    removeButton.addEventListener('click', function() {
        sectionEl.remove();
    });
    row1.appendChild(sectionHandle);
    row1.appendChild(titleInput);
    row1.appendChild(removeButton);

    var row2 = document.createElement('div');
    row2.className = 'wholphin-section-header-row2';

    var shuffleGroup = document.createElement('div');
    shuffleGroup.className = 'wholphin-section-group wholphin-section-shuffle-group';
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
    var shuffleRowCountWrap = document.createElement('div');
    shuffleRowCountWrap.className = 'wholphin-section-shuffle-count';
    shuffleRowCountWrap.style.display = section.ShuffleRows ? '' : 'none';
    var shuffleRowCountLabel = document.createElement('label');
    shuffleRowCountLabel.className = 'wholphin-section-field-label';
    shuffleRowCountLabel.textContent = 'Number of Rows';
    var shuffleRowCountInput = document.createElement('input');
    shuffleRowCountInput.type = 'number';
    shuffleRowCountInput.className = 'emby-input wholphin-shuffle-row-count';
    shuffleRowCountInput.min = 1;
    shuffleRowCountInput.placeholder = 'All';
    shuffleRowCountInput.value = (section.ShuffleRowCount > 0 ? section.ShuffleRowCount : '') || '';
    shuffleRowCountWrap.appendChild(shuffleRowCountLabel);
    shuffleRowCountWrap.appendChild(shuffleRowCountInput);
    shuffleInput.addEventListener('change', function() {
        shuffleRowCountWrap.style.display = shuffleInput.checked ? '' : 'none';
    });
    shuffleGroup.appendChild(shuffleLabel);
    shuffleGroup.appendChild(shuffleRowCountWrap);

    var visibilityGroup = document.createElement('div');
    visibilityGroup.className = 'wholphin-section-group wholphin-section-visibility-group';
    var visibleFromWrap = document.createElement('div');
    visibleFromWrap.className = 'wholphin-section-field';
    var visibleFromLabel = document.createElement('label');
    visibleFromLabel.className = 'wholphin-section-field-label';
    visibleFromLabel.textContent = 'Visible From';
    var visibleFromInput = document.createElement('input');
    visibleFromInput.type = 'date';
    visibleFromInput.className = 'emby-input wholphin-visible-from';
    visibleFromInput.value = section.VisibleFrom || '';
    visibleFromWrap.appendChild(visibleFromLabel);
    visibleFromWrap.appendChild(visibleFromInput);
    var visibleToWrap = document.createElement('div');
    visibleToWrap.className = 'wholphin-section-field';
    var visibleToLabel = document.createElement('label');
    visibleToLabel.className = 'wholphin-section-field-label';
    visibleToLabel.textContent = 'Visible To';
    var visibleToInput = document.createElement('input');
    visibleToInput.type = 'date';
    visibleToInput.className = 'emby-input wholphin-visible-to';
    visibleToInput.value = section.VisibleTo || '';
    visibleToWrap.appendChild(visibleToLabel);
    visibleToWrap.appendChild(visibleToInput);
    visibilityGroup.appendChild(visibleFromWrap);
    visibilityGroup.appendChild(visibleToWrap);

    row2.appendChild(shuffleGroup);
    row2.appendChild(visibilityGroup);
    headerEl.appendChild(row1);
    headerEl.appendChild(row2);

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
            HideWatchedItems: false,
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

    var hideWatchedLabel = document.createElement('label');
    hideWatchedLabel.className = 'emby-checkbox-label wholphin-row-hide-watched-wrap';
    var hideWatchedInput = document.createElement('input');
    hideWatchedInput.type = 'checkbox';
    hideWatchedInput.is = 'emby-checkbox';
    hideWatchedInput.className = 'wholphin-row-hide-watched';
    hideWatchedInput.checked = !!row.HideWatchedItems;
    var hideWatchedText = document.createElement('span');
    hideWatchedText.textContent = 'Hide watched items';
    hideWatchedLabel.appendChild(hideWatchedInput);
    hideWatchedLabel.appendChild(hideWatchedText);

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
    rowEl.appendChild(hideWatchedLabel);
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
        var visibleFromEl = header.querySelector('.wholphin-visible-from');
        var visibleToEl = header.querySelector('.wholphin-visible-to');
        var shuffleCountEl = header.querySelector('.wholphin-shuffle-row-count');
        var visibleFrom = (visibleFromEl && visibleFromEl.value) ? visibleFromEl.value.trim() : '';
        var visibleTo = (visibleToEl && visibleToEl.value) ? visibleToEl.value.trim() : '';
        var shuffleRowCount = (shuffleCountEl && shuffleCountEl.value) ? parseInt(shuffleCountEl.value, 10) : null;
        if (isNaN(shuffleRowCount) || shuffleRowCount < 1) { shuffleRowCount = null; }

        var rows = [];
        var rowEls = sectionEl.querySelectorAll('.wholphin-row');
        rowEls.forEach(function(rowEl) {
            var typeSelect = rowEl.querySelector('.wholphin-row-type');
            var nativeSelect = rowEl.querySelector('.wholphin-row-native');
            var collectionSelect = rowEl.querySelector('.wholphin-row-collection');
            var hideWatchedEl = rowEl.querySelector('.wholphin-row-hide-watched');
            var rowType = typeSelect.value;
            var nativeKey = nativeSelect ? nativeSelect.value : '';
            var collectionId = collectionSelect ? collectionSelect.value : '';
            var hideWatchedItems = hideWatchedEl ? hideWatchedEl.checked : false;
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
                HideWatchedItems: hideWatchedItems,
                EndpointParams: []
            });
        });

        sections.push({
            Title: title,
            ShuffleRows: shuffle,
            VisibleFrom: visibleFrom || null,
            VisibleTo: visibleTo || null,
            ShuffleRowCount: shuffleRowCount,
            HomeRows: rows
        });
    });

    return sections;
}

function loadScope(scopeKey) {
    currentScopeKey = scopeKey;
    var profile = ensureProfile(scopeKey);
    renderSections(profile);
    if (currentTab === 'Settings') {
        renderSettings();
    }
}

var currentTab = 'HomeRows';

function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.wholphin-tab').forEach(function(t) {
        t.classList.toggle('active', t.getAttribute('data-tab') === tabName);
    });
    document.querySelectorAll('.wholphin-tab-panel').forEach(function(p) {
        var isActive = (tabName === 'HomeRows' && p.id === 'HomeRowsPanel') || (tabName === 'Settings' && p.id === 'SettingsPanel');
        p.classList.toggle('active', isActive);
        p.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
    if (tabName === 'Settings') {
        renderSettings();
    }
}

function getSettingsStore() {
    if (!currentConfig) { return {}; }
    if (currentScopeKey === 'Global') {
        return currentConfig.GlobalSettings || {};
    }
    var profile = ensureProfile(currentScopeKey);
    return profile.UserSettings || {};
}

function getSettingValue(store, field) {
    var raw = store[field.key];
    if (raw !== undefined && raw !== null && raw !== '') {
        return String(raw);
    }
    if (field.type === 'boolean') {
        return field.default === 'true' ? 'true' : 'false';
    }
    if (field.type === 'integer' && field.default !== undefined) {
        return String(field.default);
    }
    if (field.type === 'choice' && field.defaultIndex !== undefined) {
        return String(field.defaultIndex);
    }
    if (field.type === 'string' && field.default !== undefined) {
        return field.default;
    }
    return '';
}

function createSettingControl(field, value, store, options) {
    options = options || {};
    var wrap = document.createElement('div');
    wrap.className = 'wholphin-settings-field';
    if (options.disabled) { wrap.classList.add('wholphin-settings-field-disabled'); }
    wrap.setAttribute('data-setting-key', field.key);
    wrap.setAttribute('data-setting-type', field.type);

    var useGlobalRow = null;
    if (options.useGlobalCheckbox) {
        useGlobalRow = document.createElement('div');
        useGlobalRow.className = 'wholphin-settings-use-global-row';
        var useGlobalLabel = document.createElement('label');
        useGlobalLabel.className = 'emby-checkbox-label';
        var useGlobalCheck = document.createElement('input');
        useGlobalCheck.type = 'checkbox';
        useGlobalCheck.checked = options.useGlobalCheckbox.checked;
        useGlobalCheck.setAttribute('data-use-global-key', field.key);
        useGlobalLabel.appendChild(useGlobalCheck);
        useGlobalLabel.appendChild(document.createTextNode(' Use global setting'));
        useGlobalRow.appendChild(useGlobalLabel);
    }

    var label = document.createElement('label');
    label.textContent = field.label;

    var control = document.createElement('div');
    control.className = 'wholphin-settings-control';

    if (field.type === 'boolean') {
        var check = document.createElement('input');
        check.type = 'checkbox';
        check.checked = value === 'true';
        check.setAttribute('data-setting-key', field.key);
        if (options.disabled) { check.disabled = true; }
        control.appendChild(check);
    } else if (field.type === 'string') {
        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'emby-input';
        input.value = value;
        input.setAttribute('data-setting-key', field.key);
        if (options.disabled) { input.disabled = true; }
        control.appendChild(input);
    } else if (field.type === 'integer') {
        var num = document.createElement('input');
        num.type = 'number';
        num.className = 'emby-input';
        num.min = field.min;
        num.max = field.max;
        num.step = field.step;
        num.value = value;
        num.setAttribute('data-setting-key', field.key);
        if (options.disabled) { num.disabled = true; }
        if (field.unitLabel) {
            var unitSpan = document.createElement('span');
            unitSpan.textContent = ' ' + (field.unitLabel || field.unit || '');
            unitSpan.style.marginLeft = '6px';
            control.appendChild(num);
            control.appendChild(unitSpan);
        } else {
            control.appendChild(num);
            if (field.unit) {
                var u = document.createElement('span');
                u.textContent = ' ' + field.unit;
                u.style.marginLeft = '6px';
                control.appendChild(u);
            }
        }
    } else if (field.type === 'choice') {
        var select = document.createElement('select');
        select.className = 'emby-select-withcolor emby-select';
        select.is = 'emby-select';
        select.setAttribute('data-setting-key', field.key);
        if (options.disabled) { select.disabled = true; }
        (field.options || []).forEach(function(opt, idx) {
            var optEl = document.createElement('option');
            optEl.value = String(idx);
            optEl.textContent = opt;
            select.appendChild(optEl);
        });
        select.value = value;
        if (field.options && !field.options[value]) {
            var idx = parseInt(value, 10);
            if (idx >= 0 && idx < field.options.length) { select.value = String(idx); }
        }
        control.appendChild(select);
    } else if (field.type === 'action_group') {
        control.classList.add('wholphin-settings-action-group');
        (field.actions || []).forEach(function(action) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'emby-button';
            btn.textContent = action.label;
            btn.setAttribute('data-setting-key', action.key);
            btn.setAttribute('data-setting-type', 'action');
            if (options.disabled) {
                btn.disabled = true;
            } else {
                if (action.key === 'seerr_login') {
                    btn.addEventListener('click', function() {
                        if (currentScopeKey === 'Global') {
                            Dashboard.alert('Select a user to configure Seerr credentials.');
                            return;
                        }
                        openSeerrModal(store);
                    });
                }
                if (action.key === 'customize_nav_bar') {
                    btn.addEventListener('click', function() {
                        if (currentScopeKey === 'Global') {
                            Dashboard.alert('Select a user to customize the nav bar.');
                            return;
                        }
                        openNavDrawerModal(store);
                    });
                }
            }
            control.appendChild(btn);
        });
        wrap.appendChild(control);
        if (options.disabled) { wrap.classList.add('wholphin-settings-field-disabled'); }
        return wrap;
    } else if (field.type === 'action') {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'emby-button';
        btn.textContent = field.label;
        btn.setAttribute('data-setting-key', field.key);
        btn.setAttribute('data-setting-type', 'action');
        if (options.disabled) {
            btn.disabled = true;
        } else {
            if (field.key === 'seerr_login') {
                btn.addEventListener('click', function() {
                    if (currentScopeKey === 'Global') {
                        Dashboard.alert('Select a user to configure Seerr credentials.');
                        return;
                    }
                    openSeerrModal(store);
                });
            }
            if (field.key === 'customize_nav_bar') {
                btn.addEventListener('click', function() {
                    if (currentScopeKey === 'Global') {
                        Dashboard.alert('Select a user to customize the nav bar.');
                        return;
                    }
                    openNavDrawerModal(store);
                });
            }
        }
        if (field.note) {
            var note = document.createElement('div');
            note.className = 'wholphin-settings-action-note';
            note.textContent = field.note;
            control.appendChild(btn);
            control.appendChild(note);
        } else {
            control.appendChild(btn);
        }
        wrap.appendChild(control);
        if (options.disabled) { wrap.classList.add('wholphin-settings-field-disabled'); }
        return wrap;
    }

    wrap.appendChild(label);
    wrap.appendChild(control);
    if (useGlobalRow) {
        wrap.appendChild(useGlobalRow);
    }

    if (options.useGlobalCheckbox) {
        var useGlobalCheck = wrap.querySelector('input[data-use-global-key]');
        if (useGlobalCheck) {
            useGlobalCheck.addEventListener('change', function() {
                var disabled = useGlobalCheck.checked;
                wrap.classList.toggle('wholphin-settings-field-disabled', disabled);
                wrap.querySelectorAll('input[data-setting-key], select[data-setting-key]').forEach(function(ctrl) {
                    ctrl.disabled = disabled;
                });
            });
        }
    }

    return wrap;
}

function parseUseGlobalKeys(store) {
    var raw = store[USE_GLOBAL_KEYS_KEY];
    if (!raw) { return []; }
    try {
        var arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch (e) {
        return [];
    }
}

function renderSettings() {
    var container = document.querySelector('#SettingsContainer');
    if (!container) { return; }
    container.innerHTML = '';

    var isGlobal = currentScopeKey === 'Global';
    var store = getSettingsStore();
    var globalStore = (currentConfig && currentConfig.GlobalSettings) ? currentConfig.GlobalSettings : {};
    var groups = isGlobal ? getGlobalGroups() : settingsSchema.user;
    var globalSettingKeys = getGlobalSettingKeys();

    var useGlobalSettings = !isGlobal && (store[USE_GLOBAL_SETTINGS_KEY] === 'true');
    var useGlobalKeysList = isGlobal ? [] : parseUseGlobalKeys(store);
    var useGlobalKeys = {};
    useGlobalKeysList.forEach(function(k) { useGlobalKeys[k] = true; });

    var groupsEl = document.createElement('div');
    groupsEl.className = 'wholphin-settings-groups';

    if (!isGlobal) {
        var useGlobalWrap = document.createElement('div');
        useGlobalWrap.className = 'wholphin-settings-use-global-all';
        var useGlobalLabel = document.createElement('label');
        useGlobalLabel.className = 'emby-checkbox-label';
        var useGlobalCheck = document.createElement('input');
        useGlobalCheck.type = 'checkbox';
        useGlobalCheck.checked = useGlobalSettings;
        useGlobalCheck.setAttribute('data-setting-key', USE_GLOBAL_SETTINGS_KEY);
        useGlobalCheck.addEventListener('change', function() {
            var store = getSettingsStore();
            store[USE_GLOBAL_SETTINGS_KEY] = useGlobalCheck.checked ? 'true' : 'false';
            renderSettings();
        });
        useGlobalLabel.appendChild(useGlobalCheck);
        useGlobalLabel.appendChild(document.createTextNode(' Use global settings'));
        useGlobalWrap.appendChild(useGlobalLabel);
        groupsEl.appendChild(useGlobalWrap);
    }

    groups.forEach(function(group) {
        var groupEl = document.createElement('div');
        groupEl.className = 'wholphin-settings-group collapsed';

        var headerEl = document.createElement('button');
        headerEl.type = 'button';
        headerEl.className = 'wholphin-settings-group-header';
        headerEl.setAttribute('aria-expanded', 'false');
        var toggleEl = document.createElement('span');
        toggleEl.className = 'wholphin-settings-group-toggle';
        toggleEl.setAttribute('aria-hidden', 'true');
        toggleEl.textContent = '\u25B6';
        var titleEl = document.createElement('span');
        titleEl.className = 'wholphin-settings-group-title';
        titleEl.textContent = group.title;
        headerEl.appendChild(toggleEl);
        headerEl.appendChild(titleEl);
        groupEl.appendChild(headerEl);

        var bodyEl = document.createElement('div');
        bodyEl.className = 'wholphin-settings-group-body';

        function getValueAndOptions(field, storeToUse) {
            var inherit = !isGlobal && (useGlobalSettings || useGlobalKeys[field.key]);
            var effectiveValue = inherit ? getSettingValue(globalStore, field) : getSettingValue(storeToUse, field);
            var options = {
                disabled: inherit,
                useGlobalCheckbox: (!isGlobal && !useGlobalSettings && globalSettingKeys[field.key] && field.type !== 'action' && field.type !== 'action_group') ? {
                    checked: !!useGlobalKeys[field.key]
                } : undefined
            };
            return { value: effectiveValue, options: options };
        }

        if (group.subgroup === 'subtitle') {
            var fieldsEl = document.createElement('div');
            fieldsEl.className = 'wholphin-settings-fields';
            (settingsSchema.subtitle || []).forEach(function(subField) {
                var vo = getValueAndOptions(subField, store);
                var subControl = createSettingControl(subField, vo.value, store, vo.options);
                if (subField.key === 'reset' && subField.type === 'action') {
                    var btn = subControl.querySelector('button');
                    if (btn) {
                        btn.addEventListener('click', function() {
                            (settingsSchema.subtitle || []).forEach(function(sf) {
                                if (sf.type === 'action') { return; }
                                var def = sf.default !== undefined ? String(sf.default) : (sf.defaultIndex !== undefined ? String(sf.defaultIndex) : '');
                                var input = bodyEl.querySelector('input[data-setting-key="' + sf.key + '"], select[data-setting-key="' + sf.key + '"]');
                                if (input) {
                                    if (input.type === 'checkbox') { input.checked = def === 'true'; }
                                    else if (input.tagName === 'SELECT') { input.value = def; }
                                    else { input.value = def; }
                                }
                            });
                        });
                    }
                }
                fieldsEl.appendChild(subControl);
            });
            bodyEl.appendChild(fieldsEl);
        } else {
            var fieldsEl = document.createElement('div');
            fieldsEl.className = 'wholphin-settings-fields';
            (group.fields || []).forEach(function(field) {
                var vo = getValueAndOptions(field, store);
                fieldsEl.appendChild(createSettingControl(field, vo.value, store, vo.options));
            });
            bodyEl.appendChild(fieldsEl);
        }

        groupEl.appendChild(bodyEl);

        headerEl.addEventListener('click', function() {
            var isCollapsed = groupEl.classList.toggle('collapsed');
            headerEl.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
            toggleEl.textContent = isCollapsed ? '\u25B6' : '\u25BC';
        });

        groupsEl.appendChild(groupEl);
    });

    container.appendChild(groupsEl);
}

function serializeSettings() {
    var store = {};
    var container = document.querySelector('#SettingsContainer');
    if (!container) { return store; }
    container.querySelectorAll('input[data-setting-key], select[data-setting-key]').forEach(function(el) {
        var key = el.getAttribute('data-setting-key');
        if (!key) { return; }
        if (el.type === 'checkbox') {
            store[key] = el.checked ? 'true' : 'false';
        } else if (el.tagName === 'SELECT') {
            store[key] = el.value;
        } else if (el.type === 'text' || el.type === 'number') {
            store[key] = el.value;
        }
    });
    var useGlobalKeysArr = [];
    container.querySelectorAll('input[data-use-global-key]:checked').forEach(function(el) {
        var k = el.getAttribute('data-use-global-key');
        if (k) { useGlobalKeysArr.push(k); }
    });
    if (useGlobalKeysArr.length > 0) {
        store[USE_GLOBAL_KEYS_KEY] = JSON.stringify(useGlobalKeysArr);
    }
    return store;
}

function getAdminConfigUrl() {
    return ApiClient.getUrl('Wholphin/AdminConfig');
}

var SEERR_CREDENTIALS_KEY = 'seerr_credentials';

function ensureSeerrModal() {
    var existing = document.getElementById('SeerrCredentialsModal');
    if (existing) { return existing; }

    var overlay = document.createElement('div');
    overlay.id = 'SeerrCredentialsModal';
    overlay.className = 'wholphin-modal-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    var dialog = document.createElement('div');
    dialog.className = 'wholphin-modal-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-labelledby', 'SeerrModalTitle');

    var title = document.createElement('h2');
    title.id = 'SeerrModalTitle';
    title.className = 'wholphin-modal-title';
    title.textContent = 'Seerr credentials';
    dialog.appendChild(title);

    var form = document.createElement('div');
    form.className = 'wholphin-modal-form';

    var urlWrap = document.createElement('div');
    urlWrap.className = 'wholphin-modal-field';
    urlWrap.innerHTML = '<label for="SeerrModalUrl">URL (required)</label>';
    var urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.id = 'SeerrModalUrl';
    urlInput.className = 'emby-input';
    urlInput.placeholder = 'https://seerr.example.com';
    urlWrap.appendChild(urlInput);
    form.appendChild(urlWrap);

    var authWrap = document.createElement('div');
    authWrap.className = 'wholphin-modal-field';
    authWrap.innerHTML = '<label for="SeerrModalAuthMethod">Auth method</label>';
    var authSelect = document.createElement('select');
    authSelect.id = 'SeerrModalAuthMethod';
    authSelect.className = 'emby-select-withcolor emby-select';
    authSelect.is = 'emby-select';
    ['API_KEY', 'JELLYFIN', 'LOCAL'].forEach(function(opt) {
        var o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        authSelect.appendChild(o);
    });
    authWrap.appendChild(authSelect);
    form.appendChild(authWrap);

    var userWrap = document.createElement('div');
    userWrap.className = 'wholphin-modal-field';
    userWrap.innerHTML = '<label for="SeerrModalUsername">Username</label>';
    var userInput = document.createElement('input');
    userInput.type = 'text';
    userInput.id = 'SeerrModalUsername';
    userInput.className = 'emby-input';
    userInput.placeholder = 'For LOCAL / JELLYFIN';
    userWrap.appendChild(userInput);
    form.appendChild(userWrap);

    var passWrap = document.createElement('div');
    passWrap.className = 'wholphin-modal-field';
    passWrap.innerHTML = '<label for="SeerrModalPassword">Password or API key (required)</label>';
    var passInput = document.createElement('input');
    passInput.type = 'password';
    passInput.id = 'SeerrModalPassword';
    passInput.className = 'emby-input';
    passInput.autocomplete = 'off';
    passWrap.appendChild(passInput);
    form.appendChild(passWrap);

    dialog.appendChild(form);

    var actions = document.createElement('div');
    actions.className = 'wholphin-modal-actions';
    var cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'emby-button';
    cancelBtn.textContent = 'Cancel';
    var saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'emby-button raised';
    saveBtn.textContent = 'Save';
    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);
    dialog.appendChild(actions);

    overlay.appendChild(dialog);

    cancelBtn.addEventListener('click', closeSeerrModal);
    saveBtn.addEventListener('click', function() {
        var store = overlay._seerrStore;
        if (!store) { closeSeerrModal(); return; }
        var url = (document.getElementById('SeerrModalUrl').value || '').trim();
        var passwordOrApiKey = (document.getElementById('SeerrModalPassword').value || '').trim();
        if (!url || !passwordOrApiKey) {
            Dashboard.alert('URL and Password or API key are required.');
            return;
        }
        var authMethod = document.getElementById('SeerrModalAuthMethod').value || 'API_KEY';
        var username = (document.getElementById('SeerrModalUsername').value || '').trim();
        var obj = {
            url: url,
            authMethod: authMethod,
            username: username,
            passwordOrApiKey: passwordOrApiKey
        };
        store[SEERR_CREDENTIALS_KEY] = JSON.stringify(obj);
        closeSeerrModal();
        Dashboard.alert('Seerr credentials saved. Click Save below to persist to the server.');
    });

    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) { closeSeerrModal(); }
    });

    document.body.appendChild(overlay);
    return overlay;
}

function openSeerrModal(store) {
    var overlay = ensureSeerrModal();
    overlay._seerrStore = store;
    var raw = store[SEERR_CREDENTIALS_KEY];
    var obj = { url: '', authMethod: 'API_KEY', username: '', passwordOrApiKey: '' };
    if (raw) {
        try {
            var parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                obj.url = parsed.url || '';
                obj.authMethod = parsed.authMethod || 'API_KEY';
                obj.username = parsed.username || '';
                obj.passwordOrApiKey = parsed.passwordOrApiKey || '';
            }
        } catch (e) { /* use defaults */ }
    }
    document.getElementById('SeerrModalUrl').value = obj.url;
    document.getElementById('SeerrModalAuthMethod').value = obj.authMethod;
    document.getElementById('SeerrModalUsername').value = obj.username;
    document.getElementById('SeerrModalPassword').value = obj.passwordOrApiKey;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
}

function closeSeerrModal() {
    var overlay = document.getElementById('SeerrCredentialsModal');
    if (overlay) {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        overlay._seerrStore = null;
    }
}

var NAV_DRAWER_ITEMS_KEY = 'nav_drawer_items';

var NAV_DRAWER_BUILTINS = [
    { itemId: 'a_favorites', name: 'Favorites' },
    { itemId: 'a_discover', name: 'Discover' }
];

function ensureNavDrawerModal() {
    var existing = document.getElementById('NavDrawerModal');
    if (existing) { return existing; }

    var overlay = document.createElement('div');
    overlay.id = 'NavDrawerModal';
    overlay.className = 'wholphin-modal-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    var dialog = document.createElement('div');
    dialog.className = 'wholphin-modal-dialog wholphin-modal-dialog-wide';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-labelledby', 'NavDrawerModalTitle');

    var title = document.createElement('h2');
    title.id = 'NavDrawerModalTitle';
    title.className = 'wholphin-modal-title';
    title.textContent = 'Customize nav bar';
    dialog.appendChild(title);

    var desc = document.createElement('p');
    desc.className = 'wholphin-modal-description';
    desc.textContent = 'Choose which items appear in the nav bar. Reorder by dragging. Unchecked items move under "More".';
    dialog.appendChild(desc);

    var listContainer = document.createElement('div');
    listContainer.id = 'NavDrawerModalList';
    listContainer.className = 'wholphin-nav-drawer-list';
    dialog.appendChild(listContainer);

    var actions = document.createElement('div');
    actions.className = 'wholphin-modal-actions';
    var cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'emby-button';
    cancelBtn.textContent = 'Cancel';
    var saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'emby-button raised';
    saveBtn.textContent = 'Save';
    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);
    dialog.appendChild(actions);

    overlay.appendChild(dialog);

    cancelBtn.addEventListener('click', closeNavDrawerModal);
    saveBtn.addEventListener('click', function() {
        var overlayEl = document.getElementById('NavDrawerModal');
        var store = overlayEl && overlayEl._navStore;
        if (!store) { closeNavDrawerModal(); return; }
        var listEl = document.getElementById('NavDrawerModalList');
        if (!listEl) { closeNavDrawerModal(); return; }
        var rows = Array.prototype.slice.call(listEl.children);
        var items = [];
        rows.forEach(function(row) {
            if (!row.classList.contains('wholphin-nav-drawer-row')) { return; }
            var itemId = row.getAttribute('data-item-id');
            var check = row.querySelector('input[type="checkbox"]');
            var checked = check ? check.checked : true;
            items.push({ itemId: itemId, type: checked ? 'PINNED' : 'UNPINNED' });
        });
        store[NAV_DRAWER_ITEMS_KEY] = JSON.stringify({ items: items });
        closeNavDrawerModal();
        Dashboard.alert('Nav bar saved. Click Save below to persist to the server.');
    });

    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) { closeNavDrawerModal(); }
    });

    document.body.appendChild(overlay);
    return overlay;
}

function openNavDrawerModal(store) {
    var overlay = ensureNavDrawerModal();
    overlay._navStore = store;
    var listEl = document.getElementById('NavDrawerModalList');
    listEl.innerHTML = '';
    listEl.textContent = 'Loading…';

    var userId = currentScopeKey;
    var url = ApiClient.getUrl('Users/' + userId + '/Views');
    ApiClient.ajax({
        url: url,
        type: 'GET',
        dataType: 'json'
    }).then(function(response) {
        var views = response && response.Items ? response.Items : (Array.isArray(response) ? response : []);
        var available = [];
        NAV_DRAWER_BUILTINS.forEach(function(b) {
            available.push({ itemId: b.itemId, name: b.name });
        });
        views.forEach(function(v) {
            if (v && v.Id) {
                available.push({ itemId: 's_' + v.Id, name: v.Name || v.Id });
            }
        });

        var stored = { items: [] };
        var raw = store[NAV_DRAWER_ITEMS_KEY];
        if (raw) {
            try {
                var parsed = JSON.parse(raw);
                if (parsed && parsed.items && Array.isArray(parsed.items)) {
                    stored = parsed;
                }
            } catch (e) { /* use default */ }
        }

        var byId = {};
        stored.items.forEach(function(entry) {
            if (entry && entry.itemId) { byId[entry.itemId] = entry.type || 'PINNED'; }
        });
        var order = stored.items.map(function(entry) { return entry.itemId; }).filter(Boolean);
        var merged = [];
        available.forEach(function(a) {
            var type = byId[a.itemId];
            if (type === undefined) { type = 'PINNED'; }
            merged.push({ itemId: a.itemId, name: a.name, type: type });
        });
        var orderSet = {};
        order.forEach(function(id) { orderSet[id] = true; });
        var ordered = [];
        order.forEach(function(id) {
            var found = merged.find(function(m) { return m.itemId === id; });
            if (found) { ordered.push(found); }
        });
        merged.forEach(function(m) {
            if (!orderSet[m.itemId]) { ordered.push(m); }
        });

        listEl.innerHTML = '';
        ordered.forEach(function(item) {
            var row = document.createElement('div');
            row.className = 'wholphin-nav-drawer-row';
            row.setAttribute('data-item-id', item.itemId);
            var handle = document.createElement('span');
            handle.className = 'wholphin-nav-drawer-handle';
            handle.setAttribute('aria-hidden', 'true');
            handle.textContent = '::';
            var label = document.createElement('span');
            label.className = 'wholphin-nav-drawer-label';
            label.textContent = item.name;
            var checkWrap = document.createElement('label');
            checkWrap.className = 'emby-checkbox-label';
            var check = document.createElement('input');
            check.type = 'checkbox';
            check.checked = item.type === 'PINNED';
            checkWrap.appendChild(check);
            checkWrap.appendChild(document.createTextNode(' Show in nav bar'));
            row.appendChild(handle);
            row.appendChild(label);
            row.appendChild(checkWrap);
            listEl.appendChild(row);
        });

        if (window.Sortable) {
            Sortable.create(listEl, {
                handle: '.wholphin-nav-drawer-handle',
                animation: 150
            });
        }

        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
    }).catch(function() {
        listEl.textContent = 'Could not load nav items. Check the user has access to libraries.';
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
    });
}

function closeNavDrawerModal() {
    var overlay = document.getElementById('NavDrawerModal');
    if (overlay) {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        overlay._navStore = null;
    }
}

document.querySelectorAll('.wholphin-tab').forEach(function(btn) {
    btn.addEventListener('click', function() {
        switchTab(btn.getAttribute('data-tab'));
    });
});

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
            VisibleFrom: null,
            VisibleTo: null,
            ShuffleRowCount: null,
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

            if (currentTab === 'Settings') {
                var settingsData = serializeSettings();
                if (currentScopeKey === 'Global') {
                    currentConfig.GlobalSettings = settingsData;
                } else {
                    if (settingsData[USE_GLOBAL_SETTINGS_KEY] === 'true') {
                        profile.UserSettings = { use_global_settings: 'true' };
                    } else {
                        var existingUserSettings = profile.UserSettings || {};
                        profile.UserSettings = Object.assign({}, existingUserSettings, settingsData);
                    }
                }
            }

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
