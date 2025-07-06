"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "../../../components/ui/ProtectedRoute";
import DashboardLayout from "../../../components/ui/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Plus, Pencil, Trash } from "lucide-react";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { getTasks, createTask, updateTask, deleteTask, getEmployees } from "../../../utils/api";
import type { Task, Employee } from "../../../utils/api";

interface FormData {
  title: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

const initialFormData: FormData = {
  title: "",
  description: "",
  assignedTo: "",
  status: "pending",
  priority: "medium",
  dueDate: new Date().toISOString().split('T')[0]
};

const TaskForm = ({
  formData,
  employees,
  loading,
  onInputChange,
  onSelectChange,
  onSubmit,
  onCancel,
  submitText
}: {
  formData: FormData,
  employees: Employee[],
  loading: boolean,
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
  onSelectChange: (name: string, value: string) => void,
  onSubmit: (e: React.FormEvent) => Promise<void>,
  onCancel: () => void,
  submitText: string
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="title">Title</Label>
      <Input
        id="title"
        value={formData.title}
        onChange={onInputChange}
        placeholder="Task title"
        required
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Input
        id="description"
        value={formData.description}
        onChange={onInputChange}
        placeholder="Task description"
        required
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="assignedTo">Assign To</Label>
      <Select
        value={formData.assignedTo}
        onValueChange={(value) => onSelectChange("assignedTo", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select employee" />
        </SelectTrigger>
        <SelectContent>
          {employees.map((employee) => (
            <SelectItem key={employee._id} value={employee._id}>
              {employee.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="status">Status</Label>
      <Select
        value={formData.status}
        onValueChange={(value) => onSelectChange("status", value as 'pending' | 'in-progress' | 'completed')}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="priority">Priority</Label>
      <Select
        value={formData.priority}
        onValueChange={(value) => onSelectChange("priority", value as 'low' | 'medium' | 'high')}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="dueDate">Due Date</Label>
      <Input
        id="dueDate"
        type="date"
        value={formData.dueDate}
        onChange={onInputChange}
        required
      />
    </div>
    <DialogFooter>
      <Button
        variant="outline"
        onClick={onCancel}
        type="button"
      >
        Cancel
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? "Processing..." : submitText}
      </Button>
    </DialogFooter>
  </form>
);

export default function TasksPage() {
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const isSuperAdmin = user?.role === "superadmin";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [tasksResponse, employeesResponse] = await Promise.all([
        getTasks(),
        getEmployees(),
      ]);
      
      if (!tasksResponse.success || !employeesResponse.success) {
        throw new Error('Failed to fetch data');
      }
      
      setTasks(tasksResponse.data);
      setEmployees(employeesResponse.data);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedTask(null);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const response = await createTask({
        ...formData,
        createdBy: user?.id
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to create task');
      }
      
      setIsAddDialogOpen(false);
      resetForm();
      await fetchData();
    } catch (err: any) {
      console.error('Error adding task:', err);
      setError(err.message || "Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    try {
      setLoading(true);
      setError("");
      const response = await updateTask(selectedTask._id, formData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update task');
      }
      
      setIsEditDialogOpen(false);
      resetForm();
      await fetchData();
    } catch (err: any) {
      console.error('Error updating task:', err);
      setError(err.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      setLoading(true);
      setError("");
      const response = await deleteTask(selectedTask._id);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete task');
      }
      
      setIsDeleteDialogOpen(false);
      resetForm();
      await fetchData();
    } catch (err: any) {
      console.error('Error deleting task:', err);
      setError(err.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo._id,
      status: task.status,
      priority: task.priority,
      dueDate: new Date(task.dueDate).toISOString().split('T')[0]
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  if (loading && !tasks.length) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-full">
            <div className="text-lg">Loading...</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
              <p className="text-muted-foreground">
                Manage and track employee tasks
              </p>
            </div>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {isSuperAdmin && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                    <DialogDescription>
                      Create a new task and assign it to an employee.
                    </DialogDescription>
                  </DialogHeader>
                  <TaskForm
                    formData={formData}
                    employees={employees}
                    loading={loading}
                    onInputChange={handleInputChange}
                    onSelectChange={handleSelectChange}
                    onSubmit={handleAddTask}
                    onCancel={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}
                    submitText="Add Task"
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  {isSuperAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {task.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{task.assignedTo.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.priority === 'high' 
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(task)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(task)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>
                  Update task information.
                </DialogDescription>
              </DialogHeader>
              <TaskForm
                formData={formData}
                employees={employees}
                loading={loading}
                onInputChange={handleInputChange}
                onSelectChange={handleSelectChange}
                onSubmit={handleEditTask}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
                submitText="Update Task"
              />
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Task</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {selectedTask?.title}? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteTask}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete Task"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 