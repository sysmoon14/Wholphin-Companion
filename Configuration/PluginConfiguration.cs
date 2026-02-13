// <copyright file="PluginConfiguration.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion.Configuration
{
    using System.Collections.Generic;
    using System.Diagnostics.CodeAnalysis;
    using MediaBrowser.Model.Plugins;

    /// <summary>
    /// Plugin configuration.
    /// </summary>
    public class PluginConfiguration : BasePluginConfiguration
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PluginConfiguration"/> class.
        /// </summary>
        public PluginConfiguration()
        {
            this.LayoutProfiles = new List<LayoutProfileEntry>
            {
                new LayoutProfileEntry(LayoutProfile.GlobalKey, new LayoutProfile()),
            };
            this.GlobalSettings = new Dictionary<string, string>();
        }

        /// <summary>
        /// Gets or sets the layout profiles keyed by user id, with "Global" as default.
        /// </summary>
        [SuppressMessage("Design", "CA1002:Do not expose generic lists", Justification = "Serialized plugin configuration.")]
        [SuppressMessage("Usage", "CA2227:Collection properties should be read only", Justification = "Serialized plugin configuration.")]
        public List<LayoutProfileEntry> LayoutProfiles { get; set; }

        /// <summary>
        /// Gets or sets device-wide Wholphin setting overrides (key -> value).
        /// </summary>
        [SuppressMessage("Usage", "CA2227:Collection properties should be read only", Justification = "Serialized plugin configuration.")]
        public Dictionary<string, string> GlobalSettings { get; set; }
    }
}
