import { Link } from 'react-router-dom'

import styles from './NavigationApp.module.scss'

export function NavigationApp() {
  return (
    <div className={styles.navigation}>
      <Link to="/circle">Circle</Link>
      <Link to="/eye-gen">Eye Gen</Link>
      <Link to="/noise">Noise</Link>
      <Link to="/visdio">Visdio</Link>
      <Link to="/zer0">ゼロ</Link>
    </div>
  )
}
