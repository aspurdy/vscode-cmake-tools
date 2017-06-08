'use strict';

import * as vscode from 'vscode';

export type LogLevel = 'verbose' | 'normal' | 'minimal';
export const LogLevel = {
    Verbose: 'verbose' as LogLevel,
    Normal: 'normal' as LogLevel,
    Minimal: 'minimal' as LogLevel
};

export class Logger {
    private _logChannel?: vscode.OutputChannel;

    private get logChannel(): vscode.OutputChannel {
        if (!this._logChannel) {
            this._logChannel = vscode.window.createOutputChannel('CMake/Build');
        }
        return this._logChannel!;
    }

    private currentLevel: LogLevel = LogLevel.Normal;

    private onConfigurationChanged(): void {
        const newLevel = vscode.workspace.getConfiguration('cmake').get<LogLevel>('loggingLevel');
        this.currentLevel = newLevel;
    }

    public initialize(context: vscode.ExtensionContext) {
        vscode.workspace.onDidChangeConfiguration(this.onConfigurationChanged, this, context.subscriptions);
        this.onConfigurationChanged();
    }

    public dispose() {
        if (this._logChannel) {
            this._logChannel.dispose();
            this._logChannel = undefined;
        }
    }

    public error(message: string): void {
        this.logChannel.appendLine(message);
    }

    public info(message: string): void {
        if (this.currentLevel !== LogLevel.Minimal) {
            this.logChannel.appendLine(message);
        }
    }

    public verbose(message: string): void {
        if (this.currentLevel === LogLevel.Verbose) {
            this.logChannel.appendLine(message);
        }
    }
}

// TODO: Use global object for now (following current config pattern).
// change to some factory later for DI/testing.
export const log = new Logger();