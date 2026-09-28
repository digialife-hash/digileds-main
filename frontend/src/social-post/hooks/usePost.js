import { useContext } from 'react'
import { PostContext } from '../context/PostContext.jsx'
export const usePost = () => useContext(PostContext)