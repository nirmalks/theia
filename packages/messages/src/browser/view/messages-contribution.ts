/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject } from 'inversify';
import {
    MenuModelRegistry, Command, CommandContribution,
    MenuContribution, KeybindingContribution, KeybindingRegistry,
    CommandRegistry
} from '@theia/core/lib/common';
import { FrontendApplication, CommonMenus, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { WidgetManager } from '@theia/core/lib/browser/widget-manager';
import { StatusBar } from '@theia/core/lib/browser/status-bar/status-bar';

export namespace MessagesCommands {
    export const OPEN: Command = {
        id: 'messages:open',
        label: 'Open Messages View'
    };
}

const MESSAGES_ID = "messages";

@injectable()
export class MessagesContribution implements CommandContribution, MenuContribution, KeybindingContribution, FrontendApplicationContribution {

    constructor(
        @inject(WidgetManager) protected readonly widgetFactory: WidgetManager,
        @inject(FrontendApplication) protected readonly app: FrontendApplication,
        @inject(StatusBar) protected readonly statusBar: StatusBar) { }

    onStart(app: FrontendApplication) {
    }

    initializeLayout(app: FrontendApplication) {
    }

    registerKeybindings(keybindings: KeybindingRegistry): void {
        // keybindings.registerKeybinding({
        //     commandId: MessagesCommands.OPEN.id,
        //     keyCode: KeyCode.createKeyCode({
        //         first: Key.KEY_M, modifiers: [Modifier.M2, Modifier.M1]
        //     })
        // });
    }

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(MessagesCommands.OPEN, {
            execute: () => this.openMessagesView()
        });
    }

    protected async openMessagesView(): Promise<void> {
        const messagesWidget = await this.widgetFactory.getOrCreateWidget(MESSAGES_ID);
        if (!messagesWidget.isAttached) {
            this.app.shell.addToMainArea(messagesWidget);
        }
        this.app.shell.activateMain(messagesWidget.id);
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.VIEW, {
            commandId: MessagesCommands.OPEN.id
        });
    }
}
