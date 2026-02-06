// <copyright file="LayoutProfileEntry.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion.Configuration
{
    /// <summary>
    /// Serializable layout profile entry.
    /// </summary>
    public class LayoutProfileEntry
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="LayoutProfileEntry"/> class.
        /// </summary>
        public LayoutProfileEntry()
        {
            this.Key = LayoutProfile.GlobalKey;
            this.Profile = new LayoutProfile();
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="LayoutProfileEntry"/> class.
        /// </summary>
        /// <param name="key">The profile key.</param>
        /// <param name="profile">The profile value.</param>
        public LayoutProfileEntry(string key, LayoutProfile profile)
        {
            this.Key = key;
            this.Profile = profile;
        }

        /// <summary>
        /// Gets or sets the profile key.
        /// </summary>
        public string Key { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the profile value.
        /// </summary>
        public LayoutProfile Profile { get; set; } = new LayoutProfile();
    }
}
