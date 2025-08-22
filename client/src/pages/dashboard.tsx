import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Home, MapPin, CheckCircle, Plus, Download, PieChart } from "lucide-react";
import { downloadCSV } from "@/lib/csv-export";
import { useToast } from "@/hooks/use-toast";
import { authManager } from "@/lib/auth";

export default function DashboardPage() {
  const { toast } = useToast();
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      const response = await fetch('/api/stats', {
        headers: {
          'Authorization': authManager.getAuthHeader()
        }
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['/api/members'],
    queryFn: async () => {
      const response = await fetch('/api/members', {
        headers: {
          'Authorization': authManager.getAuthHeader()
        }
      });
      if (!response.ok) throw new Error('Failed to fetch members');
      return response.json();
    }
  });

  const handleExportCSV = async () => {
    try {
      await downloadCSV();
      toast({
        title: "Export berhasil",
        description: "Data jemaat berhasil diexport ke CSV"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export gagal",
        description: "Terjadi kesalahan saat mengexport data"
      });
    }
  };

  const recentMembers = members?.slice(0, 3) || [];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600" data-testid="page-subtitle">
            Ringkasan statistik jemaat gereja
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Jemaat
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900" data-testid="stat-total-members">
                      {statsLoading ? "..." : stats?.totalMembers || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Home className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Keluarga
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900" data-testid="stat-total-families">
                      {statsLoading ? "..." : stats?.totalFamilies || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MapPin className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Rayon
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900" data-testid="stat-total-districts">
                      {statsLoading ? "..." : stats?.totalDistricts || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Sudah Baptis
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900" data-testid="stat-baptized">
                      {statsLoading ? "..." : stats?.sudahBaptis || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions and Recent Members */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                onClick={() => window.location.href = '/members'}
                data-testid="button-add-member"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Jemaat Baru
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleExportCSV}
                data-testid="button-export-csv"
              >
                <Download className="mr-2 h-4 w-4" />
                Ekspor Data CSV
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-generate-report"
              >
                <PieChart className="mr-2 h-4 w-4" />
                Laporan Statistik
              </Button>
            </CardContent>
          </Card>

          {/* Recent Members */}
          <Card>
            <CardHeader>
              <CardTitle>Jemaat Terbaru</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {membersLoading ? (
                <div className="text-sm text-gray-500">Memuat...</div>
              ) : recentMembers.length === 0 ? (
                <div className="text-sm text-gray-500">Belum ada data jemaat</div>
              ) : (
                recentMembers.map((member: any) => (
                  <div key={member.id} className="flex items-center space-x-3" data-testid={`member-${member.id}`}>
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {member.namaLengkap.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900" data-testid={`text-member-name-${member.id}`}>
                        {member.namaLengkap}
                      </p>
                      <p className="text-sm text-gray-500" data-testid={`text-member-location-${member.id}`}>
                        {member.district.name} - {member.family.name}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
