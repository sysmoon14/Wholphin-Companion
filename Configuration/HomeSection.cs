// <copyright file="HomeSection.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion.Configuration
{
    using System.Collections.Generic;
    using System.Diagnostics.CodeAnalysis;

    /// <summary>
    /// A section of the home layout.
    /// </summary>
    public class HomeSection
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="HomeSection"/> class.
        /// </summary>
        public HomeSection()
        {
            this.HomeRows = new List<HomeRow>();
        }

        /// <summary>
        /// Gets or sets the section title.
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets a value indicating whether to shuffle rows.
        /// </summary>
        public bool ShuffleRows { get; set; }

        /// <summary>
        /// Gets or sets the date from which the section is visible (inclusive). ISO date string (yyyy-MM-dd) or null/empty for no start limit.
        /// </summary>
        public string? VisibleFrom { get; set; }

        /// <summary>
        /// Gets or sets the date until which the section is visible (inclusive). ISO date string (yyyy-MM-dd) or null/empty for no end limit.
        /// </summary>
        public string? VisibleTo { get; set; }

        /// <summary>
        /// Gets or sets, when <see cref="ShuffleRows"/> is true, how many rows are returned (e.g. show 3 random from 10). Null or 0 means show all.
        /// </summary>
        public int? ShuffleRowCount { get; set; }

        /// <summary>
        /// Gets or sets the home rows.
        /// </summary>
        [SuppressMessage("Design", "CA1002:Do not expose generic lists", Justification = "Serialized plugin configuration.")]
        [SuppressMessage("Usage", "CA2227:Collection properties should be read only", Justification = "Serialized plugin configuration.")]
        public List<HomeRow> HomeRows { get; set; }
    }
}
