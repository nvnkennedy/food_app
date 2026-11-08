import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'de.gharkakhana.app',
  appName: 'Ghar Ka Khana',
  webDir: 'dist',
  android: {
    allowMixedContent: false
  }
}

export default config
