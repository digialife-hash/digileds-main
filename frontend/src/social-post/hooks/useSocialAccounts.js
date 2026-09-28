import { useContext } from 'react'
import { SocialContext } from '../context/SocialContext.jsx'
export const useSocialAccounts = () => useContext(SocialContext)