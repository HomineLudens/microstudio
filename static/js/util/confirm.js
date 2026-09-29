"use strict";
this.ConfirmDialog = {
    confirm(message, ok, cancel, callback, dismiss) {
        if (ConfirmDialog.window == null) {
            ConfirmDialog.window = new ConfirmDialogWindow();
        }
        ConfirmDialog.window.show(message, ok, cancel, callback, dismiss);
    },
};
this.ConfirmDialogWindow = class ConfirmDialogWindow {
    constructor() {
        this.overlay = document.getElementById("confirm-message-overlay");
        this.text = document.getElementById("confirm-message-text");
        this.ok = document.getElementById("confirm-message-ok");
        this.cancel = document.getElementById("confirm-message-cancel");
        this.ok.addEventListener("click", () => this.okPressed());
        this.cancel.addEventListener("click", () => this.cancelPressed());
    }
    show(message, ok, cancel, callback, dismiss) {
        this.callback = callback;
        this.dismiss = dismiss;
        if (document.fullscreenElement != null) {
            document.fullscreenElement.appendChild(this.overlay);
        }
        else {
            document.body.appendChild(this.overlay);
        }
        this.text.innerHTML = message;
        this.ok.innerText = ok;
        this.cancel.innerText = cancel;
        this.overlay.style.display = "block";
    }
    okPressed() {
        this.overlay.style.display = "none";
        if (this.callback != null) {
            this.callback();
            this.callback = undefined;
        }
    }
    cancelPressed() {
        this.overlay.style.display = "none";
        if (this.dismiss != null) {
            this.dismiss();
            this.dismiss = undefined;
        }
    }
};
