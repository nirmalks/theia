/*
* Copyright (C) 2017 TypeFox and others.
*
* Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
* You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
*/

import { ContainerModule } from 'inversify';
import { ToastMessageClient } from './toast-message-client';
import { MessagesWidget } from './view/messages-widget';
import { ViewMessageClient } from './view/view-message-client';
import { createMessagesWidget } from './view/messages-container';
import { MessagesContribution } from './view/messages-contribution';
import { MessagesManager } from './view/messages-manager';
import { MessageClient, DispatchingMessageClient, messageServicePath } from '@theia/core/lib/common';
import { WebSocketConnectionProvider } from '@theia/core/lib/browser';
import { CommandContribution, MenuContribution, KeybindingContribution } from "@theia/core/lib/common";
import { FrontendApplicationContribution } from '@theia/core/lib/browser';

import { WidgetFactory } from '@theia/core/lib/browser/widget-manager';

import '../../src/browser/style/index.css';
import 'izitoast/dist/css/iziToast.css';

const MESSAGES_ID = "messages";

export default new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(MessagesManager).toSelf().inSingletonScope();

    bind(DispatchingMessageClient).toSelf().inSingletonScope();
    bind(ToastMessageClient).toSelf().inSingletonScope();
    bind(ViewMessageClient).toSelf().inSingletonScope();

    rebind(MessageClient).toDynamicValue(context => {
        const toastClient = context.container.get(ToastMessageClient);
        const viewClient = context.container.get(ViewMessageClient);
        const dispatchingClient = context.container.get(DispatchingMessageClient);
        dispatchingClient.clients.add(toastClient);
        dispatchingClient.clients.add(viewClient);
        // connect to remote interface
        WebSocketConnectionProvider.createProxy(context.container, messageServicePath, dispatchingClient);
        /* TODO REMOVE THIS */ makeGlobal(dispatchingClient);
        return dispatchingClient;
    }).inSingletonScope();

    bind(MessagesWidget).toDynamicValue(ctx =>
        createMessagesWidget(ctx.container)
    );

    bind(WidgetFactory).toDynamicValue(context => ({
        id: MESSAGES_ID,
        createWidget: () => context.container.get<MessagesWidget>(MessagesWidget)
    }));
    bind(MessagesContribution).toSelf().inSingletonScope();
    for (const identifier of [CommandContribution, MenuContribution, KeybindingContribution, FrontendApplicationContribution]) {
        bind(identifier).toDynamicValue(ctx =>
            ctx.container.get(MessagesContribution)
        ).inSingletonScope();
    }
});

function makeGlobal(client: any): void {
    // tslint:disable-next-line:no-any
    const wnd = window as any;
    if (!wnd.__messageClient) {
        wnd.__messageClient = client;
    }
}
