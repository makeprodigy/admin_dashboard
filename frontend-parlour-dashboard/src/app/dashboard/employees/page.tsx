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
import { Plus, Pencil, Trash } from "lucide-react";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "../../../utils/api";
import type { Employee } from "../../../utils/api";

interface FormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  joinDate: string;
  isActive: boolean;
}

const initialFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  position: "",
  joinDate: new Date().toISOString().split('T')[0],
  isActive: true
};

const EmployeeForm = ({
  formData,
  loading,
  onInputChange,
  onSubmit,
  onCancel,
  submitText
}: {
  formData: FormData,
  loading: boolean,
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onSubmit: (e: React.FormEvent) => Promise<void>,
  onCancel: () => void,
  submitText: string
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="name">Full Name</Label>
      <Input
        id="name"
        value={formData.name}
        onChange={onInputChange}
        placeholder="John Doe"
        required
        autoComplete="off"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        value={formData.email}
        onChange={onInputChange}
        placeholder="john@example.com"
        required
        autoComplete="off"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="phone">Phone</Label>
      <Input
        id="phone"
        value={formData.phone}
        onChange={onInputChange}
        placeholder="+1234567890"
        required
        autoComplete="off"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="position">Position</Label>
      <Input
        id="position"
        value={formData.position}
        onChange={onInputChange}
        placeholder="Hair Stylist"
        required
        autoComplete="off"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="joinDate">Join Date</Label>
      <Input
        id="joinDate"
        type="date"
        value={formData.joinDate}
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

export default function EmployeesPage() {
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const isSuperAdmin = user?.role === "superadmin";

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getEmployees();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch employees');
      }
      setEmployees(response.data);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError(err.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedEmployee(null);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const response = await createEmployee(formData);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create employee');
      }
      setIsAddDialogOpen(false);
      resetForm();
      await fetchEmployees();
    } catch (err: any) {
      console.error('Error adding employee:', err);
      setError(err.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    try {
      setLoading(true);
      setError("");
      const response = await updateEmployee(selectedEmployee._id, formData);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update employee');
      }
      setIsEditDialogOpen(false);
      resetForm();
      await fetchEmployees();
    } catch (err: any) {
      console.error('Error updating employee:', err);
      setError(err.message || "Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      setLoading(true);
      setError("");
      const response = await deleteEmployee(selectedEmployee._id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete employee');
      }
      setIsDeleteDialogOpen(false);
      resetForm();
      await fetchEmployees();
    } catch (err: any) {
      console.error('Error deleting employee:', err);
      setError(err.message || "Failed to delete employee");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      joinDate: new Date(employee.joinDate).toISOString().split('T')[0],
      isActive: employee.isActive
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  if (loading && !employees.length) {
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
              <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
              <p className="text-muted-foreground">
                Manage your parlour staff members
              </p>
            </div>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {isSuperAdmin && (
              <Dialog 
                open={isAddDialogOpen} 
                onOpenChange={(open) => {
                  setIsAddDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                  <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                    <DialogDescription>
                      Add a new employee to your parlour staff.
                    </DialogDescription>
                  </DialogHeader>
                  <EmployeeForm
                    formData={formData}
                    loading={loading}
                    onInputChange={handleInputChange}
                    onSubmit={handleAddEmployee}
                    onCancel={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}
                    submitText="Add Employee"
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  {isSuperAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee._id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      {new Date(employee.joinDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        employee.currentStatus === 'in' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.currentStatus.toUpperCase()}
                      </span>
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(employee)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(employee)}
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
          <Dialog 
            open={isEditDialogOpen} 
            onOpenChange={(open) => {
              setIsEditDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogContent onInteractOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>Edit Employee</DialogTitle>
                <DialogDescription>
                  Update employee information.
                </DialogDescription>
              </DialogHeader>
              <EmployeeForm
                formData={formData}
                loading={loading}
                onInputChange={handleInputChange}
                onSubmit={handleEditEmployee}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
                submitText="Update Employee"
              />
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Employee</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {selectedEmployee?.name}? This action cannot be undone.
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
                  onClick={handleDeleteEmployee}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete Employee"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 