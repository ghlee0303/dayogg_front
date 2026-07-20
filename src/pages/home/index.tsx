import { SearchBar } from '@/components/molecules/SearchBar'
import { usePlayerSearch } from '@/hooks/usePlayerSearch'

export function HomePage() {
  const { handleSearch } = usePlayerSearch()

  return (
    <div id='search_body' className="w-full flex flex-col items-center justify-center gap-5 flex-1 -translate-y-[40px]">
      <img src="/img/adina_sd.png" alt="Adina" className="w-40 h-auto" />
      <h1 className="text-3xl md:text-5xl font-bold text-white">DAYO.GG</h1>
      <div className="w-full max-w-[400px] px-4 md:px-0">
        <SearchBar onSearch={handleSearch} />
      </div>
    </div>
  )
}