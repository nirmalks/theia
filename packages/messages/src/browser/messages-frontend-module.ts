import { ContainerModule } from 'inversify';
import { ToastMessageClient } from './toast-message-client';
import { MessageClient, messageServicePath } from '@theia/core/lib/common';
import { WebSocketConnectionProvider } from '@theia/core/lib/browser';

import '../../src/browser/style/index.css';
import 'izitoast/dist/css/iziToast.css';

export default new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(ToastMessageClient).toSelf().inSingletonScope();

    rebind(MessageClient).toDynamicValue(context => {
        const client = context.container.get(ToastMessageClient);
        WebSocketConnectionProvider.createProxy(context.container, messageServicePath, client);
        return client;
    }).inSingletonScope();
});
