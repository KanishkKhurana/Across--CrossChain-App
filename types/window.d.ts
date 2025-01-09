interface Window {
    ethereum?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (event: string, callback: (accounts: string[]) => void) => void;
    };
  }
  
  