export interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  joinDate: string;
  bio?: string;
  location?: string;
  website?: string;
}

export const users: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    profileImage: 'https://i.pravatar.cc/150?img=1',
    joinDate: '2023-01-15T08:30:00Z',
    bio: 'Full-stack developer passionate about React and TypeScript',
    location: 'San Francisco, CA',
    website: 'https://sarahjohnson.dev'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    profileImage: 'https://i.pravatar.cc/150?img=12',
    joinDate: '2023-03-22T14:45:00Z',
    bio: 'Frontend engineer specializing in modern web technologies',
    location: 'New York, NY',
    website: 'https://michaelchen.io'
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    profileImage: 'https://i.pravatar.cc/150?img=5',
    joinDate: '2023-06-10T10:15:00Z',
    bio: 'UI/UX designer and developer creating beautiful interfaces',
    location: 'London, UK',
    website: 'https://emmadavis.design'
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    profileImage: 'https://i.pravatar.cc/150?img=13',
    joinDate: '2023-08-05T16:20:00Z',
    bio: 'Software architect building scalable applications',
    location: 'Seattle, WA',
    website: 'https://jameswilson.tech'
  },
  {
    id: '5',
    name: 'Sophia Martinez',
    email: 'sophia.martinez@example.com',
    profileImage: 'https://i.pravatar.cc/150?img=9',
    joinDate: '2023-11-18T09:00:00Z',
    bio: 'Tech lead with expertise in cloud architecture and DevOps',
    location: 'Austin, TX',
    website: 'https://sophiamartinez.com'
  },
  {
    id: '6',
    name: 'David Kim',
    email: 'david.kim@example.com',
    profileImage: 'https://i.pravatar.cc/150?img=14',
    joinDate: '2024-01-25T11:30:00Z',
    bio: 'Mobile and web developer focused on cross-platform solutions',
    location: 'Toronto, Canada',
    website: 'https://davidkim.dev'
  },
  {
    id: '7',
    name: 'Olivia Brown',
    email: 'olivia.brown@example.com',
    profileImage: 'https://i.pravatar.cc/150?img=10',
    joinDate: '2024-03-12T13:45:00Z',
    bio: 'Data engineer passionate about analytics and visualization',
    location: 'Boston, MA',
    website: 'https://oliviabrown.io'
  },
  {
    id: '8',
    name: 'Alexander Lee',
    email: 'alex.lee@example.com',
    profileImage: 'https://i.pravatar.cc/150?img=15',
    joinDate: '2024-05-30T15:00:00Z',
    bio: 'Backend developer specializing in API design and microservices',
    location: 'Berlin, Germany',
    website: 'https://alexlee.tech'
  }
];
