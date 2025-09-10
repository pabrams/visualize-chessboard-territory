export interface LichessUser {
  id: string;
  username: string;
  perfs: {
    [key: string]: {
      games: number;
      rating: number;
      rd: number;
      prog: number;
      prov?: boolean;
    };
  };
  createdAt: number;
  profile: {
    country: string;
    location: string;
    bio: string;
    firstName: string;
    lastName: string;
    fideRating: number;
    uscfRating: number;
    ecfRating: number;
    links: string;
  };
  seenAt: number;
  patron: boolean;
  playTime: {
    total: number;
    tv: number;
  };
  language: string;
  title: string;
  online: boolean;
  streaming: boolean;
}
