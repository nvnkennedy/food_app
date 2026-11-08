export type Tab = 'today' | 'plan' | 'grocery' | 'me'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'today', label: 'Today', icon: '🍛' },
  { id: 'plan', label: 'Plan', icon: '📅' },
  { id: 'grocery', label: 'Grocery', icon: '🛒' },
  { id: 'me', label: 'Me', icon: '⚖️' }
]

export function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => (
        <button key={t.id} className={'tab' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
          <span className="tab-icon" aria-hidden>
            {t.icon}
          </span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
