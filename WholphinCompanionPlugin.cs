// <copyright file="WholphinCompanionPlugin.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion
{
    using System;
    using System.Collections.Generic;
    using System.Globalization;
    using Jellyfin.Plugin.WholphinCompanion.Configuration;
    using MediaBrowser.Common.Configuration;
    using MediaBrowser.Common.Plugins;
    using MediaBrowser.Model.Plugins;
    using MediaBrowser.Model.Serialization;

    /// <summary>
    /// The main plugin.
    /// </summary>
    public class WholphinCompanionPlugin : BasePlugin<PluginConfiguration>, IHasWebPages
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="WholphinCompanionPlugin"/> class.
        /// </summary>
        /// <param name="applicationPaths">Instance of the <see cref="IApplicationPaths"/> interface.</param>
        /// <param name="xmlSerializer">Instance of the <see cref="IXmlSerializer"/> interface.</param>
        public WholphinCompanionPlugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer)
            : base(applicationPaths, xmlSerializer)
        {
            Instance = this;
            this.ConfigStore = new WholphinConfigStore(applicationPaths);
        }

        /// <summary>
        /// Gets the current plugin instance.
        /// </summary>
        public static WholphinCompanionPlugin? Instance { get; private set; }

        /// <summary>
        /// Gets the configuration store.
        /// </summary>
        public WholphinConfigStore ConfigStore { get; }

        /// <inheritdoc />
        public override string Name => "Wholphin Companion";

        /// <inheritdoc />
        public override Guid Id => Guid.Parse("c54a4aaf-ffba-4a5a-b2de-8c0d38e21229");

        /// <inheritdoc />
        public IEnumerable<PluginPageInfo> GetPages()
        {
            return
            [
                new PluginPageInfo
                {
                    Name = this.Name,
                    EmbeddedResourcePath = string.Format(
                        CultureInfo.InvariantCulture,
                        "{0}.Configuration.configPage.html",
                        this.GetType().Namespace),
                },
                new PluginPageInfo
                {
                    Name = "WholphinCompanion.css",
                    EmbeddedResourcePath = string.Format(
                        CultureInfo.InvariantCulture,
                        "{0}.Configuration.configPage.css",
                        this.GetType().Namespace),
                },
                new PluginPageInfo
                {
                    Name = "WholphinCompanion.js",
                    EmbeddedResourcePath = string.Format(
                        CultureInfo.InvariantCulture,
                        "{0}.Configuration.configPage.js",
                        this.GetType().Namespace),
                },
            ];
        }
    }
}
