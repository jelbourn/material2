import {normalize} from '@angular-devkit/core';
import {SchematicsException, Tree} from '@angular-devkit/schematics';
import * as ts from 'typescript';
import {addImportToModule} from './devkit-utils/ast-utils';
import {InsertChange} from './devkit-utils/change';
import {Project} from './devkit-utils/config';
import {findBootstrapModulePath} from './devkit-utils/ng-ast-utils';


/** Reads file given path and returns TypeScript source file. */
export function getSourceFile(host: Tree, path: string): ts.SourceFile {
  const buffer = host.read(path);
  if (!buffer) {
    throw new SchematicsException(`Could not find file for path: ${path}`);
  }
  const content = buffer.toString();
  return ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
}

/** Import and add module to root app module. */
export function addModuleImportToRootModule(host: Tree, moduleName: string, src: string, project: Project) {
  const modulePath = getAppModulePath(host, project);
  addModuleImportToModule(host, modulePath, moduleName, src);
}

/**
 * Import and add module to specific module path.
 * @param host the tree we are updating
 * @param modulePath src location of the module to import
 * @param moduleName name of module to import
 * @param src src location to import
 */
export function addModuleImportToModule(
    host: Tree, modulePath: string, moduleName: string, src: string) {
  const moduleSource = getSourceFile(host, modulePath);
  const changes = addImportToModule(moduleSource, modulePath, moduleName, src);
  const recorder = host.beginUpdate(modulePath);

  changes.forEach((change) => {
    if (change instanceof InsertChange) {
      recorder.insertLeft(change.pos, change.toAdd);
    }
  });

  host.commitUpdate(recorder);
}

/** Gets the app index.html file */
export function getIndexHtmlPath(host: Tree, project: Project): string {
  const buildTarget = project.architect['build'];

  if (buildTarget.index && buildTarget.index.endsWith('index.html')) {
    return buildTarget.index;
  }

  throw new SchematicsException('No index.html file was found.');
}

/** Get the root stylesheet file. */
export function getStylesPath(host: Tree, project: Project): string {
  const buildTarget = project.architect['build'];

  if (buildTarget.options && buildTarget.options.styles && buildTarget.options.styles.length) {
    const styles = buildTarget.options.styles.map(s => s.input);

    // First, see if any of the assets is called "styles.(le|sc|c)ss", which is the default
    // "main" style sheet.
    const defaultMainStylePath = styles.find(a => /styles\.(c|le|sc)ss/.test(a));
    if (defaultMainStylePath) {
      return normalize(defaultMainStylePath);
    }

    // If there was no obvious default file, use the first style asset.
    const fallbackStylePath = styles.find(a => /\.(c|le|sc)ss/.test(a));
    if (fallbackStylePath) {
      return normalize(fallbackStylePath);
    }
  }

  throw new SchematicsException('No style files could be found into which a theme could be added');
}

/** Gets the path to the file containing the project's root NgModule. */
function getAppModulePath(host: Tree, project: Project) {
  const buildTarget = project.architect['build'];
  const mainPath = normalize(`/${project.root}/${buildTarget.options.main}`);
  const moduleRelativePath = findBootstrapModulePath(host, mainPath);

  return normalize(`/${project.root}/${moduleRelativePath}.ts`);
}
