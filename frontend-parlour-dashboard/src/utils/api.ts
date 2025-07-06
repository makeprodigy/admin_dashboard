const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  user?: T;
  token?: string;
}

export interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  joinDate: string;
  isActive: boolean;
  currentStatus: 'in' | 'out';
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdBy: string;
}

export type TaskInput = Omit<Task, 'assignedTo' | '_id' | 'createdBy'> & {
  assignedTo: string;
  createdBy?: string;
};

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  try {
    const res = await fetch(`${API_BASE}/api${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
      ...options,
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();
    
    if (!res.ok) {
      throw new Error(
        typeof data === 'string'
          ? data
          : (data as any).message || 'An error occurred'
      );
    }
    
    return data as any;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

export async function fetchWithRetry<T>(
  endpoint: string,
  options?: RequestInit,
  maxRetries = 3,
  delay = 1000
): Promise<ApiResponse<T>> {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiFetch<T>(endpoint, options);
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

// Employee API functions
export const getEmployees = async (): Promise<ApiResponse<Employee[]>> => {
  return apiFetch('/employees');
};

export const createEmployee = async (employeeData: Partial<Employee>): Promise<ApiResponse<Employee>> => {
  return apiFetch('/employees', {
    method: 'POST',
    body: JSON.stringify(employeeData),
  });
};

export const updateEmployee = async (id: string, employeeData: Partial<Employee>): Promise<ApiResponse<Employee>> => {
  return apiFetch(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(employeeData),
  });
};

export const deleteEmployee = async (id: string): Promise<ApiResponse<void>> => {
  return apiFetch(`/employees/${id}`, {
    method: 'DELETE',
  });
};

// Task API functions
export const getTasks = async (): Promise<ApiResponse<Task[]>> => {
  return apiFetch('/tasks');
};

export const createTask = async (taskData: Partial<TaskInput>): Promise<ApiResponse<Task>> => {
  return apiFetch('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
};

export const updateTask = async (id: string, taskData: Partial<TaskInput>): Promise<ApiResponse<Task>> => {
  return apiFetch(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  });
};

export const deleteTask = async (id: string): Promise<ApiResponse<void>> => {
  return apiFetch(`/tasks/${id}`, {
    method: 'DELETE',
  });
}; 