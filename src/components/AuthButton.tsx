"use client"

import { signIn, signOut, useSession } from "next-auth/react"

export default function AuthButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Loading...</div>
  }

  if (session) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {session.user?.image ? (
            <img 
              src={session.user.image} 
              alt="User Avatar" 
              style={{ width: '24px', height: '24px', borderRadius: '50%' }}
            />
          ) : (
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px' }}>
              {session.user?.name?.[0] || 'U'}
            </div>
          )}
          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session.user?.name || session.user?.email}
          </span>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            textAlign: 'center'
          }}
        >
          Sign Out
        </button>
      </div>
    )
  }

  return null;
}
