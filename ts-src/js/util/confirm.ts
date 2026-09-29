// Simple confirm-dialog overlay used across the editors.
// Loaded as a plain (non-module) script — see server/concatenator.coffee.
// `@ConfirmDialog`/`class @ConfirmDialogWindow` compile to `this.X = ...`
// property assignments (safe, not lexical declarations — see undo.ts).
interface ConfirmDialogWindowInstance {
  show(
    message: string,
    ok: string,
    cancel: string,
    callback?: () => void,
    dismiss?: () => void
  ): void;
}

interface ConfirmDialogType {
  window?: ConfirmDialogWindowInstance;
  confirm(
    message: string,
    ok: string,
    cancel: string,
    callback?: () => void,
    dismiss?: () => void
  ): void;
}

declare var ConfirmDialog: ConfirmDialogType;
declare var ConfirmDialogWindow: { new (): ConfirmDialogWindowInstance };

(this as any).ConfirmDialog = {
  confirm(
    message: string,
    ok: string,
    cancel: string,
    callback?: () => void,
    dismiss?: () => void
  ): void {
    if (ConfirmDialog.window == null) {
      ConfirmDialog.window = new ConfirmDialogWindow();
    }

    ConfirmDialog.window.show(message, ok, cancel, callback, dismiss);
  },
} as ConfirmDialogType;

(this as any).ConfirmDialogWindow = class ConfirmDialogWindow {
  overlay: HTMLElement;
  text: HTMLElement;
  ok: HTMLElement;
  cancel: HTMLElement;
  callback?: () => void;
  dismiss?: () => void;

  constructor() {
    this.overlay = document.getElementById("confirm-message-overlay")!;
    this.text = document.getElementById("confirm-message-text")!;
    this.ok = document.getElementById("confirm-message-ok")!;
    this.cancel = document.getElementById("confirm-message-cancel")!;

    this.ok.addEventListener("click", () => this.okPressed());
    this.cancel.addEventListener("click", () => this.cancelPressed());
  }

  show(
    message: string,
    ok: string,
    cancel: string,
    callback?: () => void,
    dismiss?: () => void
  ): void {
    this.callback = callback;
    this.dismiss = dismiss;
    if (document.fullscreenElement != null) {
      document.fullscreenElement.appendChild(this.overlay);
    } else {
      document.body.appendChild(this.overlay);
    }
    this.text.innerHTML = message;
    this.ok.innerText = ok;
    this.cancel.innerText = cancel;
    this.overlay.style.display = "block";
  }

  okPressed(): void {
    this.overlay.style.display = "none";
    if (this.callback != null) {
      this.callback();
      this.callback = undefined;
    }
  }

  cancelPressed(): void {
    this.overlay.style.display = "none";
    if (this.dismiss != null) {
      this.dismiss();
      this.dismiss = undefined;
    }
  }
};
