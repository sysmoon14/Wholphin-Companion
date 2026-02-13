// <copyright file="HomeRowResponse.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion.Controllers
{
    using System.Collections.Generic;

    /// <summary>
    /// Serializable row response.
    /// </summary>
    public class HomeRowResponse
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="HomeRowResponse"/> class.
        /// </summary>
        public HomeRowResponse()
        {
            this.EndpointParams = new Dictionary<string, string>();
        }

        /// <summary>
        /// Gets or sets the row type.
        /// </summary>
        public string Type { get; set; } = "system";

        /// <summary>
        /// Gets or sets the row label.
        /// </summary>
        public string Label { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the plugin id for collection rows.
        /// </summary>
        public string? PluginId { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the app should exclude watched items when fetching this row (e.g. add IsPlayed=false to the API query).
        /// </summary>
        public bool HideWatchedItems { get; set; }

        /// <summary>
        /// Gets the endpoint parameters.
        /// </summary>
        public Dictionary<string, string> EndpointParams { get; }
    }
}
