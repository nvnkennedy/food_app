import { useEffect, useState } from 'react'
import { FamilyProvider, useFamily } from './state'
import { TabBar, type Tab } from './components/TabBar'
import { Today } from './screens/Today'
import { Plan } from './screens/Plan'
import { Grocery } from './screens/Grocery'
import { Me } from './screens/Me'
import { todayISO, type ISODate } from './lib/dates'

function ThemeSync() {
  const { theme } = useFamily()
  useEffect(() => {
    const root = document.documentElement
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches)
      root.dataset.theme = dark ? 'dark' : 'light'
      const meta = document.querySelector('meta[name=theme-color]')
      if (meta) meta.setAttribute('content', dark ? '#0f1115' : '#f6f5f1')
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
  return null
}

export default function App() {
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

  return (
    <FamilyProvider>
      <ThemeSync />
      <div className="app">
        <main className="screen" key={tab}>
          {tab === 'today' && <Today date={date} setDate={setDate} goToMe={() => switchTab('me')} />}
          {tab === 'plan' && <Plan openDay={openDay} />}
          {tab === 'grocery' && <Grocery />}
          {tab === 'me' && <Me />}
        </main>
        <TabBar tab={tab} setTab={switchTab} />
      </div>
    </FamilyProvider>
  )
}
