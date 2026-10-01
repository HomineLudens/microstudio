// Represents a single export/build job for a project (e.g. "export to
// Android", "export to HTML5"), tracked by status/progress for polling.
// Plain Node CommonJS module (not part of the browser concatenation
// bundles — required directly via server/build/buildmanager.coffee).
interface ProjectLike {
  last_modified: unknown;
}

interface BuildExport {
  target: unknown;
  progress: number;
  status: string;
  status_text: string;
  error: unknown;
}

class Build {
  project: ProjectLike;
  target: unknown;
  status: string;
  status_text: string;
  progress: number;
  version_check: unknown;
  error?: unknown;

  constructor(project: ProjectLike, target: unknown) {
    this.project = project;
    this.target = target;
    this.status = "request";
    this.status_text = "Queued";
    this.progress = 0;

    this.version_check = this.project.last_modified;
  }

  export(): BuildExport {
    return {
      target: this.target,
      progress: this.progress,
      status: this.status,
      status_text: this.status_text,
      error: this.error,
    };
  }
}

export = Build;
