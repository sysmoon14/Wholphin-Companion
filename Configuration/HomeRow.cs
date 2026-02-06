// <copyright file="HomeRow.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion.Configuration
{
    using System.Collections.Generic;
    using System.Diagnostics.CodeAnalysis;

    /// <summary>
    /// A row within a home section.
    /// </summary>
    public class HomeRow
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="HomeRow"/> class.
        /// </summary>
        public HomeRow()
        {
            this.EndpointParams = new List<EndpointParamEntry>();
        }

        /// <summary>
        /// Gets or sets the row type.
        /// </summary>
        public HomeRowType RowType { get; set; }

        /// <summary>
        /// Gets or sets the row label.
        /// </summary>
        public string Label { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the native row key when using a system row.
        /// </summary>
        public string? NativeRowKey { get; set; }

        /// <summary>
        /// Gets or sets the plugin id used by collections.
        /// </summary>
        public string? PluginId { get; set; }

        /// <summary>
        /// Gets or sets the additional endpoint parameters.
        /// </summary>
        [SuppressMessage("Design", "CA1002:Do not expose generic lists", Justification = "Serialized plugin configuration.")]
        [SuppressMessage("Usage", "CA2227:Collection properties should be read only", Justification = "Serialized plugin configuration.")]
        public List<EndpointParamEntry> EndpointParams { get; set; }
    }
}
