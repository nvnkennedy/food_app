import { useEffect, useState } from 'react'
import { FamilyProvider, useFamily } from './state'
import { TabBar, type Tab } from './components/TabBar'
import { Today } from './screens/Today'
import { Plan } from './screens/Plan'
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
      if (meta) meta.setAttribute('content', dark ? '#0f1311' : '#f7f8f5')
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
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
        {tab === 'today' && <Today date={date} setDate={setDate} />}
        {tab === 'plan' && <Plan openDay={openDay} />}
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
      <div className="app">
        <Shell />
      </div>
    </FamilyProvider>
  )
}
