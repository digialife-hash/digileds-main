import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiRequest, hasSocialSession, isSocialSurface } from '../services/api.js'
import { AuthContext } from './AuthContext.jsx'
import { addNotification } from '../utils/notifications.js'

export const PostContext = createContext(null)

function normalizePost(post) {
  return { ...post, id: post.id || post._id }
}

export function PostProvider({ children }) {
  const { user } = useContext(AuthContext)
  const [posts, setPosts] = useState([])
  const [isSocial, setIsSocial] = useState(isSocialSurface)
  const [loading, setLoading] = useState(Boolean(user) && isSocialSurface())

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
    if (!user || !isSocial || !hasSocialSession()) {
      setPosts([])
      setLoading(false)
      return
    }
    setLoading(true)
    apiRequest('/posts', { allowSocialSurface: true })
      .then(({ posts: storedPosts }) => setPosts(storedPosts.map(normalizePost)))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [user, isSocial])

  const addPost = async (post, onProgress) => {
    const newPost = {
      status: 'Draft',
      date: 'Not scheduled',
      color: '#8b5cf6',
      ...post,
    }
    const body = new FormData()
    Object.entries(newPost).forEach(([key, value]) => {
      if (key !== 'media' && key !== 'thumbnail' && value !== undefined && value !== null) {
        body.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
      }
    })
    if (post.media) body.append('media', post.media)
    if (post.thumbnail) body.append('thumbnail', post.thumbnail)
    const { post: storedPost } = await apiRequest('/posts', { method: 'POST', body, onProgress, allowSocialSurface: true })
    const normalizedPost = normalizePost(storedPost)
    setPosts((items) => [normalizedPost, ...items])
    const status = normalizedPost.status
    addNotification({
      id: `post-${normalizedPost.id}-${status}`,
      type: "publishing",
      title: status === "Published" ? "Post published successfully" : status === "Scheduled" ? "Post scheduled" : "Draft saved",
      message: `"${normalizedPost.title || "Untitled post"}" is now ${String(status).toLowerCase()}.`,
      link: "/dashboard/posts",
    })
    return normalizedPost
  }

  const updatePost = async (id, changes) => {
    const { post } = await apiRequest(`/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
      allowSocialSurface: true,
    })
    setPosts((items) => items.map((item) => item._id === id || item.id === id ? normalizePost(post) : item))
  }

  const updatePublishedVisibility = async (id, platform, visibility) => {
    const { post } = await apiRequest(
      `/posts/${id}/provider/${encodeURIComponent(platform)}/visibility`,
      { method: 'PATCH', body: JSON.stringify({ visibility }), allowSocialSurface: true },
    )
    setPosts((items) => items.map((item) => item._id === id || item.id === id ? normalizePost(post) : item))
    return normalizePost(post)
  }

  const updatePublishedThumbnail = async (id, platform, file) => {
    const body = new FormData()
    body.append('thumbnail', file)
    const { post } = await apiRequest(
      `/posts/${id}/provider/${encodeURIComponent(platform)}/thumbnail`,
      { method: 'PATCH', body, allowSocialSurface: true },
    )
    setPosts((items) => items.map((item) => item._id === id || item.id === id ? normalizePost(post) : item))
    return normalizePost(post)
  }

  const repostPost = async (id) => {
    const { post } = await apiRequest(`/posts/${id}/repost`, { method: 'POST', allowSocialSurface: true })
    const normalizedPost = normalizePost(post)
    setPosts((items) => items.map((item) => item._id === id || item.id === id ? normalizedPost : item))
    return normalizedPost
  }

  const deletePost = async (id, platforms) => {
    const currentPost = posts.find((post) => post._id === id || post.id === id)
    const providerResults = currentPost?.providerResults || {}
    const selectedPlatforms = platforms?.length ? platforms : Object.keys(providerResults)
    for (const platform of selectedPlatforms) {
      await apiRequest(`/posts/${id}/provider/${encodeURIComponent(platform)}`, { method: 'DELETE', allowSocialSurface: true })
    }
    const remainingPlatforms = Object.keys(providerResults).filter((platform) => !selectedPlatforms.includes(platform))
    if (!remainingPlatforms.length) {
      await apiRequest(`/posts/${id}`, { method: 'DELETE', allowSocialSurface: true })
      setPosts((items) => items.filter((post) => post._id !== id && post.id !== id))
    } else {
      const { post } = await apiRequest(`/posts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          providerResults: Object.fromEntries(
            Object.entries(providerResults).filter(([platform]) => remainingPlatforms.includes(platform)),
          ),
        }),
        allowSocialSurface: true,
      })
      setPosts((items) => items.map((item) => item._id === id || item.id === id ? normalizePost(post) : item))
    }
  }

  const value = useMemo(() => ({
    posts,
    loading,
    addPost,
    updatePost,
    updatePublishedVisibility,
    updatePublishedThumbnail,
    repostPost,
    deletePost,
  }), [posts, loading])
  return <PostContext.Provider value={value}>{children}</PostContext.Provider>
}
