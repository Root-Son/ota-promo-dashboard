export const SPREADSHEET_ID = "1zqv3SmFAB6qUGgFVFAgDUW2DNBPFQs9KRyTY_eepAL4";
export const SHEET_NAME = "Template_Admin";

export const CHANNELS = ["Booking.com", "Trip.com", "Yanolja", "Yeogi"] as const;
export type Channel = (typeof CHANNELS)[number];

export const BRANCHES = [
  "강남로이움", "강남시그니티", "낙산해변", "남포", "당진",
  "동탄레지던스", "동탄호텔", "명동", "부산기장", "부산시청",
  "부산역", "서면", "속초등대", "속초자이엘라", "속초중앙",
  "속초해변", "속초해변AB", "속초해변C", "송도달빛공원", "송도해변",
  "시흥거북섬", "시흥웨이브파크", "울산스타즈", "익선",
  "인천차이나타운", "제주공항", "해운대역", "해운대패러그라프",
] as const;

export const CHANNEL_COLORS: Record<string, string> = {
  "Booking.com": "#003580",
  "Trip.com": "#287DFA",
  "Yanolja": "#FF4081",
  "Yeogi": "#7C4DFF",
};
