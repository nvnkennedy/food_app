import { useState } from 'react'
import { FamilyProvider } from './state'
import { TabBar, type Tab } from './components/TabBar'
import { Today } from './screens/Today'
import { Plan } from './screens/Plan'
import { Grocery } from './screens/Grocery'
import { Me } from './screens/Me'
import { todayISO, type ISODate } from './lib/dates'

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [date, setDate] = useState<ISODate>(todayISO())

  const openDay = (d: ISODate) => {
    setDate(d)
    setTab('today')
  }

  return (
    <FamilyProvider>
      <div className="app">
        <main className="screen">
          {tab === 'today' && <Today date={date} setDate={setDate} />}
          {tab === 'plan' && <Plan openDay={openDay} />}
          {tab === 'grocery' && <Grocery />}
          {tab === 'me' && <Me />}
        </main>
        <TabBar tab={tab} setTab={setTab} />
      </div>
    </FamilyProvider>
  )
}
