/*
* Copyright (C) 2017 TypeFox and others.
*
* Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
* You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
*/

import { interfaces, Container } from "inversify";
import { MessagesWidget } from './messages-widget';
import { MessagesTreeModel } from './messages-tree-model';
import { MessagesTree } from './messages-tree';
import { TreeWidget, TreeProps, defaultTreeProps, ITreeModel, createTreeContainer, TreeModel, Tree, ITree } from "@theia/core/lib/browser";

const MESSAGES_ID = "messages";

export const MESSAGES_TREE_PROPS = <TreeProps>{
    ...defaultTreeProps,
    contextMenuPath: [MESSAGES_ID]
};

export function createMessagesTreeContainer(parent: interfaces.Container): Container {
    const child = createTreeContainer(parent);

    child.unbind(Tree);
    child.bind(MessagesTree).toSelf();
    child.rebind(ITree).toDynamicValue(ctx => ctx.container.get(MessagesTree));

    child.unbind(TreeWidget);
    child.bind(MessagesWidget).toSelf();

    child.unbind(TreeModel);
    child.bind(MessagesTreeModel).toSelf();
    child.rebind(ITreeModel).toDynamicValue(ctx => ctx.container.get(MessagesTreeModel));

    // child.bind(TreeServices).toSelf();

    child.rebind(TreeProps).toConstantValue(MESSAGES_TREE_PROPS);
    return child;
}

export function createMessagesWidget(parent: interfaces.Container): MessagesWidget {
    return createMessagesTreeContainer(parent).get(MessagesWidget);
}
