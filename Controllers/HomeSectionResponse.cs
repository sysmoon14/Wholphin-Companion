// <copyright file="HomeSectionResponse.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion.Controllers
{
    using System.Collections.ObjectModel;

    /// <summary>
    /// Serializable section response.
    /// </summary>
    public class HomeSectionResponse
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="HomeSectionResponse"/> class.
        /// </summary>
        public HomeSectionResponse()
        {
            this.Rows = new Collection<HomeRowResponse>();
        }

        /// <summary>
        /// Gets or sets the section type.
        /// </summary>
        public string Type { get; set; } = "section";

        /// <summary>
        /// Gets or sets the section title.
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Gets the row list.
        /// </summary>
        public Collection<HomeRowResponse> Rows { get; }
    }
}
