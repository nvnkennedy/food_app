import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'de.virundhu.app',
  appName: 'Virundhu',
  webDir: 'dist',
  android: {
    allowMixedContent: false
  }
}

export default config
