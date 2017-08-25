/*
 * Copyright (C) 2017 Ericsson and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { inject, injectable } from "inversify";
import { ILogger } from '@theia/core/lib/common';
import { FrontendApplication } from '@theia/core/lib/browser';
import { ITaskServer, ITaskExitedEvent, ITaskOptions, ITaskInfo } from '../common/task-protocol';
import { TERMINAL_WIDGET_FACTORY_ID, TerminalWidgetFactoryOptions } from '@theia/terminal/lib/browser/terminal-widget';
import { WidgetManager } from '@theia/core/lib/browser/widget-manager';
import { TaskWatcher } from '../common/task-watcher';
import { MessageService } from '@theia/core/lib/common/message-service';
import { WorkspaceService } from '@theia/workspace/lib/browser/workspace-service';
import { TaskConfigurations, TaskConfigurationClient } from './task-configurations';
import { TerminalWidget } from '@theia/terminal/lib/browser/terminal-widget';

@injectable()
export class TaskService implements TaskConfigurationClient {

    protected workspaceRootUri: string | undefined = undefined;

    constructor(
        @inject(FrontendApplication) protected readonly app: FrontendApplication,
        @inject(ITaskServer) protected readonly taskServer: ITaskServer,
        @inject(ILogger) protected readonly logger: ILogger,
        @inject(WidgetManager) protected readonly widgetManager: WidgetManager,
        @inject(TaskWatcher) protected readonly taskWatcher: TaskWatcher,
        @inject(MessageService) protected readonly messageService: MessageService,
        @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService,
        @inject(TaskConfigurations) protected readonly taskConfigurations: TaskConfigurations
    ) {
        // wait for the workspace root to be set
        this.workspaceService.root.then(root => {
            if (root) {
                this.taskConfigurations.watchWorkspaceConfiguration(root.uri);
                this.workspaceRootUri = root.uri;
            }
        });

        // notify user that task has started
        this.taskWatcher.onTaskCreated((event: ITaskInfo) => {
            // is event interesting to this client?
            if (event.ctx === this.getContext()) {
                this.messageService.info(`Task #${event.taskId} created - ${event.label}`);
            }
        });

        // notify user that task has finished
        this.taskWatcher.onTaskExit((event: ITaskExitedEvent) => {
            const signal = event.signal;
            // is event interesting to this client?
            if (event.ctx === this.getContext()) {
                if (event.code === 0) { /* normal process exit */
                    let success = '';

                    if (signal) {
                        if (signal === '1') {
                            success = 'Terminal Hangup received - ';
                        } else if (signal === '2') {
                            success = 'User Interrupt received - ';
                        } else if (signal === '15' || signal === 'SIGTERM') {
                            success = 'Termination Interrupt received - ';
                        } else {
                            success = 'Interrupt received - ';
                        }
                    } else {
                        success = 'Success - ';
                    }

                    success += `Task ${event.taskId} has finished. exit code: ${event.code}, signal: ${event.signal}`;
                    this.messageService.info(success);
                } else { /* abnormal process exit */
                    this.messageService.error(`Error: Task ${event.taskId} failed. Exit code: ${event.code}, signal: ${event.signal}`);
                }
            }
        });
    }

    public async getTasks(): Promise<string[]> {
        return Promise.resolve(this.taskConfigurations.getTaskLabels());
    }

    public async getRunningTasks(): Promise<ITaskInfo[]> {
        return Promise.resolve(await this.taskServer.getRunningTasks(this.getContext()));
    }

    public async run(taskName: string): Promise<void> {
        let taskInfo;
        try {
            const task: ITaskOptions = await this.taskConfigurations.getTask(taskName);
            taskInfo = await this.taskServer.run(this.resolveTaskForWorkspace(task), this.getContext());
        } catch (error) {
            this.logger.error(`Error launching task '${taskName}': ${error}`);
            this.messageService.error(`Error launching task '${taskName}': ${error}`);
            return;
        }

        this.logger.debug(`Task created. task id: ${taskInfo.taskId}, OS ProcessId: ${taskInfo.osProcessId} `);

        // open terminal widget if the task is based on a terminal process:
        if (taskInfo.terminalId !== undefined) {
            this.attachTerminal(taskInfo.terminalId, taskInfo.taskId);
        }
    }

    public async attach(terminalId: number, taskId: number): Promise<void> {
        if (terminalId !== undefined) {
            this.attachTerminal(terminalId, taskId);
        }
    }

    protected resolveTaskForWorkspace(task: ITaskOptions): ITaskOptions {
        if (task.cwd) {
            if (this.workspaceRootUri) {
                task.cwd = task.cwd.replace(/\$workspace/gi, this.workspaceRootUri);
            }
        }
        return task;
    }

    protected async attachTerminal(terminalId: number, taskId: number): Promise<void> {
        // create terminal widget to display task's execution output
        const widget = <TerminalWidget>await this.widgetManager.getOrCreateWidget(
            TERMINAL_WIDGET_FACTORY_ID,
            <TerminalWidgetFactoryOptions>{
                created: new Date().toString(),
                id: 'task-' + taskId,
                caption: `Task #${taskId}`,
                label: `Task #${taskId}`,
                destroyTermOnClose: true
            });
        // attach
        widget.start(terminalId);
    }

    public taskConfigurationChanged(event: string[]) {
        // do nothing for now
    }

    protected getContext(): string | undefined {
        return this.workspaceRootUri;
    }
}
