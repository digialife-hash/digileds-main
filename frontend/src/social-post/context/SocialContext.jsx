import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiRequest, isSocialSurface } from '../services/api.js'
import { AuthContext } from './AuthContext.jsx'

export const SocialContext = createContext(null)

const platformDefaults = [
  { id: 'Instagram', name: 'Instagram', icon: '◎', color: '#e1306c' },
  { id: 'Facebook', name: 'Facebook', icon: 'f', color: '#1877f2' },
  { id: 'LinkedIn', name: 'LinkedIn', icon: 'in', color: '#0a66c2' },
  { id: 'X', name: 'X', icon: '𝕏', color: '#111827' },
  { id: 'YouTube', name: 'YouTube', icon: '▶', color: '#ff0000' },
  { id: 'Google Business', name: 'Google Business', icon: 'G', color: '#4285f4' },
]

function getSocialErrorMessage(error, platform) {
  const message = error?.message || ''
  const lowerMessage = message.toLowerCase()
  const platformName = platform || 'social account'

  if (lowerMessage.includes('not configured')) {
    return `${platformName} connection is not configured yet. Please add the OAuth credentials in the backend environment.`
  }
  if (lowerMessage.includes('client secret') || lowerMessage.includes('invalid oauth')) {
    return `${platformName} OAuth client secret is invalid. Regenerate the secret in Meta Developer Dashboard, update Backend/.env, and restart the backend.`
  }
  if (lowerMessage.includes('feature unavailable') || lowerMessage.includes('temporarily unavailable')) {
    return `Facebook is not allowing this connection yet. Check the app mode, tester role, and Facebook Login settings in Meta Developer Dashboard.`
  }
  if (lowerMessage.includes('access denied') || lowerMessage.includes('authorization was cancelled')) {
    return `The ${platformName} connection was cancelled. No account was connected.`
  }
  if (lowerMessage.includes('redirect_uri') || lowerMessage.includes('redirect uri')) {
    return `The ${platformName} callback URL does not match the OAuth app settings.`
  }
  if (lowerMessage.includes('invalid state') || lowerMessage.includes('authorization code')) {
    return `The ${platformName} connection session expired. Please click Connect again.`
  }
  return message || `Could not connect ${platformName}. Please try again.`
}

export function SocialProvider({ children }) {
  const { user } = useContext(AuthContext)
  const [accounts, setAccounts] = useState(platformDefaults.map((platform) => ({ ...platform, connected: false })))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(null)
  const [isSocial, setIsSocial] = useState(isSocialSurface)

  const refreshAccounts = async () => {
    setLoading(true)
    try {
      const { accounts: connectedAccounts } = await apiRequest('/social/accounts', { allowSocialSurface: true })
      const connectedByPlatform = new Map(connectedAccounts.map((account) => [account.name, account]))
      setAccounts(platformDefaults.map((platform) => ({
        ...platform,
        ...(connectedByPlatform.get(platform.name) || {}),
        connected: connectedByPlatform.has(platform.name),
      })))
      setError('')
    } catch (requestError) {
      setError(getSocialErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const syncSurface = () => setIsSocial(isSocialSurface())
    window.addEventListener('hashchange', syncSurface)
    window.addEventListener('popstate', syncSurface)
    return () => {
      window.removeEventListener('hashchange', syncSurface)
      window.removeEventListener('popstate', syncSurface)
    }
  }, [])

  useEffect(() => {
    if (user && isSocial) refreshAccounts()
    else {
      setAccounts(platformDefaults.map((platform) => ({ ...platform, connected: false })))
      setLoading(false)
    }
  }, [user, isSocial])

  const connectAccount = async (platform) => {
    setError('')
    setNotice({ type: 'info', message: `Opening ${platform} authorization...` })
    try {
      const { authorizationUrl } = await apiRequest(`/social/connect/${encodeURIComponent(platform)}`, { allowSocialSurface: true })
      window.location.assign(authorizationUrl)
    } catch (requestError) {
      setNotice(null)
      setError(getSocialErrorMessage(requestError, platform))
      throw requestError
    }
  }

  const disconnectAccount = async (platform) => {
    setError('')
    try {
      await apiRequest(`/social/accounts/${encodeURIComponent(platform)}`, { method: 'DELETE', allowSocialSurface: true })
      await refreshAccounts()
      setNotice({ type: 'success', message: `${platform} disconnected successfully.` })
    } catch (requestError) {
      setError(getSocialErrorMessage(requestError, platform))
      throw requestError
    }
  }

  const selectLocation = async (platform, locationName) => {
    await apiRequest(`/social/accounts/${encodeURIComponent(platform)}/location`, {
      method: 'PATCH',
      body: JSON.stringify({ locationName }),
      allowSocialSurface: true,
    })
    await refreshAccounts()
    setNotice({ type: 'success', message: 'Google Business publishing location updated.' })
  }

  const value = useMemo(() => ({
    accounts, loading, error, notice, connectAccount, disconnectAccount, selectLocation, refreshAccounts, setError, setNotice,
  }), [accounts, loading, error, notice])
  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>
}
