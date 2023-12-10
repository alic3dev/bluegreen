import React from 'react'

import styles from './Tabbed.module.scss'

export interface Tab {
  name: string
  element: JSX.Element
}

export function Tabbed({ tabs }: { tabs: Tab[] }): JSX.Element {
  const [selectedTab, setSelectedTab] = React.useState<number>(0)

  return (
    <div className={styles.tabbed}>
      <div className={styles.switcher}>
        {tabs.map(
          (tab: Tab, index: number): JSX.Element => (
            <button
              key={tab.name + index}
              className={`${styles.header} ${
                selectedTab === index ? styles.active : ''
              }`}
              onClick={(): void => setSelectedTab(index)}
            >
              {tab.name}
            </button>
          ),
        )}
      </div>

      {tabs.map(
        (tab: Tab, index: number): JSX.Element => (
          <div
            key={tab.name + index}
            className={`${styles.tab} ${
              index === selectedTab ? styles.active : ''
            }`}
          >
            {tab.element}
          </div>
        ),
      )}
    </div>
  )
}
