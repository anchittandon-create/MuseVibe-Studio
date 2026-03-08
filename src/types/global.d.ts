/// <reference types="vite/client" />

interface Window {
  recaptchaVerifier?: any;
  aistudio?: {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  };
}
