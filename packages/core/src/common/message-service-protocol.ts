/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from "inversify";

export const messageServicePath = '/services/messageService';

export enum MessageType {
    Error = 1,
    Warning = 2,
    Info = 3,
    Log = 4
}

export interface Message {
    type: MessageType;
    king?: string;
    text: string;
    actions?: MessageAction[];
}

export interface MessageAction {
    label: string;
    onExecute: () => void;
}

@injectable()
export class MessageClient {

    /**
     * Show a message of the given type and possible actions to the user.
     * Resolve to a chosen action.
     * Never reject.
     *
     * To be implemented by an extension, e.g. by the messages extension.
     */
    showMessage(message: Message): Promise<MessageAction | undefined> {
        // tslint:disable-next-line:no-console
        console.log(message.text);
        return Promise.resolve(undefined);
    }
}

@injectable()
export class DispatchingMessageClient extends MessageClient {

    readonly clients = new Set<MessageClient>();

    showMessage(message: Message): Promise<MessageAction | undefined> {
        return Promise.race([...this.clients].map(client =>
            client.showMessage(message)
        ));
    }

}
