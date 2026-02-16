// <copyright file="WholphinController.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using System.Diagnostics.CodeAnalysis;
    using System.Net.Http;
    using System.Security.Cryptography;
    using System.Text.Json;
    using System.Text.Json.Nodes;
    using Jellyfin.Plugin.WholphinCompanion.Configuration;
    using Microsoft.AspNetCore.Mvc;

    /// <summary>
    /// Wholphin Companion configuration controller.
    /// </summary>
    [ApiController]
    [Route("Wholphin")]
    [SuppressMessage("Performance", "CA1822:Mark members as static", Justification = "Keep helper methods instance for consistent ordering.")]
    public class WholphinController : ControllerBase
    {
        private static readonly HttpClient SharedHttpClient = new HttpClient();

        /// <summary>
        /// Keys that appear only in the "Global (device-only)" section; returned in global object only.
        /// </summary>
        private static readonly HashSet<string> DeviceOnlySettingKeys = new HashSet<string>(StringComparer.Ordinal)
        {
            "sign_in_auto",
            "update_url",
            "max_bitrate",
        };

        /// <summary>
        /// Returns the admin configuration from the JSON store.
        /// </summary>
        /// <returns>The persisted configuration.</returns>
        [HttpGet("AdminConfig")]
        public ActionResult<PluginConfiguration> GetAdminConfig()
        {
            var store = WholphinCompanionPlugin.Instance?.ConfigStore;
            if (store is null)
            {
                return this.Ok(new PluginConfiguration());
            }

            return this.Ok(store.Load());
        }

        /// <summary>
        /// Persists the admin configuration to the JSON store.
        /// </summary>
        /// <param name="configuration">The configuration to save.</param>
        /// <returns>Success response.</returns>
        [HttpPost("AdminConfig")]
        public ActionResult SaveAdminConfig([FromBody] PluginConfiguration configuration)
        {
            var store = WholphinCompanionPlugin.Instance?.ConfigStore;
            if (store is null)
            {
                return this.Ok();
            }

            store.Save(configuration);
            return this.Ok();
        }

        /// <summary>
        /// Returns the resolved layout configuration for the current user.
        /// </summary>
        /// <param name="userId">Optional user id override.</param>
        /// <returns>The resolved layout recipe.</returns>
        [HttpGet("Config")]
        public ActionResult<WholphinConfigResponse> GetConfig([FromQuery] string? userId = null)
        {
            var store = WholphinCompanionPlugin.Instance?.ConfigStore;
            var configuration = store?.Load();
            if (configuration is null)
            {
                return this.Ok(new WholphinConfigResponse());
            }

            var resolvedUserId = this.ResolveUserId(userId);
            var becauseYouWatchedUserId = !string.IsNullOrWhiteSpace(userId) ? userId : resolvedUserId;

            var profile = this.ResolveProfile(configuration, resolvedUserId);
            var becauseYouWatchedCount = this.CountBecauseYouWatchedRows(profile);
            var becauseYouWatchedItems = this.GetBecauseYouWatchedItemIds(becauseYouWatchedUserId, becauseYouWatchedCount);
            var today = DateTime.UtcNow.Date;

            var response = new WholphinConfigResponse();
            foreach (var section in this.BuildSectionsResponse(profile.HomeLayout.Sections, becauseYouWatchedItems, today))
            {
                response.Layout.Add(section);
            }

            if (profile.LibraryLayout?.LibrarySections != null)
            {
                foreach (var kvp in profile.LibraryLayout.LibrarySections)
                {
                    var viewId = kvp.Key;
                    var homeLayout = kvp.Value;
                    if (string.IsNullOrWhiteSpace(viewId) || homeLayout?.Sections == null)
                    {
                        continue;
                    }

                    var libraryBecauseYouWatchedCount = this.CountBecauseYouWatchedRowsInSections(homeLayout.Sections);
                    var libraryBecauseYouWatchedItems = this.GetBecauseYouWatchedItemIds(
                        becauseYouWatchedUserId,
                        libraryBecauseYouWatchedCount,
                        viewId);

                    var librarySections = this.BuildSectionsResponse(
                        homeLayout.Sections,
                        libraryBecauseYouWatchedItems,
                        today);
                    response.LibraryLayouts[viewId] = librarySections;
                }
            }

            return this.Ok(response);
        }

        /// <summary>
        /// Returns effective settings. Global contains only device-only keys. User contains all other settings
        /// with inheritance applied (use_global_settings or use_global_keys).
        /// </summary>
        /// <param name="userId">Optional user id override.</param>
        /// <returns>Global = device-only keys; User = everything else with effective values.</returns>
        [HttpGet("Settings")]
        public ActionResult<WholphinSettingsResponse> GetSettings([FromQuery] string? userId = null)
        {
            var store = WholphinCompanionPlugin.Instance?.ConfigStore;
            var configuration = store?.Load();
            if (configuration is null)
            {
                return this.Ok(new WholphinSettingsResponse());
            }

            var resolvedUserId = this.ResolveUserId(userId);
            var globalSettings = configuration.GlobalSettings ?? new Dictionary<string, string>();
            var profile = this.ResolveProfile(configuration, resolvedUserId);
            var userSettings = profile?.UserSettings ?? new Dictionary<string, string>();

            var useGlobalSettings = userSettings.TryGetValue("use_global_settings", out var ugs) && ugs == "true";
            var useGlobalKeys = new HashSet<string>(StringComparer.Ordinal);
            if (userSettings.TryGetValue("use_global_keys", out var ugk) && !string.IsNullOrEmpty(ugk))
            {
                try
                {
                    var arr = JsonSerializer.Deserialize<string[]>(ugk);
                    if (arr != null)
                    {
                        foreach (var k in arr)
                        {
                            if (!string.IsNullOrEmpty(k))
                            {
                                useGlobalKeys.Add(k);
                            }
                        }
                    }
                }
                catch (JsonException)
                {
                    // ignore
                }
            }

            var globalOnly = new Dictionary<string, string>();
            foreach (var key in DeviceOnlySettingKeys)
            {
                if (globalSettings.TryGetValue(key, out var val))
                {
                    globalOnly[key] = val;
                }
            }

            var effective = new Dictionary<string, object?>();

            foreach (var kvp in globalSettings)
            {
                if (DeviceOnlySettingKeys.Contains(kvp.Key))
                {
                    continue;
                }

                effective[kvp.Key] = kvp.Value;
            }

            foreach (var kvp in userSettings)
            {
                var key = kvp.Key;
                var value = kvp.Value;
                if (key == "use_global_settings" || key == "use_global_keys")
                {
                    continue;
                }

                if (DeviceOnlySettingKeys.Contains(key))
                {
                    continue;
                }

                if (key == "seerr_credentials" || key == "nav_drawer_items")
                {
                    if (string.IsNullOrEmpty(value))
                    {
                        continue;
                    }

                    try
                    {
                        effective[key] = JsonNode.Parse(value);
                    }
                    catch (JsonException)
                    {
                        effective[key] = value;
                    }

                    continue;
                }

                if (useGlobalSettings)
                {
                    if (globalSettings.TryGetValue(key, out var globalVal))
                    {
                        effective[key] = globalVal;
                    }
                    else
                    {
                        effective[key] = value;
                    }

                    continue;
                }

                if (useGlobalKeys.Contains(key))
                {
                    if (globalSettings.TryGetValue(key, out var globalVal))
                    {
                        effective[key] = globalVal;
                    }
                    else
                    {
                        effective[key] = value;
                    }
                }
                else
                {
                    effective[key] = value;
                }
            }

            foreach (var kvp in userSettings)
            {
                if (effective.ContainsKey(kvp.Key))
                {
                    continue;
                }

                if (kvp.Key == "use_global_settings" || kvp.Key == "use_global_keys" || DeviceOnlySettingKeys.Contains(kvp.Key))
                {
                    continue;
                }

                var key = kvp.Key;
                var value = kvp.Value;
                if (key == "seerr_credentials" || key == "nav_drawer_items")
                {
                    if (string.IsNullOrEmpty(value))
                    {
                        continue;
                    }

                    try
                    {
                        effective[key] = JsonNode.Parse(value);
                    }
                    catch (JsonException)
                    {
                        effective[key] = value;
                    }
                }
                else
                {
                    effective[key] = value;
                }
            }

            var response = new WholphinSettingsResponse
            {
                Global = globalOnly,
                User = effective,
            };

            return this.Ok(response);
        }

        private LayoutProfile ResolveProfile(PluginConfiguration configuration, string? userId)
        {
            if (userId is not null)
            {
                var userProfileEntry = configuration.LayoutProfiles.Find(entry => entry.Key == userId);
                if (userProfileEntry is not null)
                {
                    return userProfileEntry.Profile;
                }
            }

            var globalProfileEntry = configuration.LayoutProfiles.Find(entry => entry.Key == LayoutProfile.GlobalKey);
            if (globalProfileEntry is not null)
            {
                return globalProfileEntry.Profile;
            }

            return new LayoutProfile();
        }

        private List<HomeSectionResponse> BuildSectionsResponse(
            IList<HomeSection> sections,
            List<string> becauseYouWatchedItems,
            DateTime today)
        {
            var response = new List<HomeSectionResponse>();
            var becauseYouWatchedIndex = 0;

            foreach (var section in sections)
            {
                if (!this.IsSectionVisibleToday(section, today))
                {
                    continue;
                }

                var rows = new List<HomeRowResponse>();
                foreach (var row in section.HomeRows)
                {
                    var responseRow = new HomeRowResponse
                    {
                        Type = this.ToRowTypeString(row.RowType),
                        Label = row.Label,
                        PluginId = row.PluginId,
                        HideWatchedItems = row.HideWatchedItems,
                    };

                    foreach (var param in row.EndpointParams)
                    {
                        if (!string.IsNullOrWhiteSpace(param.Key))
                        {
                            responseRow.EndpointParams[param.Key] = param.Value ?? string.Empty;
                        }
                    }

                    if (row.RowType == HomeRowType.System && !string.IsNullOrWhiteSpace(row.NativeRowKey))
                    {
                        responseRow.EndpointParams["NativeRow"] = row.NativeRowKey;
                        if (string.IsNullOrWhiteSpace(responseRow.Label))
                        {
                            responseRow.Label = this.GetNativeRowLabel(row.NativeRowKey);
                        }
                    }

                    if (row.RowType == HomeRowType.System
                        && string.Equals(row.NativeRowKey, "BecauseYouWatched", System.StringComparison.Ordinal)
                        && becauseYouWatchedIndex < becauseYouWatchedItems.Count)
                    {
                        responseRow.EndpointParams["ItemId"] = becauseYouWatchedItems[becauseYouWatchedIndex];
                        becauseYouWatchedIndex++;
                    }

                    rows.Add(responseRow);
                }

                if (section.ShuffleRows)
                {
                    this.ShuffleInPlace(rows);
                    if (section.ShuffleRowCount.HasValue && section.ShuffleRowCount.Value > 0 && rows.Count > section.ShuffleRowCount.Value)
                    {
                        rows = rows.GetRange(0, section.ShuffleRowCount.Value);
                    }
                }

                var sectionResponse = new HomeSectionResponse
                {
                    Type = "section",
                    Title = section.Title,
                };

                foreach (var responseRow in rows)
                {
                    sectionResponse.Rows.Add(responseRow);
                }

                response.Add(sectionResponse);
            }

            return response;
        }

        private int CountBecauseYouWatchedRows(LayoutProfile profile)
        {
            return this.CountBecauseYouWatchedRowsInSections(profile.HomeLayout.Sections);
        }

        private int CountBecauseYouWatchedRowsInSections(IList<HomeSection> sections)
        {
            var count = 0;
            foreach (var section in sections)
            {
                foreach (var row in section.HomeRows)
                {
                    if (row.RowType == HomeRowType.System
                        && string.Equals(row.NativeRowKey, "BecauseYouWatched", System.StringComparison.Ordinal))
                    {
                        count++;
                    }
                }
            }

            return count;
        }

        private List<string> GetBecauseYouWatchedItemIds(string? userId, int count)
        {
            return this.GetBecauseYouWatchedItemIds(userId, count, null);
        }

        private List<string> GetBecauseYouWatchedItemIds(string? userId, int count, string? parentId)
        {
            var results = new Collection<string>();
            if (count <= 0 || string.IsNullOrWhiteSpace(userId) || !this.Request.Host.HasValue)
            {
                return new List<string>();
            }

            var apiKey = this.TryGetApiKey();
            var baseUrl = $"{this.Request.Scheme}://{this.Request.Host.Value}";

            // When scoped to a library (parentId set), include Episode so we get played episodes in Shows libraries.
            // For Episodes we use SeriesId as the seed so "Because you watched" gets a Series id.
            var includeTypes = string.IsNullOrWhiteSpace(parentId)
                ? "Movie,Series"
                : "Movie,Series,Episode";
            var url = $"{baseUrl}/Users/{userId}/Items"
                + "?IncludeItemTypes=" + includeTypes
                + "&Filters=IsPlayed&Recursive=true&SortBy=DatePlayed&SortOrder=Descending&Limit=" + (count + 20);

            if (!string.IsNullOrWhiteSpace(parentId))
            {
                url += "&ParentId=" + System.Uri.EscapeDataString(parentId);
            }

            if (!string.IsNullOrWhiteSpace(apiKey))
            {
                url += "&api_key=" + System.Uri.EscapeDataString(apiKey);
            }

            var requestUri = new System.Uri(url, System.UriKind.Absolute);
            using var request = new HttpRequestMessage(HttpMethod.Get, requestUri);

            if (this.Request.Headers.TryGetValue("X-Emby-Token", out var tokenHeader))
            {
                request.Headers.TryAddWithoutValidation("X-Emby-Token", tokenHeader.ToString());
            }

            if (this.Request.Headers.TryGetValue("X-Emby-Authorization", out var authHeader))
            {
                request.Headers.TryAddWithoutValidation("X-Emby-Authorization", authHeader.ToString());
            }

            if (this.Request.Headers.TryGetValue("X-Emby-User-Id", out var userHeader))
            {
                request.Headers.TryAddWithoutValidation("X-Emby-User-Id", userHeader.ToString());
            }
            else
            {
                request.Headers.TryAddWithoutValidation("X-Emby-User-Id", userId);
            }

            var response = SharedHttpClient.Send(request);
            if (!response.IsSuccessStatusCode)
            {
                return new List<string>();
            }

            var json = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
            using var document = JsonDocument.Parse(json);
            if (!document.RootElement.TryGetProperty("Items", out var itemsElement) || itemsElement.ValueKind != JsonValueKind.Array)
            {
                return new List<string>();
            }

            var seenIds = new HashSet<string>(StringComparer.Ordinal);
            foreach (var item in itemsElement.EnumerateArray())
            {
                var seedId = this.GetBecauseYouWatchedSeedId(item);
                if (!string.IsNullOrWhiteSpace(seedId) && seenIds.Add(seedId))
                {
                    results.Add(seedId);
                }
            }

            this.ShuffleInPlace(results);
            if (results.Count > count)
            {
                var trimmed = new Collection<string>();
                for (var i = 0; i < count; i++)
                {
                    trimmed.Add(results[i]);
                }

                results = trimmed;
            }

            return new List<string>(results);
        }

        /// <summary>
        /// Gets the item id to use as a "Because you watched" seed. For Episode items returns SeriesId so the client gets a Series id; otherwise returns the item Id.
        /// </summary>
        private string? GetBecauseYouWatchedSeedId(JsonElement item)
        {
            if (!item.TryGetProperty("Id", out var idElement) || idElement.ValueKind != JsonValueKind.String)
            {
                return null;
            }

            var type = string.Empty;
            if (item.TryGetProperty("Type", out var typeElement) && typeElement.ValueKind == JsonValueKind.String)
            {
                type = typeElement.GetString() ?? string.Empty;
            }

            if (string.Equals(type, "Episode", StringComparison.OrdinalIgnoreCase))
            {
                // Use SeriesId (PascalCase or camelCase) so "Because you watched" gets a Series id.
                if ((item.TryGetProperty("SeriesId", out var sid) || item.TryGetProperty("seriesId", out sid))
                    && sid.ValueKind == JsonValueKind.String)
                {
                    var seriesId = sid.GetString();
                    if (!string.IsNullOrWhiteSpace(seriesId))
                    {
                        return seriesId;
                    }
                }
            }

            var idValue = idElement.GetString();
            return string.IsNullOrWhiteSpace(idValue) ? null : idValue;
        }

        private string ToRowTypeString(HomeRowType rowType)
        {
            return rowType switch
            {
                HomeRowType.System => "system",
                HomeRowType.Collection => "collection",
                HomeRowType.SmartQuery => "smart",
                _ => "system",
            };
        }

        private string GetNativeRowLabel(string nativeRowKey)
        {
            return nativeRowKey switch
            {
                "ContinueWatching" => "Continue Watching",
                "NextUp" => "Next Up",
                "ContinueWatchingCombined" => "Continue Watching (Combined)",
                "RecentlyAddedMovies" => "Recently Added Movies",
                "RecentlyAddedShows" => "Recently Added Shows",
                "RecentlyAddedEpisodes" => "Recently Added Episodes",
                "LatestMovies" => "Latest Movies",
                "LatestShows" => "Latest Shows",
                "LatestEpisodes" => "Latest Episodes",
                "BecauseYouWatched" => "Because You Watched",
                "WatchItAgain" => "Watch it Again",
                "Suggestions" => "Suggestions",
                "TopRatedUnwatched" => "Top Rated Unwatched",
                _ => nativeRowKey,
            };
        }

        private bool IsSectionVisibleToday(HomeSection section, DateTime today)
        {
            if (!string.IsNullOrWhiteSpace(section.VisibleFrom) && DateTime.TryParse(section.VisibleFrom, out var from))
            {
                if (today < from.Date)
                {
                    return false;
                }
            }

            if (!string.IsNullOrWhiteSpace(section.VisibleTo) && DateTime.TryParse(section.VisibleTo, out var to))
            {
                if (today > to.Date)
                {
                    return false;
                }
            }

            return true;
        }

        private void ShuffleInPlace(List<HomeRowResponse> list)
        {
            for (var i = list.Count - 1; i > 0; i--)
            {
                var j = RandomNumberGenerator.GetInt32(i + 1);
                (list[i], list[j]) = (list[j], list[i]);
            }
        }

        private void ShuffleInPlace(Collection<string> list)
        {
            for (var i = list.Count - 1; i > 0; i--)
            {
                var j = RandomNumberGenerator.GetInt32(i + 1);
                (list[i], list[j]) = (list[j], list[i]);
            }
        }

        private string? ResolveUserId(string? fallbackUserId)
        {
            if (!string.IsNullOrWhiteSpace(fallbackUserId))
            {
                return fallbackUserId;
            }

            if (this.Request.Headers.TryGetValue("X-Emby-User-Id", out var userIdHeader))
            {
                var headerValue = userIdHeader.ToString();
                if (!string.IsNullOrWhiteSpace(headerValue))
                {
                    return headerValue;
                }
            }

            if (this.Request.Headers.TryGetValue("X-Emby-Authorization", out var authHeader))
            {
                var parsedUserId = this.TryParseUserIdFromAuthorization(authHeader.ToString());
                if (!string.IsNullOrWhiteSpace(parsedUserId))
                {
                    return parsedUserId;
                }
            }

            return null;
        }

        private string? TryGetApiKey()
        {
            if (this.Request.Headers.TryGetValue("X-Emby-Token", out var tokenHeader))
            {
                var token = tokenHeader.ToString();
                if (!string.IsNullOrWhiteSpace(token))
                {
                    return token;
                }
            }

            if (this.Request.Query.TryGetValue("api_key", out var queryToken))
            {
                var token = queryToken.ToString();
                if (!string.IsNullOrWhiteSpace(token))
                {
                    return token;
                }
            }

            return null;
        }

        private string? TryParseUserIdFromAuthorization(string? headerValue)
        {
            if (string.IsNullOrWhiteSpace(headerValue))
            {
                return null;
            }

            var userIdKey = "UserId=\"";
            var userIdIndex = headerValue.IndexOf(userIdKey, System.StringComparison.OrdinalIgnoreCase);
            if (userIdIndex < 0)
            {
                return null;
            }

            userIdIndex += userIdKey.Length;
            var endIndex = headerValue.IndexOf('"', userIdIndex);
            if (endIndex <= userIdIndex)
            {
                return null;
            }

            return headerValue.Substring(userIdIndex, endIndex - userIdIndex);
        }
    }
}
