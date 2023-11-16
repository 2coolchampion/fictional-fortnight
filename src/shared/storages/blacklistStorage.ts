import { createStorage, StorageType } from "./base";

type blacklist = string[];

const Storage = createStorage<blacklist>('blacklist', [] , { storageType: StorageType.Sync });

const blacklistStorage = {
  ...Storage,
  // TODO: extends your own methods
  remove: (websitesToRemove: string | string[]) => {
    const currentBlacklist = Storage.getSnapshot();
    const updatedBlacklist = currentBlacklist.filter(website => !websitesToRemove.includes(website));
    Storage.set(updatedBlacklist);

    return updatedBlacklist;
  }
}

export default blacklistStorage;