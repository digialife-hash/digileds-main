import { useState } from 'react'
export default function useMedia() {
  const [media, setMedia] = useState([])
  const addMedia = (files) => setMedia((items) => [...items, ...Array.from(files)])
  return { media, addMedia }
}