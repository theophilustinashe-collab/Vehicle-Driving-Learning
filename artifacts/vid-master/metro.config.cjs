const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

config.projectRoot = projectRoot;

// 1. Watch node_modules in workspace
config.watchFolders = [
  projectRoot,
  path.resolve(workspaceRoot, 'node_modules'),
];

// 2. Let Metro know where to resolve packages from
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Align with Expo SDK 54 requirements
config.resolver.disableHierarchicalLookup = false;

// 4. Custom resolver to resolve index.js when Metro evaluates from monorepo root
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === './index.js' || moduleName === 'index.js') {
    const targetFile = path.resolve(projectRoot, 'index.js');
    if (context.originModulePath === workspaceRoot || !context.originModulePath.startsWith(projectRoot)) {
      return {
        type: 'sourceFile',
        filePath: targetFile,
      };
    }
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
