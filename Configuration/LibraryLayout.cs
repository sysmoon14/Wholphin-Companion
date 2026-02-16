// <copyright file="LibraryLayout.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion.Configuration
{
    using System.Collections.Generic;
    using System.Diagnostics.CodeAnalysis;

    /// <summary>
    /// Library layout configuration. Holds per-library row layouts keyed by library (view) id.
    /// </summary>
    public class LibraryLayout
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="LibraryLayout"/> class.
        /// </summary>
        public LibraryLayout()
        {
            this.LibrarySections = new Dictionary<string, HomeLayout>();
        }

        /// <summary>
        /// Gets or sets the layout per library. Key is the Jellyfin view (library) id.
        /// </summary>
        [SuppressMessage("Usage", "CA2227:Collection properties should be read only", Justification = "Serialized plugin configuration.")]
        public Dictionary<string, HomeLayout> LibrarySections { get; set; }
    }
}
