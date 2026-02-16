// <copyright file="WholphinConfigResponse.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion.Controllers
{
    using System.Collections.Generic;
    using System.Collections.ObjectModel;

    /// <summary>
    /// API response wrapper for GET /Wholphin/Config.
    /// </summary>
    public class WholphinConfigResponse
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="WholphinConfigResponse"/> class.
        /// </summary>
        public WholphinConfigResponse()
        {
            this.Layout = new Collection<HomeSectionResponse>();
            this.LibraryLayouts = new Dictionary<string, List<HomeSectionResponse>>();
        }

        /// <summary>
        /// Gets the home layout sections.
        /// </summary>
        public Collection<HomeSectionResponse> Layout { get; }

        /// <summary>
        /// Gets the library layouts. Key is Jellyfin view (library) id; value is the same section/row structure as Layout.
        /// </summary>
        public Dictionary<string, List<HomeSectionResponse>> LibraryLayouts { get; }
    }
}
