// <copyright file="LayoutProfile.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion.Configuration
{
    using System.Collections.Generic;
    using System.Diagnostics.CodeAnalysis;

    /// <summary>
    /// Per-user or global layout profile.
    /// </summary>
    public class LayoutProfile
    {
        /// <summary>
        /// Key used for the global profile.
        /// </summary>
        public const string GlobalKey = "Global";

        /// <summary>
        /// Initializes a new instance of the <see cref="LayoutProfile"/> class.
        /// </summary>
        public LayoutProfile()
        {
            this.HomeLayout = new HomeLayout();
            this.LibraryLayout = new LibraryLayout();
            this.ThemeSettings = new ThemeSettings();
            this.UserSettings = new Dictionary<string, string>();
        }

        /// <summary>
        /// Gets or sets the home layout settings.
        /// </summary>
        public HomeLayout HomeLayout { get; set; }

        /// <summary>
        /// Gets or sets the library layout settings.
        /// </summary>
        public LibraryLayout LibraryLayout { get; set; }

        /// <summary>
        /// Gets or sets the theme settings.
        /// </summary>
        public ThemeSettings ThemeSettings { get; set; }

        /// <summary>
        /// Gets or sets per-user Wholphin setting overrides (key -> value).
        /// </summary>
        [SuppressMessage("Usage", "CA2227:Collection properties should be read only", Justification = "Serialized plugin configuration.")]
        public Dictionary<string, string> UserSettings { get; set; }
    }
}
