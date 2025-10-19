import { http, HttpResponse } from 'msw';
import { users as initialUsers, User } from './data';

// In-memory user storage for mock API
let users = [...initialUsers];
let nextId = users.length + 1;

// Helper function to generate new user ID
const generateUserId = (): string => {
  return String(nextId++);
};

// Helper function to find user by ID
const findUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

// Helper function for pagination
interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const paginateUsers = (params: PaginationParams): PaginatedResponse<User> => {
  const { page = 1, limit = 10, search = '' } = params;

  // Filter users based on search query
  let filteredUsers = users;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = users.filter(user =>
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.bio?.toLowerCase().includes(searchLower)
    );
  }

  const total = filteredUsers.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredUsers.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
};

export const userHandlers = [
  // GET /api/users - Get paginated user list
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const search = url.searchParams.get('search') || '';

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return HttpResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const result = paginateUsers({ page, limit, search });

    return HttpResponse.json(result, { status: 200 });
  }),

  // GET /api/users/:id - Get single user by ID
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    const user = findUserById(id as string);

    if (!user) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(user, { status: 200 });
  }),

  // POST /api/users - Create new user
  http.post('/api/users', async ({ request }) => {
    try {
      const body = await request.json() as Partial<User>;

      // Validate required fields
      if (!body.name || !body.email) {
        return HttpResponse.json(
          { error: 'Name and email are required' },
          { status: 400 }
        );
      }

      // Check if email already exists
      const existingUser = users.find(u => u.email === body.email);
      if (existingUser) {
        return HttpResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }

      // Create new user
      const newUser: User = {
        id: generateUserId(),
        name: body.name,
        email: body.email,
        profileImage: body.profileImage || `https://i.pravatar.cc/150?img=${nextId}`,
        joinDate: new Date().toISOString(),
        bio: body.bio,
        location: body.location,
        website: body.website
      };

      users.push(newUser);

      return HttpResponse.json(newUser, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  }),

  // PUT /api/users/:id - Update user
  http.put('/api/users/:id', async ({ params, request }) => {
    const { id } = params;
    const user = findUserById(id as string);

    if (!user) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    try {
      const body = await request.json() as Partial<User>;

      // Check if email is being changed and already exists
      if (body.email && body.email !== user.email) {
        const existingUser = users.find(u => u.email === body.email);
        if (existingUser) {
          return HttpResponse.json(
            { error: 'Email already exists' },
            { status: 409 }
          );
        }
      }

      // Update user
      const updatedUser: User = {
        ...user,
        name: body.name ?? user.name,
        email: body.email ?? user.email,
        profileImage: body.profileImage ?? user.profileImage,
        bio: body.bio !== undefined ? body.bio : user.bio,
        location: body.location !== undefined ? body.location : user.location,
        website: body.website !== undefined ? body.website : user.website
      };

      users = users.map(u => u.id === id ? updatedUser : u);

      return HttpResponse.json(updatedUser, { status: 200 });
    } catch (error) {
      return HttpResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  }),

  // PATCH /api/users/:id - Partially update user
  http.patch('/api/users/:id', async ({ params, request }) => {
    const { id } = params;
    const user = findUserById(id as string);

    if (!user) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    try {
      const body = await request.json() as Partial<User>;

      // Check if email is being changed and already exists
      if (body.email && body.email !== user.email) {
        const existingUser = users.find(u => u.email === body.email);
        if (existingUser) {
          return HttpResponse.json(
            { error: 'Email already exists' },
            { status: 409 }
          );
        }
      }

      // Partially update user
      const updatedUser: User = {
        ...user,
        ...body,
        id: user.id, // Ensure ID cannot be changed
        joinDate: user.joinDate // Ensure joinDate cannot be changed
      };

      users = users.map(u => u.id === id ? updatedUser : u);

      return HttpResponse.json(updatedUser, { status: 200 });
    } catch (error) {
      return HttpResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  }),

  // DELETE /api/users/:id - Delete user
  http.delete('/api/users/:id', ({ params }) => {
    const { id } = params;
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    users.splice(userIndex, 1);

    return HttpResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  }),

  // GET /api/users/:id/profile - Get user profile (alias for GET /api/users/:id)
  http.get('/api/users/:id/profile', ({ params }) => {
    const { id } = params;
    const user = findUserById(id as string);

    if (!user) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(user, { status: 200 });
  }),

  // PATCH /api/users/:id/profile - Update user profile
  http.patch('/api/users/:id/profile', async ({ params, request }) => {
    const { id } = params;
    const user = findUserById(id as string);

    if (!user) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    try {
      const body = await request.json() as Partial<User>;

      // Profile updates typically don't allow email changes
      // Only update profile-specific fields
      const updatedUser: User = {
        ...user,
        name: body.name ?? user.name,
        profileImage: body.profileImage ?? user.profileImage,
        bio: body.bio !== undefined ? body.bio : user.bio,
        location: body.location !== undefined ? body.location : user.location,
        website: body.website !== undefined ? body.website : user.website
      };

      users = users.map(u => u.id === id ? updatedUser : u);

      return HttpResponse.json(updatedUser, { status: 200 });
    } catch (error) {
      return HttpResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  })
];

// Export helper functions for testing
export const resetUsers = () => {
  users = [...initialUsers];
  nextId = users.length + 1;
};

export const getUsersSnapshot = () => {
  return [...users];
};
