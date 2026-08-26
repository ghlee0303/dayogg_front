import { ImageFrame } from '@/components/atoms/ImageFrame'
import { RangeStatistics, SeasonTotalStatistics, Statistics, TierStatistics } from '@/types/statistics/StatisticsType'
import { TierEnum } from '@/types/TierType'
import noDataImg from '@/assets/img/tier/no_data.png'
import { extractDate, formatDateMMDD } from '@/utils/timeUtils'
import { getImgSrc } from '@/utils/imgSrc'

function TierImg({ tierEnum, alt, placeholder, size = 65, height = 90 }: {
  tierEnum: TierEnum
  alt: string
  placeholder: string
  size?: number
  height?: number
}) {
  const src = tierEnum ? getImgSrc("TIER", tierEnum.toLowerCase()) : noDataImg

  return <ImageFrame size={size} height={height} alt={alt} placeholder={placeholder} src={src} />
}

function RangeTierInfo({ stat }: { stat: RangeStatistics }) {
  const startDate = extractDate(stat.range.START.dateTime)
  const endDate = extractDate(stat.range.END.dateTime)

  return (
    <div className="flex items-center justify-center gap-2 min-h-[4.5rem]">
      <TierImg
        tierEnum={stat.range.START.tierEnum}
        alt="start-tier"
        placeholder="시작티어"
        size={55}
        height={80}
      />
      <div className="flex flex-col items-center gap-1">
        <p className="text-gray-300 text-sm font-semibold">{stat.label}</p>
        <p className="text-orange-400 font-bold text-xs">
          {stat.range.START.mmr} RP ~ {stat.range.END.mmr} RP
        </p>
        <p className="text-gray-400 text-xs">
          {formatDateMMDD(startDate) || ''} ~ {formatDateMMDD(endDate) || ''}
        </p>
      </div>
      <TierImg
        tierEnum={stat.range.END.tierEnum}
        alt="end-tier"
        placeholder="종료티어"
        size={55}
        height={80}
      />
    </div>
  )
}

function TotalTierInfo({ stat }: { stat: SeasonTotalStatistics }) {
  return (
    <div className="flex items-center gap-3 min-h-[4.5rem]">
      <TierImg tierEnum={stat.tierEnum} alt='tier' placeholder='티어' />
      <div>
        <p className="text-orange-400 font-bold text-sm">{stat.mmr} RP</p>
        <p className="text-gray-400 text-xs">{stat.totalRank}위</p>
        <p className="text-gray-400 text-xs">{stat.serverName} {stat.serverRank}위</p>
      </div>
    </div>
  )
}

function SingleTierInfo({ stat }: { stat: TierStatistics }) {
  const startDate = extractDate(stat.range.START.dateTime)
  const endDate = extractDate(stat.range.END.dateTime)

  return (
    <div className="flex items-center gap-3 min-h-[4.5rem]">
      <TierImg tierEnum={stat.tierEnum} alt='tier' placeholder='티어' />
      <div className="flex flex-col gap-1">
        <p className="text-gray-300 text-sm font-semibold">{stat.label}</p>
        <p className="text-orange-400 font-bold text-xs">
          {stat.range.START.mmr} RP ~ {stat.range.END.mmr} RP
        </p>
        <p className="text-gray-400 text-xs">
          {formatDateMMDD(startDate) || ''} ~ {formatDateMMDD(endDate) || ''}
        </p>
      </div>
    </div>
  )
}

function TierInfoBody({ stat }: { stat: Statistics }) {
  const renderBody = () => {
    switch (stat.type) {
      case 'SEASON_TOTAL': return <TotalTierInfo stat={stat} />
      case 'TIER': return <SingleTierInfo stat={stat} />
      case 'RANGE': return <RangeTierInfo stat={stat} />
    }
  }

  return (
    <div className="flex items-center justify-center w-full max-w-[320px] mx-auto h-full max-h-[437px]">
      {renderBody()}
    </div>
  )
}

export function TierInfo({ stat }: { stat: Statistics }) {
  return (
    <>
      <TierInfoBody stat={stat} />
    </>
  )
}
