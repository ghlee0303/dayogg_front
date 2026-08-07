import { Analytics } from "@vercel/analytics/react"
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from '@/pages/home'
import { PlayerPage } from '@/pages/player'
import { Header } from '@/components/organisms/Header'
import { Footer } from '@/components/organisms/Footer'
import { LocaleProvider } from '@/contexts/meta/LocaleContext'
import { TierRangeProvider } from '@/contexts/meta/TierRangeContext'
import { SeasonProvider } from '@/contexts/meta/SeasonContext'
import { TraitProvider } from '@/contexts/meta/TraitContext'
import { EquipProvider } from '@/contexts/meta/EquipContext'

function App() {

  return (
    <LocaleProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SeasonProvider>
          <TierRangeProvider>
            <TraitProvider>
              <EquipProvider>
                <Header />
                <div className="pt-24 md:pt-14 min-h-screen bg-gray-700 flex flex-col">
                  <div className="flex-1 flex">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/player/:name" element={<PlayerPage />} />
                    </Routes>
                  </div>
                  <Footer />
                </div>
              </EquipProvider>
            </TraitProvider>
          </TierRangeProvider>
        </SeasonProvider>
      </BrowserRouter>
      <Analytics />
    </LocaleProvider>
  )
}

export default App
