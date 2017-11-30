import { injectable } from 'inversify';
import { MessageClient, MessageType, Message, MessageAction } from '@theia/core/lib/common';
import { FrontendApplication, FrontendApplicationContribution } from '@theia/core/lib/browser';

import 'izitoast';
import izitoast1 = require('izitoast');
require('izitoast/dist/css/iziToast.css');

export const MESSAGE_CLASS = 'theia-Message';
export const MESSAGE_ITEM_CLASS = 'theia-MessageItem';

@injectable()
export class ToastMessageClient extends MessageClient implements FrontendApplicationContribution {

    onStart(app: FrontendApplication): void {
        // no-op
    }

    showMessage(message: Message): Promise<MessageAction | undefined> {
        return this.show(message);
    }

    protected show(message: Message): Promise<MessageAction | undefined> {
        return new Promise(resolve => {
            this.showToast(message, a => resolve(a));
        });
    }

    protected showToast(message: Message, onCloseFn: (action: MessageAction | undefined) => void): void {
        const type = this.titleFor(message.type);
        const actions = message.actions || [];
        // tslint:disable-next-line:no-any
        (izitoast1 as any).show({
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

    protected createButton(action: MessageAction, onClose: () => void): any {
        // Using any type due to errors in type definitions,
        // cf. https://github.com/dolce/iziToast/issues/96
        return [`<button>${action.label}</button>`,
        function (instance: any, toast: any) {
            const _instance = instance as any;
            _instance.hide(toast, {
                transitionOut: 'fadeOutUp',
                onClosing: (instance: any, toast: any, closedBy: any) => {
                    onClose();
                }
            }, 'task');
        }];
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
