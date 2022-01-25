import * as path from 'path';
import glob from 'glob';
import { Module } from '@nuxt/types';

// Based on https://adrianjost.medium.com/nuxt-js-theming-1-18e9caa1dfd9

// returns a list of all filepaths in a given directory
function readDirRecursiveSync(dir: string) {
    return glob.sync(`${dir}/**/*.*`);
}

function getThemeAliases(subdirectory: string, theme: string) {
    const themeBaseDir = path.dirname(require.resolve(`${theme}/package.json`)); // base directory of the theme
    const themeFilesDir = path.resolve(themeBaseDir, 'src', 'overlay', subdirectory); // where to search for overlay files
    const themeFilesResolve = theme + '/src/overlay/' + subdirectory; // the base of the import path
    console.log(`ok ${themeFilesResolve} is at ${themeFilesDir}`);
    return (
        readDirRecursiveSync(themeFilesDir)
            // make paths relative
            .map((componentPath: string) => path.relative(themeFilesDir, componentPath).replace('\\', '/'))
            // create alias for path
            .reduce((aliases: { [key: string]: string }, componentPath: string) => {
                console.log(`~/${subdirectory}/${componentPath} = ${themeFilesResolve}/${componentPath}`);
                aliases[`~/${subdirectory}/${componentPath}`] = `${themeFilesResolve}/${componentPath}`;
                return aliases;
            }, {})
    );
}

type ThemingModuleOptions = {
    themeName: string;
};

const themingModule: Module<ThemingModuleOptions> = function (options: ThemingModuleOptions) {
    console.log(`[Theming] Using theme ${options.themeName}... (TODO)`);

    const aliases = {
        // Generate aliases for theme overlay files
        ...getThemeAliases('assets', options.themeName),
        ...getThemeAliases('components', options.themeName),

        // Nuxt defaults
        '@': 'src',
        '@@': '.',
        // Theme base aliases
        '~/assets': 'assets',
        '~/components': 'components',
    };

    this.extendBuild((config, _ctx) => {
        console.log(`[Theming] Extending build with overlays from theme ${options.themeName}`);
        console.dir(aliases);

        Object.assign(config.resolve?.alias, aliases);
    });
};

export default themingModule;
