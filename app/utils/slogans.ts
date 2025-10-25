export const SLOGANS: string[] = [
  "이 순간에 필요한 음악 생성",
  "지금을 위한 사운드 생성",
  "감정에 맞는 음악 즉시 생성",
  "순간의 분위기를 음악으로",
  "지금 무드를 음악으로 바꾸다",
  "분위기에 맞춰 음악 자동 생성",
  "당신의 순간을 음악으로 기록",
  "순간에 딱 맞는 멜로디",
  "지금, 필요한 비트 만들기",
  "한 번의 터치로 지금의 음악",
  "지금 이 느낌, 바로 음악으로",
  "지금을 채우는 즉석 사운드",
  "상황에 맞춘 맞춤 음악 생성",
  "지금의 장면을 위한 OST",
  "감성에 맞춘 음악 즉시 제작",
];

export function getRandomSlogan(): string {
  const idx = Math.floor(Math.random() * SLOGANS.length);
  return SLOGANS[idx] ?? SLOGANS[0];
}

