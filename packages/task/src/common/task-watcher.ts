/*
 * Copyright (C) 2017 Ericsson and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from "inversify";
import { Emitter, Event } from '@theia/core/lib/common/event';
import { ITaskClient, ITaskExitedEvent, ITaskInfo } from './task-protocol';

@injectable()
export class TaskWatcher {

    getTaskClient(): ITaskClient {
        const newTaskEmitter = this.onTaskCreatedEmitter;
        const exitEmitter = this.onTaskExitEmitter;
        // const entryFoundEmitter = this.onTaskentryFoundEmitter;
        return {
            onTaskCreated(event: ITaskInfo) {
                newTaskEmitter.fire(event);
            },
            onTaskExit(event: ITaskExitedEvent) {
                exitEmitter.fire(event);
            }
        };
    }

    private onTaskCreatedEmitter = new Emitter<ITaskInfo>();
    private onTaskExitEmitter = new Emitter<ITaskExitedEvent>();

    get onTaskCreated(): Event<ITaskInfo> {
        return this.onTaskCreatedEmitter.event;
    }
    get onTaskExit(): Event<ITaskExitedEvent> {
        return this.onTaskExitEmitter.event;
    }
}
