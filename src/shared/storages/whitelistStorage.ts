import { createStorage, StorageType } from "./base";

type Whitelist = string[];

const Storage = createStorage<Whitelist>("whitelist", [], {
  storageType: StorageType.Sync,
});

const whitelistStorage = {
  ...Storage,
  // TODO: extends your own methods
  remove: (websitesToRemove: string | string[]) => {
    const currentWhitelist = Storage.getSnapshot();
    const updatedWhitelist = currentWhitelist.filter(
      (website) => !websitesToRemove.includes(website)
    );
    Storage.set(updatedWhitelist);

    return updatedWhitelist;
  },
};

export default whitelistStorage;
