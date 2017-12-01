/*
* Copyright (C) 2017 TypeFox and others.
*
* Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
* You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
*/

import { MessagesTree } from './messages-tree';
import { injectable, inject } from "inversify";
import { TreeServices, TreeModel } from "@theia/core/lib/browser";

@injectable()
export class MessagesTreeModel extends TreeModel {

    constructor(
        @inject(MessagesTree) protected readonly tree: MessagesTree,
        @inject(TreeServices) readonly services: TreeServices
    ) {
        super(tree, services);
    }

}
