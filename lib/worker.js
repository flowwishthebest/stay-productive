import {BlocklistService} from './services/blocklist.service';

export class BlocklistWorker {
    #sitesBlocklistService = new BlocklistService()

    constructor() {}

    bootstrap() {
        chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
            this.#sitesBlocklistService.isBlocklisted(changeInfo.url ?? tab.url)
                .then((res) => {
                    if (res) {
                        chrome.tabs.remove(tabId);
                    }
                }).catch((err) => {
                    console.error('an error in updated tab handler', err);
                });
        });
    }
}