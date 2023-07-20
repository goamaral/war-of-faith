export enum TroopType {
  Leader = 'leader',
}

const NAME_MAP: { [key in TroopType]: string } = {
  [TroopType.Leader]: 'Leader',
}

export default function TroopTypeToString(t: TroopType): string {
  return NAME_MAP[t]
}