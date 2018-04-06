'use strict';
import * as fs from 'fs';
import * as path from 'path';

export default function toSpecPath(workspacePath: string, filePath: string, pattern: string) {
    if (filePath.indexOf(`_${pattern}.rb`) > -1 || filePath.startsWith(pattern)) {
        // The command was executed from a spec file so return it
        // TODO: also search here the closest folder
        return [".", filePath];
    } else {
        // The command was executed from a source file, so we
        // need to guess the path for the corresponding spec file

        let specsDir = pattern;
        let filePathComponents = filePath.split('/');
        let sourceFilename = filePathComponents[filePathComponents.length - 1];

        // We are assuming that the project is a standard application, but let's see if the user is
        // developing an "embedded" gem. We can check it finding the deeper folder containing specs.
        // The initial search path is the directory containing the source file.
        // 
        // Example: If the user is executing the command from the following path:
        // components/my_gem/app/controllers/my_controller.rb
        // This loops will check existing folder from bottom to top like this:
        // components/my_gem/app/spec folder exists? No, next level
        // components/my_gem/spec folder exits? Yes, use this as specs dir
        let i, closestSpecFolder;
        for (i = filePathComponents.length - 2; i > 0; i--) {
            closestSpecFolder = path.join(...filePathComponents.slice(0, i), pattern);
            if (fs.existsSync(path.join(workspacePath, closestSpecFolder))) {
                specsDir = closestSpecFolder;
                break;
            }
        }

        // Common part of the paths
        let middle = filePathComponents.slice(i + 1, filePathComponents.length - 1);

        // Get spec filename replacing the pattern
        let specFilename = sourceFilename.replace('.rb', `_${pattern}.rb`)

        return [path.dirname(specsDir), path.join(specsDir, ...middle, specFilename)];
    }
}
