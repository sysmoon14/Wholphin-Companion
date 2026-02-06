// <copyright file="HomeRowType.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion.Configuration
{
    /// <summary>
    /// Supported row types.
    /// </summary>
    public enum HomeRowType
    {
        /// <summary>
        /// Built-in system row.
        /// </summary>
        System,

        /// <summary>
        /// A collection row.
        /// </summary>
        Collection,

        /// <summary>
        /// A smart query row.
        /// </summary>
        SmartQuery,
    }
}
