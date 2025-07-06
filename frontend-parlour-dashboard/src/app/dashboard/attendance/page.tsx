"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "../../../components/ui/ProtectedRoute";
import DashboardLayout from "../../../components/ui/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { io, Socket } from "socket.io-client";

// Mock data - replace with API calls
const mockLogs = [
  {
    id: "1",
    employeeName: "Sarah Johnson",
    action: "punch-in",
    timestamp: "2024-07-07T09:00:00.000Z",
  },
  {
    id: "2",
    employeeName: "Michael Chen",
    action: "punch-in",
    timestamp: "2024-07-07T09:15:00.000Z",
  },
  {
    id: "3",
    employeeName: "Sarah Johnson",
    action: "punch-out",
    timestamp: "2024-07-07T17:00:00.000Z",
  },
  {
    id: "4",
    employeeName: "Michael Chen",
    action: "punch-out",
    timestamp: "2024-07-07T17:30:00.000Z",
  },
];

interface AttendanceLog {
  id: string;
  employeeName: string;
  action: string;
  timestamp: string;
}

export default function DashboardAttendancePage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AttendanceLog[]>(mockLogs);
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
      socketInstance.emit("join-admin");
    });

    socketInstance.on("attendance-update", (data) => {
      if (data.type === "ATTENDANCE_UPDATE") {
        const newLog = {
          id: Date.now().toString(),
          employeeName: data.data.employee.name,
          action: data.data.log.action,
          timestamp: data.data.log.timestamp,
        };
        setLogs((prevLogs) => [newLog, ...prevLogs]);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(date);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "punch-in":
        return "text-green-600";
      case "punch-out":
        return "text-red-600";
      default:
        return "";
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance Logs</h1>
            <p className="text-muted-foreground">
              View real-time attendance records of all employees
            </p>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.employeeName}</TableCell>
                    <TableCell className={getActionColor(log.action)}>
                      {log.action === "punch-in" ? "Punch In" : "Punch Out"}
                    </TableCell>
                    <TableCell>{formatDate(log.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 