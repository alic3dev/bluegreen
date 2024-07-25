import React from 'react'
import { Link } from 'react-router-dom'

import { Alic3 } from '../decorative/Alic3'

import styles from './NavigationApp.module.scss'

export function NavigationApp() {
  const backgroundRef = React.useRef<HTMLDivElement>(null)

  React.useEffect((): (() => void) => {
    let firstRun: boolean = true
    function onScroll(): void {
      if (!backgroundRef.current) return

      if (!firstRun) {
        backgroundRef.current.style.transition = 'padding-bottom 50ms ease-out'
      }

      backgroundRef.current.style.paddingBottom = `${window.scrollY / 1.5}px`

      firstRun = false
    }

    onScroll()

    window.addEventListener('scroll', onScroll)

    return (): void => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      <div ref={backgroundRef} className={styles['title-container']}>
        <h1 className={styles.title} aria-hidden="true">
          {new Array(500).fill(null).map(
            (_: null, i: number): React.ReactNode => (
              <React.Fragment key={i}>
                {i % 3 === 0 ? (
                  <>
                    <span className={styles.blue}>BLUE</span>
                    <span className={styles.greendark}>GREEN</span>
                  </>
                ) : i % 2 === 0 ? (
                  <>
                    <span className={styles.bluedark}>BLUE</span>
                    <span className={styles.green}>GREEN</span>
                  </>
                ) : (
                  <>
                    <span className={styles.bluedark}>BLUE</span>
                    <span className={styles.greendark}>GREEN</span>
                  </>
                )}
              </React.Fragment>
            ),
          )}
        </h1>
      </div>

      <div className={styles.navigation}>
        <div className={styles['navigation-section']}>
          <div className={styles['navigation-container-wrapper']}>
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
              <p>// TODO: Put additional info here</p>
            </div>
          </div>

          <div className={styles['navigation-container-wrapper']}>
            <div className={styles['navigation-container']}>
              <h2>Other tools</h2>

              <div>
                <Link to="/eye-gen">Eye Gen</Link>- &nbsp;Generate waves of
                sound
              </div>
              <div>
                <Link to="/tones">Tones</Link>- &nbsp;Produce a multitude of
                specific frequencies simultaneously
              </div>
              <div>
                <Link to="/noise">Noise</Link>- &nbsp;A rhythm, a heartbeat, its
                life is yours.
              </div>
            </div>
          </div>
        </div>

        <Alic3 header />

        <div className={styles.border} />
      </div>
    </>
  )
}
