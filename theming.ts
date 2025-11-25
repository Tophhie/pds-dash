
// theming.ts
import type { Plugin } from 'vite';
import { Config } from './config';
import fs from 'fs';
import path from 'path';

// Replaces app.css with the contents of the file specified in the config file.
export const themePlugin = (): Plugin => {
  const themeFolder = Config.THEME;
  const cwd = process.cwd();
  const themeCssPath = path.resolve(cwd, 'themes', themeFolder, 'theme.css');

  console.log(`Using theme folder: ${themeFolder}`);
  console.log(`Resolved theme CSS path: ${themeCssPath}`);

  return {
    name: 'theme-generator',
    enforce: 'pre', // Ensure this plugin runs first
    transform(code, id) {
      if (id.endsWith('app.css')) {
        // Read the theme file and replace the contents of app.css with it
        const themeCode = fs.readFileSync(themeCssPath, { encoding: 'utf-8' });

        // Add a comment header
        const themeComment = `/* Generated from ${themeFolder} */\n`;
        const themeCodeWithComment = themeComment + themeCode;

        return {
          code: themeCodeWithComment,
          map: null,
        };
      }
      return null;
    },
  };
};