import { useNavigate } from 'react-router-dom'

export function usePlayerSearch() {
  const navigate = useNavigate()

  const handleSearch = (query: string) => {
    navigate(`/player/${encodeURIComponent(query)}`)
  }

  return { handleSearch }
}