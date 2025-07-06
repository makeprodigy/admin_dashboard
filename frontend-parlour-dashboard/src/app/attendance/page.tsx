"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { io, Socket } from "socket.io-client";

// Mock data - replace with API calls
const mockEmployees = [
  {
    id: "1",
    name: "Sarah Johnson",
    position: "Senior Stylist",
    currentStatus: "out",
  },
  {
    id: "2",
    name: "Michael Chen",
    position: "Massage Therapist",
    currentStatus: "out",
  },
  {
    id: "3",
    name: "Emma Davis",
    position: "Nail Artist",
    currentStatus: "out",
  },
];

export default function AttendancePage() {
  const [employees, setEmployees] = useState(mockEmployees);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050", {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socketInstance.on("attendance-update", (data) => {
      if (data.type === "ATTENDANCE_UPDATE") {
        setEmployees((prevEmployees) =>
          prevEmployees.map((emp) =>
            emp.id === data.data.employee._id
              ? { ...emp, currentStatus: data.data.employee.currentStatus }
              : emp
          )
        );
      }
    });

    socketInstance.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handlePunchInOut = async (employeeId: string, currentStatus: string) => {
    try {
      const action = currentStatus === "out" ? "punch-in" : "punch-out";
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"}/api/attendance/punch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update attendance");
      }

      // Update will come through WebSocket
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">
          Punch in/out for employees
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employees.map((employee) => (
          <Card key={employee.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {employee.name}
              </CardTitle>
              {employee.currentStatus === "in" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-sm text-muted-foreground">
                {employee.position}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Status: {employee.currentStatus === "in" ? "Punched In" : "Punched Out"}
                  </span>
                </div>
                <Button
                  variant={employee.currentStatus === "in" ? "destructive" : "default"}
                  onClick={() => handlePunchInOut(employee.id, employee.currentStatus)}
                >
                  {employee.currentStatus === "in" ? "Punch Out" : "Punch In"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
} 