import { injectable, inject } from 'inversify';
import { BackendApplicationContribution } from '@theia/core/lib/node';
import { MessageService } from '@theia/core';

@injectable()
export class DummyBackendContribution implements BackendApplicationContribution {

    constructor(
        @inject(MessageService) messageService: MessageService) {

        setInterval(() => {
            messageService.info("backend subprocess died", { label: "restart", onExecute: () => { console.log('restarting ...'); } }).then(result => {
                if (result) {
                    console.log("result: " + result.label);
                } else {
                    console.log("UNEXPECTED");
                }
            });
        }, 4000);
    }

}
