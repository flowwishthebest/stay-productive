import isUrl from 'is-url';
import parse from 'url-parse';

export class BlocklistService {

    constructor(storageService) {
        this._storageService = storageService;
				this._list = [];
				this._listKey = 'blocklist';
    }

    async isBlocklisted(site) {
        if (!site) {
            return false;
        }

        if (!isUrl(site)) {
            return false;
        }

        const url = parse(site, true);

        console.log('url is', url.hostname);
        console.log('list is', this._list);

        return (await this.get()).some((el) => {
            return url.hostname === el;
        });
    }

    async set(list) {
        this._list = list.map((el) => {
            if (!isUrl(el)) {
                return;
            }

            const url = parse(el, true);

            return url.hostname;
        }).filter((el) => el !== undefined);

        await this._persistList().catch((err) => {
            console.error('an error while setting blocklist', err);
        });
    }

    async get() {
        try {
            await this._updateList();
        } catch (err) {
            console.error('an error while fetching blocklist at startup', err);
        }

        return [...this._list];
    }

    async _persistList() {
        await this._storageService.set(this._listKey, this._list);
    }

    async _updateList() {
        const res = await this._storageService.get(this._listKey);

        if (res) {
            this._list = res;
        }
    }
}