"use strict";
// Client-side i18n helper: loads/caches translation strings for the app,
// and (for admin users) reports untranslated strings back to the server.
// Loaded as a plain (non-module) script — see server/concatenator.coffee.
// `class @Translator` compiles to `this.Translator = ...` (a property
// assignment on the global object, safe — see undo.ts).
this.Translator = class Translator {
    constructor(app) {
        this.app = app;
        this.lang = document.children[0].lang;
        this.language = window.translation;
        this.incomplete = {};
        if (document.cookie != null && document.cookie.indexOf("language=") >= 0) {
            const index = document.cookie.indexOf("language=") + "language=".length;
            this.lang = document.cookie.substring(index, index + 2);
        }
        //else if navigator.languages? and navigator.languages[0]?
        //  @lang = navigator.languages[0].split("-")[0]
        setInterval(() => this.check(), 5000);
    }
    load(callback) {
        if (this.language != null) {
            return;
        }
        this.app.client.sendRequest({
            name: "get_language",
            language: this.lang,
        }, (msg) => {
            try {
                this.language = JSON.parse(msg.language);
            }
            catch (err) {
                // ignore parse errors, keep language unset
            }
            if (callback != null) {
                callback();
            }
        });
    }
    get(text) {
        if (this.language != null) {
            const value = this.language[text];
            if (value == null) {
                this.incomplete[text] = true;
                return text;
            }
            else {
                return value;
            }
        }
        else {
            return text;
        }
    }
    check() {
        if (this.app.user != null && this.app.user.flags != null && this.app.user.flags.admin) {
            if (!this.list_fetched) {
                this.list_fetched = true;
                this.app.client.sendRequest({ name: "get_translation_list" }, (msg) => {
                    this.list = msg.list;
                });
            }
            if (this.list != null) {
                for (const text in this.incomplete) {
                    if (this.list[text] == null) {
                        this.app.client.sendRequest({
                            name: "add_translation",
                            source: text,
                        });
                        this.list[text] = true;
                    }
                }
            }
        }
        return;
    }
    translatorLanguage() {
        for (const key in this.app.user.flags) {
            const value = this.app.user.flags[key];
            if (key.startsWith("translator_") && value) {
                return key.split("-")[1];
            }
        }
        return null;
    }
};
