import { getGit } from "../git";
import { getFileExtension } from "../utils";
import { RepoService } from "./repo.interface";

import { SimpleGit, SimpleGitOptions } from "simple-git";
import binaryExtensions from "binary-extensions";

export class LocalRepoService extends RepoService {
    public projectDir: string;
    private _git: SimpleGit;

    constructor(projectDir: string) {
        super();
        this.projectDir = projectDir;
        const gitOptions: Partial<SimpleGitOptions> = {
            baseDir: projectDir,
            binary: "git",
        };
        this._git = getGit(gitOptions);
    }

    async diffFile(baseBranch: string, targetBranch: string, fileName: string): Promise<string> {
        // const patch = await this._git.diff([targetBranch, '--', fileName]);
        await this._git.pull("origin", "main", ["--prune"]);
        const patch = await this._git.diff([`origin/${baseBranch}..origin/${targetBranch}`, "--", fileName, "-U100"])
        return patch;
    }

    async diff(baseBranch: string, targetBranch: string): Promise<string> {
        await this._git.pull("origin", "main", ["--prune"]);
        const patch = await this._git.diff([`${baseBranch}..${targetBranch}`])
        return patch;
    }

    async getChangedFiles(baseBranch: string, targetBranch: string): Promise<string[]> {
        await this._git.pull("origin", "main", ["--prune"]);
        const diffs = await this._git.diff([`${baseBranch}..${targetBranch}`, '--name-only', '--diff-filter=AM']);
        const files = diffs.split('\n').filter(line => line.trim().length > 0);
        const nonBinaryFiles = files.filter(file => !binaryExtensions.includes(getFileExtension(file)) && !file.includes("package-lock"));
        return nonBinaryFiles;
    }
}
