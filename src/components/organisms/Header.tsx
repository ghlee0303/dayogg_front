import { useNavigate } from 'react-router-dom'
import { SearchBar } from '@/components/molecules/SearchBar'
import { usePlayerSearch } from '@/hooks/usePlayerSearch'

export function Header() {
  const navigate = useNavigate()
  const { handleSearch } = usePlayerSearch()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-24 md:h-14 bg-gray-800 flex items-center px-4 md:px-6 shadow-md">
      <div className='mx-auto w-full max-w-5xl flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4'>
        <div id='header_title' className="shrink-0">
          <button
            onClick={() => navigate('/')}
            className="text-white text-xl font-bold tracking-wide hover:text-gray-300 transition-colors"
          >
            DAYO.GG
          </button>
        </div>
        <div id='header_middle' className="hidden md:block md:flex-1" />
        <div id='header_end' className="w-full md:w-56 shrink-0">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
    </header>
  )
}