import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { CheckCircle, XCircle, Clock, User, MapPin, Phone, Mail } from "lucide-react";
// Remove unused import

interface Doctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  province: string;
  city: string;
  hpcsaNumber: string;
  practiceAddress: string;
  bio: string;
  isVerified: boolean;
  rating: string;
  reviewCount: number;
  consultationFee: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata: string;
}

interface Stats {
  totalDoctors: number;
  totalPatients: number;
  totalBookings: number;
  averageRating: number;
}

export default function Admin() {
  useActivityLogger('admin');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'notifications' | 'stats'>('pending');

  // Fetch pending doctors with real-time polling
  const { data: pendingDoctors = [], isLoading: loadingPending } = useQuery<Doctor[]>({
    queryKey: ['/api/crm/doctors/pending'],
    enabled: activeTab === 'pending',
    refetchInterval: 3000, // Poll every 3 seconds for real-time updates
  });

  // Fetch notifications with real-time polling
  const { data: notifications = [], isLoading: loadingNotifications } = useQuery<Notification[]>({
    queryKey: ['/api/crm/notifications'],
    enabled: activeTab === 'notifications',
    refetchInterval: 5000, // Poll every 5 seconds for new notifications
  });

  // Fetch stats with periodic updates
  const { data: stats, isLoading: loadingStats } = useQuery<Stats>({
    queryKey: ['/api/crm/stats'],
    enabled: activeTab === 'stats',
    refetchInterval: 10000, // Poll every 10 seconds for updated stats
  });

  // Doctor approval mutation
  const approveDoctor = useMutation({
    mutationFn: async ({ doctorId, isVerified, notes }: { doctorId: string; isVerified: boolean; notes?: string }) => {
      const response = await fetch(`/api/crm/doctors/${doctorId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified, notes }),
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/doctors/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/stats'] });
      toast({
        title: variables.isVerified ? "Doctor Approved" : "Doctor Rejected",
        description: `Dr. ${data.doctor?.firstName || 'Unknown'} ${data.doctor?.lastName || 'Doctor'} has been ${variables.isVerified ? 'approved' : 'rejected'}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update doctor status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDoctorAction = (doctorId: string, isVerified: boolean) => {
    const notes = isVerified 
      ? "HPCSA verification completed successfully. Account approved for platform use."
      : "Additional verification required. Please contact support for more information.";
    
    approveDoctor.mutate({ doctorId, isVerified, notes });
  };

  const renderPendingDoctors = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Pending Doctor Approvals
        </h2>
        <Badge variant="secondary">
          {pendingDoctors.length} pending
        </Badge>
      </div>

      {loadingPending ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading pending doctors...</p>
        </div>
      ) : pendingDoctors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              All caught up!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No doctors pending approval at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingDoctors.map((doctor) => (
            <Card key={doctor.id} className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                        {doctor.firstName[0]}{doctor.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <Badge variant="outline">{doctor.specialty}</Badge>
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Verification
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>HPCSA: {doctor.hpcsaNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{doctor.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{doctor.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{doctor.city}, {doctor.province}</span>
                    </div>
                    <div className="text-sm">
                      <strong>Practice:</strong> {doctor.practiceAddress}
                    </div>
                    <div className="text-sm">
                      <strong>Fee:</strong> R{doctor.consultationFee}
                    </div>
                  </div>
                </div>
                
                {doctor.bio && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Bio:</strong> {doctor.bio}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    onClick={() => handleDoctorAction(doctor.id, true)}
                    disabled={approveDoctor.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid={`button-approve-${doctor.id}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Doctor
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDoctorAction(doctor.id, false)}
                    disabled={approveDoctor.isPending}
                    data-testid={`button-reject-${doctor.id}`}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        System Notifications
      </h2>

      {loadingNotifications ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading notifications...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            let metadata;
            try {
              metadata = JSON.parse(notification.metadata);
            } catch {
              metadata = {};
            }
            
            return (
              <Card key={notification.id} className={`${!notification.isRead ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {notification.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {metadata.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs">High Priority</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {notification.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        Platform Statistics
      </h2>

      {loadingStats ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading statistics...</p>
        </div>
      ) : stats ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Doctors</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{stats.totalDoctors}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Patients</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.totalPatients}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Bookings</CardDescription>
              <CardTitle className="text-3xl text-purple-600">{stats.totalBookings}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Rating</CardDescription>
              <CardTitle className="text-3xl text-orange-600">
                {stats.averageRating.toFixed(1)}★
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      ) : (
        <div>No stats available</div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <BackButton />
          
          <div className="mb-8 mt-6">
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage doctor approvals and monitor platform activity
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8">
            <Button
              variant={activeTab === 'pending' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('pending')}
              data-testid="tab-pending"
            >
              Pending Approvals
            </Button>
            <Button
              variant={activeTab === 'notifications' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('notifications')}
              data-testid="tab-notifications"
            >
              Notifications
            </Button>
            <Button
              variant={activeTab === 'stats' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('stats')}
              data-testid="tab-stats"
            >
              Statistics
            </Button>
          </div>

          {/* Tab Content */}
          {activeTab === 'pending' && renderPendingDoctors()}
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'stats' && renderStats()}
        </div>
      </div>
    </div>
  );
}