
export interface RouteAuth {
  id: number | null,
  routeId?: string,
  title?: string,
  status?: 'PLAYER_NOT_EQUAL' | 'TITLE_NOT_EQUAL' | 'TIMEOUT' | 'OK',
  createAt?: string,
  updateAt?: string
}