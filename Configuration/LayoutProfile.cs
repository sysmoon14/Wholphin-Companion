// <copyright file="LayoutProfile.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion.Configuration
{
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
    }
}
