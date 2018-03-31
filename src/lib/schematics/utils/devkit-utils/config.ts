/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SchematicsException, Tree} from '@angular-devkit/schematics';

export const ANGULAR_CLI_WORKSPACE_PATH = '/angular.json';


/** An Angular CLI Workspacer config (angular.json) */
export interface Workspace {
  /** Link to schema. */
  $schema?: string;
  /** Workspace Schema version. */
  version: number;
  /** New project root. */
  newProjectRoot?: string;
  /** Tool options. */
  cli?: {
    /** Link to schema. */
    $schema?: string;
    [k: string]: any;
  };
  /** Tool options. */
  schematics?: {
    /** Link to schema. */
    $schema?: string;
    [k: string]: any;
  };
  /** Tool options. */
  architect?: {
    /** Link to schema. */
    $schema?: string;
    [k: string]: any;
  };
  /** A map of project names to project options. */
  projects: {
    [k: string]: Project;
  };
}

/**
 * A project in an Angular CLI workspace (e.g. an app or a library). A single workspace
 * can house multiple projects.
 */
export interface Project {
  name: string;

  /** Project type. */
  projectType: 'application' | 'library';
  /** Root of the project sourcefiles. */
  root: string;
  /** Tool options. */
  cli?: {
    /** Link to schema. */
    $schema?: string;
    [k: string]: any;
  };
  /** Tool options. */
  schematics?: {
    /** Link to schema. */
    $schema?: string;
    [k: string]: any;
  };
  /** Tool options. */
  architect?: ProjectBuildOptions;
}

/** Architect options for an Angular CLI workspace. */
export interface ProjectBuildOptions {
  /** Link to schema. */
  $schema?: string;
  [k: string]: any;
}

/** Gets the Angular CLI workspace config (angular.json) */
export function getWorkspace(host: Tree): Workspace {
  const configBuffer = host.read(ANGULAR_CLI_WORKSPACE_PATH);
  if (configBuffer === null) {
    throw new SchematicsException('Could not find angular.json');
  }

  return JSON.parse(configBuffer.toString());
}

/**
 * Gets a project from the Angular CLI workspace. If no project name is given, the first project
 * will be retrieved.
 */
export function getProjectFromWorkspace(config: Workspace, projectName?: string): Project {
  if (config.projects) {
    if (projectName) {
      const project = config.projects[projectName];
      if (!project) {
        throw new SchematicsException(`No project named "${projectName}" exists.`);
      }

      project.name = projectName;
      return project;
    }

    const allProjectNames = Object.keys(config.projects);
    if (allProjectNames.length === 1) {
      const project = config.projects[allProjectNames[0]];
      project.name = allProjectNames[0];
    } else {
      throw new SchematicsException('Multiple projects are defined; please specify a project name');
    }
  }

  throw new SchematicsException('No projects are defined');
}
