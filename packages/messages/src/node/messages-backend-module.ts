import { ContainerModule } from 'inversify';
import { ConnectionHandler, JsonRpcConnectionHandler, MessageClient, DispatchingMessageClient, messageServicePath } from '@theia/core/lib/common';
import { BackendApplicationContribution } from '@theia/core/lib/node';

import { DummyBackendContribution } from './dummy-backend-contribution';

export default new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(BackendApplicationContribution).to(DummyBackendContribution);

    bind(DispatchingMessageClient).toSelf().inSingletonScope();
    rebind(MessageClient).toDynamicValue(ctx => ctx.container.get(DispatchingMessageClient)).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler<MessageClient>(messageServicePath, client => {
            const dispatching = ctx.container.get<DispatchingMessageClient>(DispatchingMessageClient);
            dispatching.clients.add(client);
            client.onDidCloseConnection(() => dispatching.clients.delete(client));
            return dispatching;
        })
    ).inSingletonScope();
});
