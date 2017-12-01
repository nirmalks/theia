/*
* Copyright (C) 2017 TypeFox and others.
*
* Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
* You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
*/

import { MessagesManager } from './messages-manager';
import { injectable, inject } from "inversify";
import { Tree, ICompositeTreeNode, ITreeNode, ISelectableTreeNode } from "@theia/core/lib/browser";

const MESSAGES_ID = "messages";

@injectable()
export class MessagesTree extends Tree {

    constructor(
        @inject(MessagesManager) protected readonly messagesManager: MessagesManager) {
        super();

        messagesManager.onDidChangeMessages(() => this.refresh());

        this.root = <MessagesRootNode>{
            visible: false,
            id: 'theia-' + MESSAGES_ID + '-widget',
            name: 'MessagesTree',
            kind: MESSAGES_ID,
            children: [],
            parent: undefined
        };
    }

    resolveChildren(parent: ICompositeTreeNode): Promise<ITreeNode[]> {
        if (MessagesRootNode.is(parent)) {
            return this.getMessageNodes(parent);
        }
        return super.resolveChildren(parent);
    }

    getMessageNodes(parent: MessagesRootNode): Promise<MessageNode[]> {
        const messages = this.messagesManager.getMessages();
        const nodes = messages.map(message => <MessageNode>{ message, selected: false });
        return Promise.resolve(nodes);
    }
}

export interface MessageNode extends ISelectableTreeNode {
    message: string;
}

export namespace MessageNode {
    export function is(node: ITreeNode | undefined): node is MessageNode {
        return ISelectableTreeNode.is(node) && 'message' in node;
    }
}

export interface MessagesRootNode extends ICompositeTreeNode {
    kind: string;
}
export namespace MessagesRootNode {
    export function is(node: ITreeNode | undefined): node is MessagesRootNode {
        return ICompositeTreeNode.is(node) && 'kind' in node;
    }
}
