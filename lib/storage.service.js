export class StorageService {
  async get(key) {
    const result = localStorage.getItem(key);

    if (result === null) {
      return;
    }

    return JSON.parse(result);
  }

  async set(key, value)  {
    localStorage.setItem(key, JSON.stringify(value));
  }
}