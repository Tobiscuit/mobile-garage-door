'use client'

import React, { useEffect, useState } from 'react'

interface User {
  id: number
  email: string
  lastLogin?: string
}

export default function ActiveUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch users sorted by lastLogin descending, EXCLUDING customers
        // Using Payload REST API
        const res = await fetch('/api/users?where[role][not_equals]=customer&sort=-lastLogin&limit=5')
        if (!res.ok) throw new Error('Failed to fetch users')
        const data = await res.json()
        setUsers(data.docs)
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
    <div className="bg-[#2c3e50]/40 backdrop-blur-md border border-[#ffffff10] rounded-xl p-6 h-full min-h-[200px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#ffffff10] border-t-[#f1c40f] rounded-full"></div>
    </div>
  )

  return (
    <div className="bg-[#2c3e50]/40 backdrop-blur-md border border-[#ffffff10] rounded-xl p-6 h-full">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        Active Users
      </h3>
      <div className="space-y-3">
        {users.map((user) => {
            const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
            const isOnline = lastLogin && (new Date().getTime() - lastLogin.getTime() < 15 * 60 * 1000); // 15 mins
            
            return (
                <div key={user.id} className="flex items-center justify-between p-3 bg-[#ffffff05] rounded-lg hover:bg-[#ffffff0a] transition-colors group">
                    <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f1c40f] to-[#f39c12] flex items-center justify-center text-[#2c3e50] font-bold text-lg shadow-lg">
                        {user.email?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-white group-hover:text-[#f1c40f] transition-colors">{user.email}</div>
                        <div className="text-xs text-[#7f8c8d]">
                        {lastLogin ? lastLogin.toLocaleString() : 'Never logged in'}
                        </div>
                    </div>
                    </div>
                    {isOnline && (
                    <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-500/20 text-green-400 uppercase tracking-wide border border-green-500/30">
                        Online
                    </span>
                    )}
                </div>
            )
        })}
        {users.length === 0 && (
          <div className="text-center text-[#7f8c8d] py-4">No users found</div>
        )}
      </div>
    </div>
  )
}
