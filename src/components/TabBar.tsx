import { IconBook, IconCalendar, IconCart, IconHome, IconUsers } from './Icons'

export type Tab = 'today' | 'plan' | 'recipes' | 'grocery' | 'me'

const TABS: { id: Tab; label: string; Icon: typeof IconHome }[] = [
  { id: 'today', label: 'Today', Icon: IconHome },
  { id: 'plan', label: 'Plan', Icon: IconCalendar },
  { id: 'recipes', label: 'Recipes', Icon: IconBook },
  { id: 'grocery', label: 'Grocery', Icon: IconCart },
  { id: 'me', label: 'Family', Icon: IconUsers }
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
