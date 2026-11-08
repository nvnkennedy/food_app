import { IconCalendar, IconCart, IconHome, IconUser } from './Icons'

export type Tab = 'today' | 'plan' | 'grocery' | 'me'

const TABS: { id: Tab; label: string; Icon: typeof IconHome }[] = [
  { id: 'today', label: 'Today', Icon: IconHome },
  { id: 'plan', label: 'Plan', Icon: IconCalendar },
  { id: 'grocery', label: 'Grocery', Icon: IconCart },
  { id: 'me', label: 'Me', Icon: IconUser }
]

export function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map(({ id, label, Icon }) => (
        <button key={id} className={'tab' + (tab === id ? ' active' : '')} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}>
          <Icon size={22} strokeWidth={tab === id ? 2.4 : 2} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
