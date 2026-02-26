'use client'

import React, { useEffect, useState } from 'react'
import { getRecentTechnicians } from '@/app/(site)/dashboard/actions'

interface User {
  id: number | string
  email: string
  lastLogin?: string
}

export default function ActiveUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getRecentTechnicians(5)
        setUsers(data as User[])
      } catch (error) {
        console.error('Error fetching active users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
    // Refresh every minute
    const interval = setInterval(fetchUsers, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div className="backdrop-blur-md rounded-xl p-6 h-full min-h-[200px] flex items-center justify-center" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
        <div className="animate-spin w-8 h-8 border-2 border-[var(--staff-border)] border-t-[var(--staff-accent)] rounded-full"></div>
    </div>
  )

  return (
    <div className="backdrop-blur-md rounded-xl p-4 md:p-6 h-full" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
      <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--staff-text)' }}>
        <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 bg-green-500"></span>
        </span>
        Active Users
      </h3>
      <div className="space-y-3">
        {users.map((user) => {
            const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
            const isOnline = lastLogin && (new Date().getTime() - lastLogin.getTime() < 15 * 60 * 1000); // 15 mins
            
            return (
                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg transition-colors group gap-2 sm:gap-0" style={{ backgroundColor: 'var(--staff-surface-alt)' }}>
                    <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[var(--staff-accent)] to-[var(--staff-bg)] flex items-center justify-center text-[var(--staff-surface-alt)] font-bold text-sm md:text-lg shadow-lg shrink-0">
                        {user.email?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs md:text-sm font-medium transition-colors truncate" style={{ color: 'var(--staff-text)' }}>{user.email}</div>
                        <div className="text-[10px] md:text-xs truncate" style={{ color: 'var(--staff-muted)' }}>
                        {lastLogin ? lastLogin.toLocaleString() : 'Never logged in'}
                        </div>
                    </div>
                    </div>
                    {isOnline && (
                    <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-500/20 text-green-400 uppercase tracking-wide border border-green-500/30 self-start sm:self-center">
                        Online
                    </span>
                    )}
                </div>
            )
        })}
        {users.length === 0 && (
          <div className="text-center py-4" style={{ color: 'var(--staff-muted)' }}>No users found</div>
        )}
      </div>
    </div>
  )
}
