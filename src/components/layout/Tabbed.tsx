import React from 'react'

import styles from './Tabbed.module.scss'

export interface Tab {
  id: string
  name: string
  element: JSX.Element
}

export function Tabbed({ tabs }: { tabs: Tab[] }): JSX.Element {
  const [selectedTab, setSelectedTab] = React.useState<string>(
    () => tabs[0]?.id ?? '',
  )

  return (
    <div className={styles.tabbed}>
      <div className={styles.switcher}>
        {tabs.map(
          (tab: Tab): JSX.Element => (
            <button
              key={tab.id}
              className={`${styles.header} ${
                selectedTab === tab.id ? styles.active : ''
              }`}
              onClick={(): void => setSelectedTab(tab.id)}
            >
              {tab.name}
            </button>
          ),
        )}
      </div>

      {tabs.map(
        (tab: Tab): JSX.Element => (
          <div
            key={tab.id}
            className={`${styles.tab} ${
              selectedTab === tab.id ? styles.active : ''
            }`}
          >
            {tab.element}
          </div>
        ),
      )}
    </div>
  )
}
