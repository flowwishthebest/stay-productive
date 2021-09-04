import {BlocklistService} from './services/blocklist.service';

export class BlocklistWorker {

    constructor() {
			this._sitesBlocklistService = new BlocklistService();
		}

    bootstrap() {
        chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
            this._sitesBlocklistService.isBlocklisted(changeInfo.url ?? tab.url)
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