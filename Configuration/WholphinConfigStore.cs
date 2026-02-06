// <copyright file="WholphinConfigStore.cs" company="Wholphin">
// Copyright (c) Wholphin. All rights reserved.
// </copyright>

namespace Jellyfin.Plugin.WholphinCompanion.Configuration
{
    using System;
    using System.IO;
    using System.Text.Json;
    using MediaBrowser.Common.Configuration;

    /// <summary>
    /// JSON configuration store for Wholphin Companion.
    /// </summary>
    public class WholphinConfigStore
    {
        private readonly string configPath;
        private readonly JsonSerializerOptions serializerOptions;

        /// <summary>
        /// Initializes a new instance of the <see cref="WholphinConfigStore"/> class.
        /// </summary>
        /// <param name="applicationPaths">The application paths.</param>
        public WholphinConfigStore(IApplicationPaths applicationPaths)
        {
            ArgumentNullException.ThrowIfNull(applicationPaths);

            this.configPath = Path.Combine(applicationPaths.PluginConfigurationsPath, "WholphinCompanion.json");
            this.serializerOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                WriteIndented = true,
            };
        }

        /// <summary>
        /// Load configuration from disk or return defaults.
        /// </summary>
        /// <returns>The loaded configuration.</returns>
        public PluginConfiguration Load()
        {
            if (!File.Exists(this.configPath))
            {
                return new PluginConfiguration();
            }

            try
            {
                var json = File.ReadAllText(this.configPath);
                var config = JsonSerializer.Deserialize<PluginConfiguration>(json, this.serializerOptions);
                return config ?? new PluginConfiguration();
            }
            catch (IOException)
            {
                return new PluginConfiguration();
            }
            catch (UnauthorizedAccessException)
            {
                return new PluginConfiguration();
            }
            catch (JsonException)
            {
                return new PluginConfiguration();
            }
        }

        /// <summary>
        /// Save configuration to disk.
        /// </summary>
        /// <param name="configuration">The configuration to save.</param>
        public void Save(PluginConfiguration configuration)
        {
            var directory = Path.GetDirectoryName(this.configPath);
            if (!string.IsNullOrWhiteSpace(directory))
            {
                Directory.CreateDirectory(directory);
            }

            var json = JsonSerializer.Serialize(configuration, this.serializerOptions);
            File.WriteAllText(this.configPath, json);
        }
    }
}
