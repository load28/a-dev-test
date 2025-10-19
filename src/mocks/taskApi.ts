import { Task, TasksResponse } from '../types/task';

// Mock task data
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design new dashboard layout',
    description: 'Create wireframes and mockups for the new dashboard redesign',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Sarah Kim',
    dueDate: '2025-10-25',
    createdAt: '2025-10-15T09:00:00Z',
    updatedAt: '2025-10-18T14:30:00Z',
    tags: ['design', 'ui/ux']
  },
  {
    id: '2',
    title: 'Implement authentication API',
    description: 'Build JWT-based authentication endpoints with refresh token support',
    status: 'todo',
    priority: 'urgent',
    assignee: 'John Doe',
    dueDate: '2025-10-22',
    createdAt: '2025-10-16T10:00:00Z',
    updatedAt: '2025-10-16T10:00:00Z',
    tags: ['backend', 'security']
  },
  {
    id: '3',
    title: 'Fix responsive layout issues',
    description: 'Address mobile layout problems on product detail pages',
    status: 'done',
    priority: 'medium',
    assignee: 'Emily Chen',
    dueDate: '2025-10-20',
    createdAt: '2025-10-14T08:00:00Z',
    updatedAt: '2025-10-19T16:45:00Z',
    tags: ['frontend', 'bug']
  },
  {
    id: '4',
    title: 'Write API documentation',
    description: 'Document all REST API endpoints with examples and response schemas',
    status: 'in_progress',
    priority: 'medium',
    assignee: 'Michael Park',
    dueDate: '2025-10-28',
    createdAt: '2025-10-17T11:00:00Z',
    updatedAt: '2025-10-19T09:15:00Z',
    tags: ['documentation']
  },
  {
    id: '5',
    title: 'Database migration script',
    description: 'Create migration script for new user preferences table',
    status: 'blocked',
    priority: 'high',
    assignee: 'David Lee',
    dueDate: '2025-10-23',
    createdAt: '2025-10-15T13:00:00Z',
    updatedAt: '2025-10-18T10:20:00Z',
    tags: ['database', 'backend']
  },
  {
    id: '6',
    title: 'Performance optimization',
    description: 'Optimize query performance for dashboard analytics',
    status: 'todo',
    priority: 'low',
    assignee: 'Sarah Kim',
    dueDate: '2025-11-05',
    createdAt: '2025-10-18T14:00:00Z',
    updatedAt: '2025-10-18T14:00:00Z',
    tags: ['performance', 'backend']
  },
  {
    id: '7',
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated testing and deployment workflows',
    status: 'done',
    priority: 'high',
    assignee: 'John Doe',
    dueDate: '2025-10-18',
    createdAt: '2025-10-12T09:00:00Z',
    updatedAt: '2025-10-18T17:00:00Z',
    tags: ['devops', 'infrastructure']
  },
  {
    id: '8',
    title: 'Add unit tests for services',
    description: 'Increase test coverage for service layer to 80%+',
    status: 'in_progress',
    priority: 'medium',
    assignee: 'Emily Chen',
    dueDate: '2025-10-30',
    createdAt: '2025-10-16T15:00:00Z',
    updatedAt: '2025-10-19T11:30:00Z',
    tags: ['testing', 'quality']
  }
];

// Mock API handlers
export const taskApiHandlers = {
  getTasks: (): TasksResponse => {
    return {
      tasks: mockTasks,
      total: mockTasks.length
    };
  },

  getTaskById: (id: string): Task | undefined => {
    return mockTasks.find(task => task.id === id);
  },

  getTasksByStatus: (status: Task['status']): TasksResponse => {
    const filteredTasks = mockTasks.filter(task => task.status === status);
    return {
      tasks: filteredTasks,
      total: filteredTasks.length
    };
  },

  getTasksByAssignee: (assignee: string): TasksResponse => {
    const filteredTasks = mockTasks.filter(task => task.assignee === assignee);
    return {
      tasks: filteredTasks,
      total: filteredTasks.length
    };
  }
};

// Simulate API delay
export const delay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock GET /api/tasks endpoint
export const fetchTasks = async (): Promise<TasksResponse> => {
  await delay();
  return taskApiHandlers.getTasks();
};

// Mock GET /api/tasks/:id endpoint
export const fetchTaskById = async (id: string): Promise<Task | undefined> => {
  await delay();
  return taskApiHandlers.getTaskById(id);
};

// Mock GET /api/tasks?status=:status endpoint
export const fetchTasksByStatus = async (status: Task['status']): Promise<TasksResponse> => {
  await delay();
  return taskApiHandlers.getTasksByStatus(status);
};

// Mock GET /api/tasks?assignee=:assignee endpoint
export const fetchTasksByAssignee = async (assignee: string): Promise<TasksResponse> => {
  await delay();
  return taskApiHandlers.getTasksByAssignee(assignee);
};
