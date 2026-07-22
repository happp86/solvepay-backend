import { TeamMember } from '../types/data';

export const mockTeamMembers: TeamMember[] = [
  {
    id: 'tm_101',
    name: 'Sophia Martinez',
    role: 'Lead Product Designer',
    email: 'sophia.m@solvepay.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    status: 'Active',
    spentThisMonth: 1250.00,
  },
  {
    id: 'tm_102',
    name: 'Marcus Chen',
    role: 'Senior Tech Lead',
    email: 'marcus.c@solvepay.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    status: 'Active',
    spentThisMonth: 2840.50,
  },
  {
    id: 'tm_103',
    name: 'Elena Rostova',
    role: 'Marketing Manager',
    email: 'elena.r@solvepay.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    status: 'Active',
    spentThisMonth: 980.00,
  },
  {
    id: 'tm_104',
    name: 'David Kalu',
    role: 'DevOps Engineer',
    email: 'david.k@solvepay.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    status: 'Offline',
    spentThisMonth: 420.00,
  },
  {
    id: 'tm_105',
    name: 'Jessica Taylor',
    role: 'Financial Analyst',
    email: 'jessica.t@solvepay.com',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    status: 'Pending',
    spentThisMonth: 0.00,
  },
];
