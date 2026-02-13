// <copyright file="WholphinSettingsResponse.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion.Controllers
{
    using System.Collections.Generic;
    using System.Diagnostics.CodeAnalysis;

    /// <summary>
    /// Merged settings for the Wholphin app (global + user).
    /// </summary>
    public class WholphinSettingsResponse
    {
        /// <summary>
        /// Gets or sets device-wide settings (key -> string value).
        /// </summary>
        [SuppressMessage("Usage", "CA2227:Collection properties should be read only", Justification = "API response DTO.")]
        public Dictionary<string, string> Global { get; set; } = new Dictionary<string, string>();

        /// <summary>
        /// Gets or sets per-user settings (key -> string or parsed object for seerr_credentials / nav_drawer_items).
        /// </summary>
        [SuppressMessage("Usage", "CA2227:Collection properties should be read only", Justification = "API response DTO.")]
        public Dictionary<string, object?> User { get; set; } = new Dictionary<string, object?>();
    }
}
