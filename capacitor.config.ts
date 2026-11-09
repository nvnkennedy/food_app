import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.virundhu.app',
  appName: 'Platora',
  webDir: 'dist',
  backgroundColor: '#f7f8f5',
  android: {
    allowMixedContent: false
  }
}

export default config
