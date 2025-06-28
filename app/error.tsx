'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h2 style={{ color: '#dc2626', fontSize: '2rem', marginBottom: '1rem' }}>
        Something went wrong!
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        {error.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={reset}
        style={{
          background: '#0a2540',
          color: '#fff',
          padding: '0.75rem 2rem',
          borderRadius: '8px',
          border: 'none',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        Try again
      </button>
    </div>
  )
} 