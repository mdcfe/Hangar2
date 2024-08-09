import type { ExtendedProjectPage, HangarOrganization, HangarProject, HangarVersion, User } from "~/types/backend";
import { useDataLoader } from "~/composables/useDataLoader";
import { isAxiosError } from "axios";

export default defineNuxtRouteMiddleware(async (to, from) => {
  // don't call on router.replace when we just update the query
  if (import.meta.client && to.path === from?.path) {
    return;
  }

  const error = useError();
  if (error.value) {
    return;
  }

  const promises: Promise<any>[] = [];

  const { loader: userLoader, data: user } = useDataLoader<User>("user");
  const userName = userLoader("user", to, from, async (userName) => useApi<User>("users/" + userName), promises);

  const { loader: projectLoader, data: project } = useDataLoader<HangarProject>("project");
  const projectName = projectLoader("project", to, from, async (projectName) => useInternalApi<HangarProject>("projects/project/" + projectName), promises);

  const { loader: organizationLoader } = useDataLoader<HangarOrganization>("organization");
  organizationLoader(
    "organization",
    to,
    from,
    async (organizationName) => useInternalApi<HangarOrganization>("organizations/org/" + organizationName),
    promises
  );

  const { loader: versionLoader, data: version } = useDataLoader<HangarVersion>("version");
  const versionName = versionLoader(
    "version",
    to,
    from,
    async (versionName) => {
      if ("project" in to.params) {
        return useInternalApi<HangarVersion>(`versions/version/${to.params.project}/versions/${versionName}`);
      }
      throw createError({ statusCode: 500, statusMessage: "No project param?!" });
    },
    promises
  );

  const { loader: pageLoader, data: page } = useDataLoader<ExtendedProjectPage>("page");
  const pageName = pageLoader(
    "page",
    to,
    from,
    async (pagePath) => {
      if ("project" in to.params) {
        return useInternalApi<ExtendedProjectPage>(`pages/page/${to.params.project}/` + pagePath.toString().replaceAll(",", "/"));
      }
      throw createError({ statusCode: 500, statusMessage: "No project param?!" });
    },
    promises
  ) as string[] | undefined;

  if (import.meta.server && promises?.length) {
    try {
      await Promise.all(promises);
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 404) {
        throw createError({ statusCode: 404, statusMessage: "Not found" });
      } else {
        console.error("Failed to load data for route " + to.fullPath, e);
        throw createError({ statusCode: 500, statusMessage: "Failed to load data" });
      }
    }

    // check if we need to redirect to a proper casing
    let newPath = to.fullPath;
    if (userName) {
      if (user.value && user.value.name !== userName) {
        newPath = newPath.replace(userName, user.value.name);
      }
    }
    if (projectName) {
      if (project.value && project.value.name !== projectName) {
        newPath = newPath.replace(projectName, project.value.name);
      }
    }
    if (versionName) {
      if (version.value && version.value.name !== versionName) {
        newPath = newPath.replace(versionName, version.value.name);
      }
    }
    if (pageName) {
      const pageSlug = pageName.join("/");
      if (page.value && page.value.slug !== pageSlug) {
        newPath = newPath.replace(pageSlug, page.value.slug);
      }
    }
    if (newPath != to.fullPath) {
      console.log("Redirect to " + newPath + " from (" + to.fullPath + ")");
      return navigateTo(newPath, { redirectCode: 301 });
    }
  }
});
