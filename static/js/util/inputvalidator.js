"use strict";
this.InputValidator = class InputValidator {
    constructor(fields, button, error, callback) {
        this.initial = [];
        this.error_timeout = null;
        this.change_timeout = null;
        this.accept_initial = false;
        this.auto_reset = true;
        this.fields = Array.isArray(fields) ? fields : [fields];
        this.button = button;
        this.error = error;
        this.callback = callback;
        this.initial = [];
        for (const f of this.fields) {
            this.initial.push(f.value);
            f.addEventListener("input", () => this.change());
            f.addEventListener("keydown", ((event) => {
                if (event.key === "Enter") {
                    this.validate();
                }
                else if (event.key === "Escape" && this.auto_reset) {
                    this.reset();
                }
            }));
        }
        this.button.addEventListener("click", () => this.validate());
        this.button.style.width = 0;
        if (this.error != null) {
            this.error.style.width = 0;
        }
        this.error_timeout = null;
        this.change_timeout = null;
        this.accept_initial = false;
        this.auto_reset = true;
    }
    set(values) {
        if (!Array.isArray(values)) {
            values = [values];
        }
        this.initial = [];
        for (let i = 0; i < this.fields.length; i++) {
            this.initial.push((this.fields[i].value = values[i]));
        }
    }
    reset() {
        for (let i = 0; i < this.fields.length; i++) {
            this.fields[i].value = this.initial[i];
            this.fields[i].blur();
        }
        this.button.style.width = "0px";
    }
    update() {
        for (let i = 0; i < this.fields.length; i++) {
            this.initial[i] = this.fields[i].value;
        }
        this.button.style.width = "0px";
    }
    check() {
        if (this.regex == null) {
            return true;
        }
        for (const f of this.fields) {
            if (!this.regex.test(f.value)) {
                return false;
            }
        }
        return true;
    }
    change() {
        if (this.error != null) {
            this.error.style.width = 0;
        }
        let change = this.accept_initial;
        for (let i = 0; i < this.fields.length; i++) {
            if (this.fields[i].value !== this.initial[i]) {
                change = true;
            }
        }
        if (change && this.check()) {
            this.button.style.removeProperty("width");
            if (this.change_timeout != null) {
                clearTimeout(this.change_timeout);
            }
            if (this.auto_reset) {
                this.change_timeout = setTimeout(() => {
                    this.reset();
                    this.change_timeout = null;
                }, 10000);
            }
        }
        else {
            this.button.style.width = "0px";
        }
    }
    cancelChange() {
        this.button.style.width = 0;
    }
    showError(text) {
        if (this.error == null) {
            return;
        }
        this.error.innerText = text;
        this.error.style.width = "auto";
        if (this.error_timeout) {
            clearTimeout(this.error_timeout);
        }
        this.error_timeout = setTimeout(() => {
            this.error.style.width = "0";
            this.error_timeout = null;
        }, 5000);
    }
    validate() {
        if (this.change_timeout != null) {
            clearTimeout(this.change_timeout);
        }
        this.callback(this.fields.map((f) => f.value));
        this.button.style.width = "0px";
    }
};
