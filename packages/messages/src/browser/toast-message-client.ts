import { injectable } from 'inversify';
import {
    MessageClient,
    MessageType,
    Message
} from '@theia/core/lib/common';
import {
    FrontendApplication,
    FrontendApplicationContribution
} from '@theia/core/lib/browser';

import 'izitoast';
import toast = require('izitoast');

export const MESSAGE_CLASS = 'theia-Message';
export const MESSAGE_ITEM_CLASS = 'theia-MessageItem';

@injectable()
export class ToastMessageClient extends MessageClient implements FrontendApplicationContribution {

    onStart(app: FrontendApplication): void {
        // no-op
    }

    showMessage(message: Message): Promise<string | undefined> {
        return this.show(message);
    }

    protected show(message: Message): Promise<string | undefined> {
        return new Promise(resolve => {
            this.showToast(message, a => resolve(a));
        });
    }

    protected showToast(message: Message, onCloseFn: (action: string | undefined) => void): void {
        const type = this.titleFor(message.type);
        const actions = message.actions || [];
        // tslint:disable-next-line:no-any
        (toast as any).show({
            title: type,
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

    protected titleFor(type: MessageType): string {
        if (type === MessageType.Error) {
            return 'ERROR';
        }
        if (type === MessageType.Warning) {
            return 'WARNING';
        }
        return 'INFO';
    }
}
