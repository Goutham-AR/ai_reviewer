
export abstract class RepoService {
    abstract diff(baseBranch: string, targetBranch: string): Promise<string>;
    abstract diffFile(baseBranch: string, targetBranch: string, fileName: string): Promise<string>;
    abstract getChangedFiles(baseBranch: string, targetBranch: string): Promise<string[]>;
}

