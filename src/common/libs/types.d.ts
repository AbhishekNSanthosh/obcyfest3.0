export interface Children {
  children: React.ReactNode;
}

export interface IconProps {
  className: string;
}

export type Event = {
  id: string;
  title: string;
  image: string;
  regFinalDate: string;
  bgImage: string;
  regLink?: string;
  type: 'technical' | 'nonTechnical' | 'sports';
  date?: string;
  description: string;
  venue?: string;
  eventType: string;
  memberMaxCount: Number;
  memberMinCount: Number;
  isOnline?: boolean;
  upi1?: string;
  upi2?: string;
  gpay?: string;
  maxParticipation?: string;
  minParticipation?: string;
  totalParticipation?: string;
  eveType?: "ind" | "team"
  registrationFee: string;
  firstPrize: string;
  secondPrize?: string;
  requiresExtraData?: boolean;
  extraFields?: { name: string; type: string }[]
  coordinators: { name: string; phone: string }[];
};

export type AppEvent = {
  id: string;
  title: string;
  image: string;
  regLink?: string;
  type: 'technical' | 'nonTechnical' | 'sports';
  eveType?: "ind" | "team"
  date?: string;
  description: string;
  venue?: string;
  eventType: string;
  memberMaxCount: Number;
  memberMinCount: Number;
  isOnline?: boolean;
  maxParticipation?: string;
  upi1?: string;
  upi2?: string;
  gpay?: string;
  minParticipation?: string;
  totalParticipation?: string;
  registrationFee: string;
  firstPrize: string;
  secondPrize?: string;
  requiresExtraData?: boolean;
  extraFields?: { name: string; type: string }[];
  coordinators: { name: string; phone: string }[];
};
