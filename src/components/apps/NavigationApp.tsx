import { Link } from 'react-router-dom'

import { Alic3 } from '../decorative/Alic3'

import styles from './NavigationApp.module.scss'

export function NavigationApp() {
  return (
    <>
      <div className={styles['title-container']}>
        {new Array(100).fill(null).map((_, i: number) => (
          <h1 key={i} className={styles.title} aria-hidden="true">
            {i % 3 !== 0 ? (
              <>
                <span className={styles.blue}>BLUE</span>
                <span className={styles.green}>GREEN</span>
              </>
            ) : (
              <>
                <span className={styles.green}>GREEN</span>
                <span className={styles.blue}>BLUE</span>
              </>
            )}
          </h1>
        ))}
      </div>

      <div className={styles.navigation}>
        <div className={styles['navigation-section']}>
          <div className={styles['navigation-container']}>
            <h1>ゼロ</h1>

            <p>
              A lightweight, sophisticated, and opinionated tracker style DAW.
            </p>

            <Link to="/zer0" className="button blue">
              Get Started
            </Link>
          </div>

          <div className={styles['navigation-container']}>
            <h1>Misc</h1>

            <Link to="/eye-gen">Eye Gen</Link>
            <Link to="/tones">Tones</Link>
            <Link to="/noise">Noise</Link>
          </div>
        </div>

        <Alic3 header />
      </div>
    </>
  )
}
