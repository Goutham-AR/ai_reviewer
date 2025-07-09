import { SimpleGitOptions, SimpleGit, simpleGit, CleanOptions } from 'simple-git';
import { getFileExtension } from './utils';
import binaryExtensions from "binary-extensions";

let _git: SimpleGit | undefined;

export function getGit(options?: Partial<SimpleGitOptions>) {
    if (!_git) {
        if (!options) {
            console.error("options not given, but required since git is not initialized");
            process.exit(46);
        }
        _git = simpleGit(options);
    }
    return _git;

}

export async function getChangedFiles(targetBranch: string) {
    const git = getGit();
    await git.addConfig('core.pager', 'cat');
    await git.addConfig('core.quotepath', 'false');
    // await git.fetch();

    const diffs = await git.diff([targetBranch, '--name-only', '--diff-filter=AM']);
    const files = diffs.split('\n').filter(line => line.trim().length > 0);
    const nonBinaryFiles = files.filter(file => !binaryExtensions.includes(getFileExtension(file)));
    console.log(`Changed Files (excluding binary files) : \n ${nonBinaryFiles.join('\n')}`);
    return nonBinaryFiles;
}
