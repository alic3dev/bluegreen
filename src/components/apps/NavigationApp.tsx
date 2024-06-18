import { Link } from 'react-router-dom'

import { Alic3 } from '../decorative/Alic3'

import styles from './NavigationApp.module.scss'

export function NavigationApp() {
  return (
    <div className={styles.navigation}>
      <Alic3 header />

      <h1 className={styles.title}>
        <Link to="/">
          <span className={styles.blue}>BLUE</span>
          <span className={styles.green}>GREEN</span>
        </Link>
      </h1>

      <div className={styles['navigation-wrapper']}>
        <div className={styles['navigation-section']}>
          <div className={styles['navigation-container']}>
            <h2>DAW</h2>
            <Link to="/zer0">ゼロ</Link>
          </div>

          <div className={styles['navigation-container']}>
            <h2>Misc</h2>
            <Link to="/circle">Circle</Link>
            <Link to="/eye-gen">Eye Gen</Link>
            <Link to="/noise">Noise</Link>
            <Link to="/visdio">Visdio</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
