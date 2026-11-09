import { useEffect, useState } from 'react'
import { FamilyProvider, useFamily, decodeSetup } from './state'
import { TabBar, type Tab } from './components/TabBar'
import { Today } from './screens/Today'
import { Plan } from './screens/Plan'
import { Recipes } from './screens/Recipes'
import { Grocery } from './screens/Grocery'
import { Me } from './screens/Me'
import { Welcome } from './screens/Welcome'
import { todayISO, type ISODate } from './lib/dates'

function ThemeSync() {
  const { settings } = useFamily()
  const theme = settings.theme
  useEffect(() => {
    const root = document.documentElement
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches)
      root.dataset.theme = dark ? 'dark' : 'light'
      const meta = document.querySelector('meta[name=theme-color]')
      if (meta) meta.setAttribute('content', dark ? '#0b0d10' : '#f7f8f5')
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
  return null
}

/** Imports a family setup shared as #setup=... (from the Family screen on another phone). */
function SetupImport() {
  const { importSetup, profiles } = useFamily()
  useEffect(() => {
    const m = location.hash.match(/#setup=([A-Za-z0-9_-]+)/)
    if (!m) return
    const payload = decodeSetup(m[1])
    history.replaceState(null, '', location.pathname + location.search)
    if (!payload) return
    const names = payload.profiles.map((p) => p.name).join(', ')
    if (profiles.length === 0 || confirm(`Replace this phone's family setup with the shared one (${names})? Weight logs and swaps stay.`)) importSetup(payload)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

function Shell() {
  const { settings, profiles } = useFamily()
  const [tab, setTab] = useState<Tab>('today')
  const [date, setDate] = useState<ISODate>(todayISO())

  const switchTab = (t: Tab) => {
    setTab(t)
    window.scrollTo({ top: 0 })
  }

  const openDay = (d: ISODate) => {
    setDate(d)
    switchTab('today')
  }

  if (!settings.onboarded && profiles.length === 0) {
    return (
      <main className="screen">
        <Welcome />
      </main>
    )
  }

  return (
    <>
      <main className="screen" key={tab}>
        {tab === 'today' && <Today date={date} setDate={setDate} goToFamily={() => switchTab('me')} />}
        {tab === 'plan' && <Plan openDay={openDay} />}
        {tab === 'recipes' && <Recipes />}
        {tab === 'grocery' && <Grocery />}
        {tab === 'me' && <Me />}
      </main>
      <TabBar tab={tab} setTab={switchTab} />
    </>
  )
}

export default function App() {
  return (
    <FamilyProvider>
      <ThemeSync />
      <SetupImport />
      <div className="app">
        <Shell />
      </div>
    </FamilyProvider>
  )
}
