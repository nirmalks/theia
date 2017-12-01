/*
* Copyright (C) 2017 TypeFox and others.
*
* Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
* You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
*/

import { injectable, inject } from 'inversify';
import {
    MessageClient, Message
} from '@theia/core/lib/common';
import { MessagesManager } from './messages-manager';

@injectable()
export class ViewMessageClient extends MessageClient {

    constructor( @inject(MessagesManager) protected messagesManager: MessagesManager) {
        super();
    }

    showMessage(message: Message): Promise<string | undefined> {
        this.messagesManager.addMessage(message);
        return Promise.resolve(undefined);
    }

}
