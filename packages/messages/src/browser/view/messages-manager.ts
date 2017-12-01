/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject } from 'inversify';
import {
    Message
} from '@theia/core/lib/common';
import { Event, Emitter } from "@theia/core/lib/common";
import { StorageService } from '@theia/core/lib/browser/storage-service';

const MESSAGES_ID = "messages";

interface MessagesEntry {
    text: string
}

@injectable()
export class MessagesManager {

    protected readonly messages: string[] = [];
    protected readonly onDidChangeMessagesEmitter = new Emitter<void>();
    readonly initialized: Promise<void>;

    constructor(
        @inject(StorageService) protected storageService: StorageService) {
        this.initialized = this.loadMessagesFromStorage();
    }

    get onDidChangeMessages(): Event<void> {
        return this.onDidChangeMessagesEmitter.event;
    }

    protected fireOnDidChangeMessages(): void {
        this.onDidChangeMessagesEmitter.fire(undefined);
    }

    protected getStorageKey(): string | undefined {
        return MESSAGES_ID;
    }

    protected async loadMessagesFromStorage(): Promise<void> {
        const key = this.getStorageKey();
        if (key) {
            const entries = await this.storageService.getData<MessagesEntry[]>(key, []);
            for (const entry of entries) {
                this.internalAddMessage(entry.text);
            }
            this.onDidChangeMessages(() => this.saveMessagesToStorage());
        }
    }

    protected internalAddMessage(message: string): void {
        this.messages.push(message);
        this.fireOnDidChangeMessages();
    }

    protected saveMessagesToStorage() {
        const key = this.getStorageKey();
        if (key) {
            const result = this.messages.map(text => ({ text }));
            this.storageService.setData<MessagesEntry[]>(key, result);
        }
    }

    getMessages(): string[] {
        return this.messages;
    }

    async addMessage(message: Message): Promise<void> {
        await this.initialized;
        this.internalAddMessage(message.text);
    }

}
