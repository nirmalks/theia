import { injectable, inject } from 'inversify';
import { BackendApplicationContribution } from '@theia/core/lib/node';
import { MessageService } from '@theia/core';
import { clearInterval } from 'timers';

@injectable()
export class DummyBackendContribution implements BackendApplicationContribution {

    constructor(
        @inject(MessageService) messageService: MessageService) {

        let countdown = 10;
        const t = setInterval(() => {
            messageService.info("backend subprocess died", "restart", "nvm").then(result => {
                if (result) {
                    console.log("result: " + result);
                } else {
                    console.log("UNEXPECTED");
                }
            });
            if ((countdown--) < 1) {
                clearInterval(t);
            }
        }, 4000);
    }

}
