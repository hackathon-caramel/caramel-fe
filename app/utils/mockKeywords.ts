export type KeywordOption = {
  id: string;
  label: string;
  description: string;
};

export const mockKeywords: KeywordOption[] = [
  {
    id: "campfire-story",
    label: "안락한",
    description: "고요하고 평온한 분위기의 사운드.",
  },
  {
    id: "dawn-chorus",
    label: "긴장되는",
    description: "순식간에 경직되는 분위기의 음악.",
  },
  {
    id: "city-echo",
    label: "따뜻한",
    description: "한 겨울 모닥불처럼 온기가 느껴지는 음악.",
  },
];
