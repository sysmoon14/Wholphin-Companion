// <copyright file="WholphinController.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion.Controllers
{
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using System.Diagnostics.CodeAnalysis;
    using System.Net.Http;
    using System.Security.Cryptography;
    using System.Text.Json;
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
            var layout = this.BuildLayoutResponse(profile, becauseYouWatchedItems);

            var response = new WholphinConfigResponse();
            foreach (var section in layout)
            {
                response.Layout.Add(section);
            }

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

        private Collection<HomeSectionResponse> BuildLayoutResponse(LayoutProfile profile, List<string> becauseYouWatchedItems)
        {
            var response = new Collection<HomeSectionResponse>();
            var becauseYouWatchedIndex = 0;

            foreach (var section in profile.HomeLayout.Sections)
            {
                var rows = new List<HomeRowResponse>();
                foreach (var row in section.HomeRows)
                {
                    if (row.RowType == HomeRowType.System
                        && string.Equals(row.NativeRowKey, "BecauseYouWatched", System.StringComparison.Ordinal)
                        && becauseYouWatchedIndex >= becauseYouWatchedItems.Count)
                    {
                        continue;
                    }

                    var responseRow = new HomeRowResponse
                    {
                        Type = this.ToRowTypeString(row.RowType),
                        Label = row.Label,
                        PluginId = row.PluginId,
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
            var count = 0;
            foreach (var section in profile.HomeLayout.Sections)
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
            var results = new Collection<string>();
            if (count <= 0 || string.IsNullOrWhiteSpace(userId) || !this.Request.Host.HasValue)
            {
                return new List<string>();
            }

            var apiKey = this.TryGetApiKey();
            var baseUrl = $"{this.Request.Scheme}://{this.Request.Host.Value}";
            var url = $"{baseUrl}/Users/{userId}/Items"
                + $"?IncludeItemTypes=Movie,Series&Filters=IsPlayed&Recursive=true&SortBy=DatePlayed&SortOrder=Descending&Limit={count + 10}";

            if (!string.IsNullOrWhiteSpace(apiKey))
            {
                url += $"&api_key={System.Uri.EscapeDataString(apiKey)}";
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

            foreach (var item in itemsElement.EnumerateArray())
            {
                if (item.TryGetProperty("Id", out var idElement) && idElement.ValueKind == JsonValueKind.String)
                {
                    var idValue = idElement.GetString();
                    if (!string.IsNullOrWhiteSpace(idValue))
                    {
                        results.Add(idValue);
                    }
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
                "LatestMovies" => "Latest Movies",
                "LatestShows" => "Latest Shows",
                "BecauseYouWatched" => "Because You Watched",
                "WatchItAgain" => "Watch it Again",
                _ => nativeRowKey,
            };
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
