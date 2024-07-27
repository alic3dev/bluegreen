import React from 'react'

import styles from './ErrorBoundry.module.scss'

export interface ErrorBoundaryProps {
  app?: string
  fallback?: JSX.Element
}

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<ErrorBoundaryProps>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<ErrorBoundaryProps>) {
    super(props)

    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  // TODO: Server log the error on production
  // componentDidCatch(error: Error, info: React.ErrorInfo): void {
  //   console.log(error)
  //   console.log(info)
  //   // Example "componentStack":
  //   //   in ComponentThatThrows (created by App)
  //   //   in ErrorBoundary (created by App)
  //   //   in div (created by App)
  //   //   in App
  //   // logErrorToMyService(error, info.componentStack)
  // }

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children

    return (
      this.props.fallback ?? (
        <div className={styles.fallback}>
          <div className={styles.intro}>
            {this.props.app && <h1 className={styles.app}>{this.props.app}</h1>}

            <div className={styles.icon}>
              {new Array(4).fill('❤️‍🩹').map((emoji, index) => (
                <div
                  key={index}
                  className={styles.iconpart}
                  style={
                    index
                      ? { animationDelay: `${(3 - index) * 1000}ms` }
                      : { animation: 'none' }
                  }
                >
                  {emoji}
                </div>
              ))}
            </div>

            <h1 className={styles.failed}>Failed to load</h1>

            <br />

            <a href="/" className="button">
              Back to Home
            </a>
          </div>

          <div className={styles.error}>
            <div className={styles.name}>
              {this.state.error?.name}:{' '}
              <span className={styles.message}>
                {this.state.error?.message}
              </span>
            </div>

            <div className={styles.content}>
              <pre className={styles.stack}>{this.state.error?.stack}</pre>
            </div>
          </div>
        </div>
      )
    )
  }
}
