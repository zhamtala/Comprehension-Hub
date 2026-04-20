import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "com.spc.comprehub",
  appName: "CompreHub",
  webDir: "out",
  server: {
    url: "https://comprehension-hub-h2lb.vercel.app",
    cleartext: true
  }
};

export default config;
