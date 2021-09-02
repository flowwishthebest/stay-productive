import isUrl from 'is-url';
import parse from 'url-parse';

export class BlocklistService {
    #list = [];
    #listKey = 'blocklist';
    #storageService;

    constructor(
        storageService
    ) {
        this.#storageService = storageService;
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
        console.log('list is', this.#list);

        return (await this.get()).some((el) => {
            return url.hostname === el;
        });
    }

    async set(list) {
        this.#list = list.map((el) => {
            if (!isUrl(el)) {
                return;
            }

            const url = parse(el, true);

            return url.hostname;
        }).filter((el) => el !== undefined);

        await this.#persistList().catch((err) => {
            console.error('an error while setting blocklist', err);
        });
    }

    async get() {
        try {
            await this.#updateList();
        } catch (err) {
            console.error('an error while fetching blocklist at startup', err);
        }

        return [...this.#list];
    }

    async #persistList() {
        await this.#storageService.set(this.#listKey, this.#list);
    }

    async #updateList() {
        const res = await this.#storageService.get(this.#listKey);

        if (res) {
            this.#list = res;
        }
    }
}