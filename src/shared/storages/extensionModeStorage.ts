import { 
  createStorage, 
  StorageType 
} from "@src/shared/storages/base";

type ExtensionMode = "blacklist" | "whitelist";

const storage = createStorage<ExtensionMode>('extension-mode', 'blacklist', { storageType: StorageType.Local });

const extensionModeStorage = {
  ...storage,
  // TODO: extends your own methods
  toggle: () => {
    storage.set((currentMode) => {
      return currentMode === "blacklist" ? "whitelist" : "blacklist";
    });
  }
};

export default extensionModeStorage;