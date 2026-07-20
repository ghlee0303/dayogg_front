
// 무기 종류 (WeaponEnum 상수명)
export type WeaponType =
  | 'GLOVE'
  | 'TONFA'
  | 'BAT'
  | 'WHIP'
  | 'THROW'
  | 'SHURIKEN'
  | 'BOW'
  | 'CROSS_BOW'
  | 'PISTOL'
  | 'ASSAULT_RIFLE'
  | 'SNIPER_RIFLE'
  | 'HAMMER'
  | 'AXE'
  | 'DAGGER'
  | 'TWO_HANDED_SWORD'
  | 'POLEARM'
  | 'DUAL_SWORDS'
  | 'SPEAR'
  | 'NUNCHAKU'
  | 'RAPIER'
  | 'GUITAR'
  | 'CAMERA'
  | 'ARCANA'
  | 'VF_ARM';

// 방어구 부위 (ArmorEnum 상수명)
export type ArmorType = 'HEAD' | 'CHEST' | 'ARM' | 'LEG';

// equipType 필드에 들어갈 수 있는 전체 값
export type EquipType = WeaponType | ArmorType;

// category 필드
export type EquipCategory = 'WEAPON' | 'ARMOR';

// TODO: 등급 값 확정 시 유니온 타입으로 교체
export type ItemGradeEnum = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGEND' | 'MYTHIC'

// 등급별 배경색 (Tailwind 클래스, 색상값은 index.css @theme 참고)
export const GRADE_COLOR: Record<ItemGradeEnum, string> = {
  COMMON:   'bg-grade-common',
  UNCOMMON: 'bg-grade-uncommon',
  RARE:     'bg-grade-rare',
  EPIC:     'bg-grade-epic',
  LEGEND:   'bg-grade-legend',
  MYTHIC:   'bg-grade-mythic',
}

export interface EquipInfo {
  code: number
  name?: string
  itemGrade: ItemGradeEnum
  equipType: EquipType
  category: EquipCategory
}
