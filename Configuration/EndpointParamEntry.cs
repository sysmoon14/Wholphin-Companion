// <copyright file="EndpointParamEntry.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion.Configuration
{
    /// <summary>
    /// Serializable endpoint parameter entry.
    /// </summary>
    public class EndpointParamEntry
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="EndpointParamEntry"/> class.
        /// </summary>
        public EndpointParamEntry()
        {
            this.Key = string.Empty;
            this.Value = string.Empty;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="EndpointParamEntry"/> class.
        /// </summary>
        /// <param name="key">The parameter key.</param>
        /// <param name="value">The parameter value.</param>
        public EndpointParamEntry(string key, string value)
        {
            this.Key = key;
            this.Value = value;
        }

        /// <summary>
        /// Gets or sets the parameter key.
        /// </summary>
        public string Key { get; set; }

        /// <summary>
        /// Gets or sets the parameter value.
        /// </summary>
        public string Value { get; set; }
    }
}
