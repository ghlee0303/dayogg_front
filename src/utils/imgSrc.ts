type ImgSrcType = 'TIER' | 'CHARACTER' | 'WEAPON' | 'TRAIT' | 'TACTICAL_SKILL' | 'SKIN' | 'EQUIP'

const basePaths: Record<ImgSrcType, string> = {
  TIER: '/img/tier',
  CHARACTER: '/img/character',
  WEAPON: '/img/weapon',
  TRAIT: '/img/trait',
  TACTICAL_SKILL: '/img/tactical_skill',
  SKIN: '/img/skin',
  EQUIP: '/img/item/equip'
}

export function getImgSrc(type: ImgSrcType, key?: string | number) {
  if (key === undefined) return undefined;
  return `${basePaths[type]}/${key}.png`
}

type CharacterImgType = 'MINI' | 'FULL'

export function getCharacterImgSrc(type: CharacterImgType, name?: string | number) {
  return name ? `${basePaths.CHARACTER}/${name}/${type.toLowerCase()}.png` : undefined
}
