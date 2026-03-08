/// <reference types="vite/client" />

interface Window {
  recaptchaVerifier?: any;
  grecaptcha?: any;
  aistudio?: {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  };
}
