import { createContext, useCallback, useContext, useEffect, useReducer, useRef, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { Player, PlayerResponse, PlayerSeason, PlayerSeasonDetail } from '@/types/PlayerType'
import { useSSE } from '@/hooks/useSSE'
import { useApi } from '@/hooks/useApi'
import { ApiError } from '@/utils/api'

// info → CONTINUE → refresh → info 사이클의 최대 반복 횟수.
// 백엔드가 CONTINUE를 계속 반환해도 클라이언트가 무한 루프에 빠지지 않도록 가드한다.
const MAX_CONTINUE_RETRY = 3

export type PlayerLoadStatus =
  | 'searching'   // 최초 info 조회 중. 유저 존재 확인 전
  | 'syncing'     // CONTINUE 사이클 진행 중. 유저는 확인됨, 전적 데이터 준비 중
  | 'refreshing'  // 버튼 갱신 진행 중. 기존 데이터를 유지한 채 백그라운드 갱신
  | 'ready'       // 조회 완료
  | 'error'       // 조회 실패 (유저 없음, refresh 실패, 재시도 초과)

interface PlayerContextValue {
  player: Player
  playerSeasonList: PlayerSeason[]
  playerSeasonDetail: PlayerSeasonDetail | null
  latestSeasonId: number | null
  status: PlayerLoadStatus
  error: ApiError | null
  findPlayerSeason: (seasonId: number | null) => PlayerSeason | undefined
  getPlayerSeasonDetail: (playerId: number, seasonId: number) => void
  refresh: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

function defaultPlayer(name: string | undefined): Player {
  return {
    id: 0,
    searchId: '',
    name: name ?? "",
    level: 0,
    lastSearchTime: '-',
  }
}

interface PlayerState {
  player: Player
  playerSeasonList: PlayerSeason[]
  playerSeasonDetail: PlayerSeasonDetail | null
  latestSeasonId: number | null
  status: PlayerLoadStatus
  error: ApiError | null
}

type PlayerAction =
  | { type: 'RESET'; name: string | undefined }
  | { type: 'INFO_OK'; response: PlayerResponse }
  | { type: 'INFO_CONTINUE'; response: PlayerResponse }
  | { type: 'REFRESH_START' }
  | { type: 'FAIL'; error: ApiError }
  | { type: 'SEASON_DETAIL_OK'; detail: PlayerSeasonDetail }

function initialState(name: string | undefined): PlayerState {
  return {
    player: defaultPlayer(name),
    playerSeasonList: [],
    playerSeasonDetail: null,
    latestSeasonId: null,
    status: 'searching',
    error: null,
  }
}

function fromResponse(response: PlayerResponse) {
  return {
    player: response.player,
    playerSeasonList: response.seasonList,
    latestSeasonId: response.latestSeasonId,
  }
}

function reducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'RESET':
      return initialState(action.name)
    case 'INFO_OK':
      return { ...state, ...fromResponse(action.response), status: 'ready', error: null }
    case 'INFO_CONTINUE':
      return {
        ...state,
        ...fromResponse(action.response),
        // 버튼 갱신(refreshing) 중에는 기존 콘텐츠를 계속 보여주기 위해 status를 유지한다
        status: state.status === 'refreshing' ? 'refreshing' : 'syncing',
        error: null,
      }
    case 'REFRESH_START':
      return { ...state, status: 'refreshing' }
    case 'FAIL':
      return { ...state, status: 'error', error: action.error }
    // status 전이 없는 부가 데이터 갱신
    case 'SEASON_DETAIL_OK':
      return { ...state, playerSeasonDetail: action.detail }
  }
}

function toApiError(event: MessageEvent): ApiError {
  try {
    const parsed = JSON.parse(event.data)
    return new ApiError(parsed.status, parsed.message, parsed.type)
  } catch {
    return new ApiError(0, '알 수 없는 오류가 발생했습니다.')
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { name } = useParams<{ name: string }>()

  const [state, dispatch] = useReducer(reducer, name, initialState)
  // 렌더와 무관한 카운터이므로 state 대신 ref로 관리한다 (SSE 콜백의 stale closure 방지)
  const retryCountRef = useRef(0)

  const { connect: connectInfo, disconnect: disconnectInfo } = useSSE('player/sse/info')
  const { connect: connectRefresh, disconnect: disconnectRefresh } = useSSE('player/sse/refresh')

  const { execute: executeSeasonDetail } = useApi<PlayerSeasonDetail>('player/season')

  const getPlayerSeasonDetail = (playerId: number, seasonId: number) => {
    if (!playerId || !seasonId) return

    executeSeasonDetail({
      params: {
        playerId: `${playerId}`,
        seasonId: `${seasonId}`,
      },
      onSuccess: (data) => dispatch({ type: 'SEASON_DETAIL_OK', detail: data }),
      onError: (error) => console.error(error),
    })
  }

  const findPlayerSeason = useCallback(
    (seasonId: number | null) => {
      if (!seasonId) return undefined;
      return state.playerSeasonList.find(season => season.seasonId === seasonId)
    },
    [state.playerSeasonList]
  )

  const loadInfo = (name: string) => {
    connectInfo({
      params: { name },
      onMessage: (event) => {
        const response: PlayerResponse = JSON.parse(event.data)

        if (response.status === 'CONTINUE') {
          if (retryCountRef.current >= MAX_CONTINUE_RETRY) {
            dispatch({ type: 'FAIL', error: new ApiError(0, '전적 갱신이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.') })
            return
          }
          retryCountRef.current += 1
          dispatch({ type: 'INFO_CONTINUE', response })
          startRefresh(response.player.id, name)
          return
        }

        dispatch({ type: 'INFO_OK', response })
        getPlayerSeasonDetail(response.player.id, response.latestSeasonId)
      },
      onError: (event) => {
        dispatch({ type: 'FAIL', error: toApiError(event) })
      },
    })
  }

  const startRefresh = (playerId: number, name: string) => {
    connectRefresh({
      params: { playerId: `${playerId}` },
      onMessage: () => {
        loadInfo(name)
      },
      onError: (event) => {
        dispatch({ type: 'FAIL', error: toApiError(event) })
      },
    })
  }

  const refresh = () => {
    if (!name || !state.player.id) return
    if (state.status !== 'ready') return

    retryCountRef.current = 0
    dispatch({ type: 'REFRESH_START' })
    startRefresh(state.player.id, name)
  }

  useEffect(() => {
    // 이전 유저의 진행 중이던 연결을 폐기하고 처음부터 다시 시작한다
    disconnectInfo()
    disconnectRefresh()
    retryCountRef.current = 0
    dispatch({ type: 'RESET', name })

    if (name) loadInfo(name)
  }, [name])

  return (
    <PlayerContext.Provider
      value={{
        player: state.player,
        playerSeasonList: state.playerSeasonList,
        playerSeasonDetail: state.playerSeasonDetail,
        latestSeasonId: state.latestSeasonId,
        status: state.status,
        error: state.error,
        findPlayerSeason,
        getPlayerSeasonDetail,
        refresh,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}
