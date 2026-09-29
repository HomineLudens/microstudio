// Generic form-field validator: shows/hides a submit button and error
// message depending on whether current field values differ from their
// initial values and (optionally) match a validation regex.
// Loaded as a plain (non-module) script — see server/concatenator.coffee.
// `class @InputValidator` compiles to `this.InputValidator = ...` (a
// property assignment on the global object, safe — see undo.ts).
type FormField = HTMLInputElement | HTMLTextAreaElement;

(this as any).InputValidator = class InputValidator {
  fields: FormField[];
  button: HTMLElement;
  error?: HTMLElement;
  callback: (values: string[]) => void;
  initial: string[] = [];
  regex?: RegExp;
  error_timeout: ReturnType<typeof setTimeout> | null = null;
  change_timeout: ReturnType<typeof setTimeout> | null = null;
  accept_initial = false;
  auto_reset = true;

  constructor(
    fields: FormField | FormField[],
    button: HTMLElement,
    error: HTMLElement | undefined,
    callback: (values: string[]) => void
  ) {
    this.fields = Array.isArray(fields) ? fields : [fields];
    this.button = button;
    this.error = error;
    this.callback = callback;

    this.initial = [];
    for (const f of this.fields) {
      this.initial.push(f.value);
      f.addEventListener("input", () => this.change());
      f.addEventListener("keydown", ((event: KeyboardEvent) => {
        if (event.key === "Enter") {
          this.validate();
        } else if (event.key === "Escape" && this.auto_reset) {
          this.reset();
        }
      }) as EventListener);
    }

    this.button.addEventListener("click", () => this.validate());

    (this.button.style.width as unknown) = 0;
    if (this.error != null) {
      (this.error.style.width as unknown) = 0;
    }

    this.error_timeout = null;
    this.change_timeout = null;
    this.accept_initial = false;
    this.auto_reset = true;
  }

  set(values: string | string[]): void {
    if (!Array.isArray(values)) {
      values = [values];
    }
    this.initial = [];
    for (let i = 0; i < this.fields.length; i++) {
      this.initial.push((this.fields[i].value = values[i]));
    }
  }

  reset(): void {
    for (let i = 0; i < this.fields.length; i++) {
      this.fields[i].value = this.initial[i];
      this.fields[i].blur();
    }
    this.button.style.width = "0px";
  }

  update(): void {
    for (let i = 0; i < this.fields.length; i++) {
      this.initial[i] = this.fields[i].value;
    }
    this.button.style.width = "0px";
  }

  check(): boolean {
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

  change(): void {
    if (this.error != null) {
      (this.error.style.width as unknown) = 0;
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
    } else {
      this.button.style.width = "0px";
    }
  }

  cancelChange(): void {
    (this.button.style.width as unknown) = 0;
  }

  showError(text: string): void {
    if (this.error == null) {
      return;
    }
    this.error.innerText = text;
    this.error.style.width = "auto";

    if (this.error_timeout) {
      clearTimeout(this.error_timeout);
    }
    this.error_timeout = setTimeout(() => {
      this.error!.style.width = "0";
      this.error_timeout = null;
    }, 5000);
  }

  validate(): void {
    if (this.change_timeout != null) {
      clearTimeout(this.change_timeout);
    }
    this.callback(this.fields.map((f) => f.value));
    this.button.style.width = "0px";
  }
};
