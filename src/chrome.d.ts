declare const chrome: {
  runtime: {
    onInstalled: {
      addListener(callback: () => void): void;
    };
    onStartup: {
      addListener(callback: () => void): void;
    };
    onMessage: {
      addListener(callback: (request: any, sender: any, sendResponse: (response?: any) => void) => boolean | void): void;
    };
    sendMessage(message: any, callback?: (response: any) => void): void;
    getURL(path: string): string;
    lastError: any;
  };
  tabs: {
    onUpdated: {
      addListener(callback: (tabId: number, changeInfo: any, tab: any) => void): void;
    };
    onActivated: {
      addListener(callback: (activeInfo: any) => void): void;
    };
    onRemoved: {
      addListener(callback: (tabId: number) => void): void;
    };
    query(queryInfo: any, callback: (tabs: any[]) => void): void;
    get(tabId: number, callback: (tab: any) => void): void;
    sendMessage(tabId: number, message: any, callback?: (response: any) => void): void;
  };
  action: {
    setBadgeText(details: { text: string; tabId?: number }): void;
    setBadgeBackgroundColor(details: { color: string; tabId?: number }): void;
    setIcon(details: { path: string; tabId?: number }): void;
    openPopup(): void;
  };
  storage: {
    local: {
      get(keys: string | string[] | object, callback: (result: any) => void): void;
      set(items: object, callback?: () => void): void;
      remove(keys: string | string[], callback?: () => void): void;
    };
  };
};

// Content script globals
declare const window: Window & {
  chrome: typeof chrome;
};

// Content script globals
declare const window: Window & {
  chrome: typeof chrome;
};
