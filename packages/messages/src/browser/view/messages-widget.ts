/*
* Copyright (C) 2017 TypeFox and others.
*
* Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
* You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
*/

import { injectable, inject } from 'inversify';
import { TreeWidget, TreeProps, ContextMenuRenderer, ITreeNode, ITreeModel, NodeProps } from "@theia/core/lib/browser";
import { MessagesManager } from './messages-manager';
import { MessagesTreeModel } from './messages-tree-model';
import { MessageNode } from './messages-tree';

import { h } from "@phosphor/virtualdom/lib";

@injectable()
export class MessagesWidget extends TreeWidget {

    constructor(
        @inject(MessagesManager) protected readonly messagesManager: MessagesManager,
        @inject(TreeProps) readonly treeProps: TreeProps,
        @inject(MessagesTreeModel) readonly model: MessagesTreeModel,
        @inject(ContextMenuRenderer) readonly contextMenuRenderer: ContextMenuRenderer
    ) {
        super(treeProps, model, contextMenuRenderer);

        this.id = 'messages';
        this.title.label = 'Messages';
        this.title.iconClass = 'fa fa-info-circle';
        this.title.closable = true;
        this.addClass('theia-messages-container');

        this.addClipboardListener(this.node, 'copy', e => this.handleCopy(e));
    }

    protected inflateFromStorage(node: any, parent?: ITreeNode): ITreeNode {
        if (node.selected) {
            node.selected = false;
        }
        return super.inflateFromStorage(node);
    }

    protected handleCopy(event: ClipboardEvent) {
        const node = this.model.selectedNode;
        if (!node) {
            return;
        }
        if (MessageNode.is(node)) {
            const message = node.message;
            event.clipboardData.setData('text/plain', message);
            event.preventDefault();
        }
    }

    protected renderTree(model: ITreeModel): h.Child {
        return super.renderTree(model) || h.div({ className: 'noMessages' }, 'No messages.');
    }

    protected decorateCaption(node: ITreeNode, caption: h.Child, props: NodeProps): h.Child {
        if (MessageNode.is(node)) {
            return super.decorateCaption(node, this.decorateMessageNode(node, caption), props);
        }
        return h.div({}, '');
    }

    protected decorateMessageNode(node: MessageNode, caption: h.Child): h.Child {
        const message = node.message;
        const messageDiv = h.div({ className: 'message' }, message);
        return h.div({ className: 'messageNode' }, messageDiv);
    }

}
