/*
* Copyright (C) 2017 TypeFox and others.
*
* Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
* You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
*/

import { injectable } from 'inversify';
import {
    MessageClient,
    MessageType,
    Message
} from '@theia/core/lib/common';

import 'izitoast';
import toast = require('izitoast');

@injectable()
export class ToastMessageClient extends MessageClient {

    showMessage(message: Message): Promise<string | undefined> {
        return this.show(message);
    }

    protected show(message: Message): Promise<string | undefined> {
        return new Promise(resolve => {
            this.showToast(message, a => resolve(a));
        });
    }

    protected showToast(message: Message, onCloseFn: (action: string | undefined) => void): void {
        const icon = this.iconFor(message.type);
        const actions = message.actions || [];
        // tslint:disable-next-line:no-any
        (toast as any).show({
            icon,
            message: message.text,
            theme: 'dark',
            position: 'topCenter',
            timeout: 0,
            animateInside: false,
            drag: false,
            transitionIn: 'fadeInDown',
            transitionOut: 'fadeOutUp',
            buttons: actions.map(a => this.createButton(a, () => onCloseFn(a)))
        });
    }

    // tslint:disable-next-line:no-any
    protected createButton(action: string, onClosing: () => void): [string, (instance: any, t: any) => void] {
        // Using `any` type due to errors in type definitions,
        // cf. https://github.com/dolce/iziToast/issues/96
        return [
            `<button>${action}</button>`,
            // tslint:disable-next-line:no-any
            function (instance, t) {
                instance.hide(t, {
                    transitionOut: 'fadeOutUp',
                    onClosing
                },
                    'task'
                );
            }
        ];
    }

    protected iconFor(type: MessageType): string {
        if (type === MessageType.Error) {
            return 'fa fa-times-circle';
        }
        if (type === MessageType.Warning) {
            return 'fa fa-warning';
        }
        return 'fa fa-info-circle';
    }
}
