// <copyright file="HomeLayout.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion.Configuration
{
    using System.Collections.Generic;
    using System.Diagnostics.CodeAnalysis;

    /// <summary>
    /// Home layout configuration.
    /// </summary>
    public class HomeLayout
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="HomeLayout"/> class.
        /// </summary>
        public HomeLayout()
        {
            this.Sections = new List<HomeSection>();
        }

        /// <summary>
        /// Gets or sets the home sections.
        /// </summary>
        [SuppressMessage("Design", "CA1002:Do not expose generic lists", Justification = "Serialized plugin configuration.")]
        [SuppressMessage("Usage", "CA2227:Collection properties should be read only", Justification = "Serialized plugin configuration.")]
        public List<HomeSection> Sections { get; set; }
    }
}
