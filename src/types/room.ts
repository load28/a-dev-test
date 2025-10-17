export interface Room {
  id: string;
  name: string;
  description?: string;
  participantCount: number;
  maxParticipants?: number;
  createdAt: string;
  status: 'active' | 'inactive' | 'full';
  host: {
    id: string;
    name: string;
  };
}

export interface RoomListResponse {
  rooms: Room[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RoomListParams {
  page?: number;
  pageSize?: number;
  status?: 'active' | 'inactive' | 'all';
  sortBy?: 'createdAt' | 'name' | 'participantCount';
  sortOrder?: 'asc' | 'desc';
}
