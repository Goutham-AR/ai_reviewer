import { getGit } from "../git";
import { getFileExtension } from "../utils";

import { SimpleGit, SimpleGitOptions } from "simple-git";
import binaryExtensions from "binary-extensions";

export class NotSupportedError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export abstract class RepoService {
    constructor() {

    }

    abstract diff(baseBranch: string, targetBranch: string): Promise<string>;
    abstract diffFile(baseBranch: string, targetBranch: string, fileName: string): Promise<string>;
    abstract getChangedFiles(baseBranch: string, targetBranch: string): Promise<string[]>;
}

export class LocalRepoService extends RepoService {
    private _projectDir: string;
    private _git: SimpleGit;

    constructor(projectDir: string) {
        super();
        this._projectDir = projectDir;
        const gitOptions: Partial<SimpleGitOptions> = {
            baseDir: projectDir,
            binary: "git",
        };
        this._git = getGit(gitOptions);
    }

    async diffFile(baseBranch: string, targetBranch: string, fileName: string): Promise<string> {
        // const patch = await this._git.diff([targetBranch, '--', fileName]);
        const patch = await this._git.diff([`${baseBranch}..${targetBranch}`, "--", fileName])
        return patch;
    }

    async diff(baseBranch: string, targetBranch: string): Promise<string> {
        const patch = await this._git.diff([`${baseBranch}..${targetBranch}`])
        return patch;
    }

    async getChangedFiles(baseBranch: string, targetBranch: string): Promise<string[]> {
        const diffs = await this._git.diff([`${baseBranch}..${targetBranch}`, '--name-only', '--diff-filter=AM']);
        const files = diffs.split('\n').filter(line => line.trim().length > 0);
        const nonBinaryFiles = files.filter(file => !binaryExtensions.includes(getFileExtension(file)));
        return nonBinaryFiles;
    }
}
