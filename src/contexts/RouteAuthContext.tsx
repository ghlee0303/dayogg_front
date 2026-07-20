import { createContext, useContext, useState, type ReactNode } from 'react'
import { useApi } from '@/hooks/useApi'
import { RouteAuth } from '@/types/RouteAuthType'

interface RouteAuthContextValue {
  routeAuth: RouteAuth
  getRouteAuth: (playerId: number) => void
  submitRouteAuth: (title: string, routeId: string, playerId: number) => void
  deleteRouteAuth: (authId: number) => void
  reset: () => void
}

const RouteAuthContext = createContext<RouteAuthContextValue | null>(null)

const defaultValue: RouteAuth = {
  id: null,
}

export function RouteAuthProvider({ children }: { children: ReactNode }) {
  const [routeAuth, setRouteAuth] = useState<RouteAuth>(defaultValue);
  const { execute: getRecent } = useApi<RouteAuth>('route_auth/recent')
  const { execute: bodyExecute } = useApi<RouteAuth>('route_auth')

  const getRouteAuth = (playerId: number) => {
    getRecent({
      params: {
        playerId: `${playerId}`,
      },
      onSuccess: (data) => {
        console.log(data);

        setRouteAuth(data)
      }
    })
  }

  const submitRouteAuth = (title: string, routeId: string, playerId: number) => {
    bodyExecute({
      method: "POST",
      params: {
        title: `${title}`,
        routeId: `${routeId}`,
        playerId: `${playerId}`,
      },
      onSuccess: (data) => {
        console.log(data);

        setRouteAuth(data)
      }
    })
  }

  const deleteRouteAuth = (authId: number) => {
    bodyExecute({
      method: "DELETE",
      params: {
        authId: `${authId}`,
      },
      onSuccess: () => {
        setRouteAuth(defaultValue)
      }
    })

  }

  const reset = () => setRouteAuth(defaultValue)

  return (
    <RouteAuthContext.Provider value={{ routeAuth, getRouteAuth, submitRouteAuth, deleteRouteAuth, reset }}>
      {children}
    </RouteAuthContext.Provider>
  )
}

export function useRouteAuth() {
  const ctx = useContext(RouteAuthContext)
  if (!ctx) throw new Error('useRouteAuth must be used within RouteAuthProvider')
  return ctx
}
