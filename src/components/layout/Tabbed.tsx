import React from 'react'

import styles from './Tabbed.module.scss'

export interface Tab {
  name: string
  element: JSX.Element
}

export function Tabbed({ tabs }: { tabs: Tab[] }) {
  const [selectedTab, setSelectedTab] = React.useState<number>(0)

  return (
    <div className={styles.tabbed}>
      <div className={styles.switcher}>
        {tabs.map((tab, index) => (
          <button
            key={tab.name + index}
            className={`${styles.header} ${
              selectedTab === index ? styles.active : ''
            }`}
            onClick={() => setSelectedTab(index)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {tabs.map((tab, index) => (
        <div
          key={tab.name + index}
          className={`${styles.tab} ${
            index === selectedTab ? styles.active : ''
          }`}
        >
          {tab.element}
        </div>
      ))}
    </div>
  )
}
