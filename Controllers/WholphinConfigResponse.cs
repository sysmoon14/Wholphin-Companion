// <copyright file="WholphinConfigResponse.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion.Controllers
{
    using System.Collections.ObjectModel;

    /// <summary>
    /// API response wrapper.
    /// </summary>
    public class WholphinConfigResponse
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="WholphinConfigResponse"/> class.
        /// </summary>
        public WholphinConfigResponse()
        {
            this.Layout = new Collection<HomeSectionResponse>();
        }

        /// <summary>
        /// Gets the layout sections.
        /// </summary>
        public Collection<HomeSectionResponse> Layout { get; }
    }
}
