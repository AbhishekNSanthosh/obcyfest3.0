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
  regLink?: string;
  type: 'technical' | 'nonTechnical' | 'sports';
  date?: string;
  description: string;
  venue?: string;
  eventType: string;
  isOnline?: boolean;
  maxParticipation?: string;
  minParticipation?: string;
  totalParticipation?: string;
  registrationFee: string;
  firstPrize: string;
  secondPrize?: string;
  requiresExtraData?: boolean;
  extraFields?: { name: string; type: string }[]
  coordinators: { name: string; phone: string }[];
};