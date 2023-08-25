package io.papermc.hangar.model.api.project.version;

import com.fasterxml.jackson.annotation.JsonCreator;
import io.papermc.hangar.controller.validations.AtLeastOneNotNull;
import io.papermc.hangar.model.Named;
import io.papermc.hangar.model.api.project.ProjectNamespace;
import io.papermc.hangar.model.common.Platform;
import java.util.Objects;
import org.jdbi.v3.core.mapper.Nested;
import org.jdbi.v3.core.mapper.reflect.JdbiConstructor;
import org.jetbrains.annotations.Nullable;

@AtLeastOneNotNull(fieldNames = {"name", "namespace"}, includeBlankStrings = true, message = "Must specify a name or namespace for a dependency")
public class PluginDependency implements Named {

    private final String name;
    private final boolean required;
    private final String externalUrl;
    private final Platform platform;

    @JdbiConstructor
    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public PluginDependency(final String name, final boolean required, @Nested("pn") @Deprecated(forRemoval = true) final @Nullable ProjectNamespace namespace, final @Nullable String externalUrl, final Platform platform) {
        this.name = name != null ? name : namespace.getSlug();
        this.required = required;
        this.externalUrl = externalUrl;
        this.platform = platform;
    }

    private PluginDependency(final String name, final boolean required, final Platform platform) {
        this.name = name;
        this.required = required;
        this.externalUrl = null;
        this.platform = platform;
    }

    @Override
    public String getName() {
        return this.name;
    }

    public boolean isRequired() {
        return this.required;
    }

    public @Nullable String getExternalUrl() {
        return this.externalUrl;
    }

    public Platform getPlatform() {
        return this.platform;
    }

    @Override
    public String toString() {
        return "PluginDependency{" +
                "name='" + this.name + '\'' +
                ", required=" + this.required +
                ", externalUrl='" + this.externalUrl + '\'' +
                '}';
    }

    @Override
    public boolean equals(final Object o) {
        if (this == o) return true;
        if (o == null || this.getClass() != o.getClass()) return false;
        final PluginDependency that = (PluginDependency) o;
        return this.required == that.required && Objects.equals(this.name, that.name) && Objects.equals(this.externalUrl, that.externalUrl);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.name, this.required, this.externalUrl);
    }

    public static PluginDependency of(final String name, final boolean required, final Platform platform) {
        return new PluginDependency(name, required, platform);
    }
}
