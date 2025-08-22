import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, RefreshCw, Edit, Trash2 } from "lucide-react";
import { authManager } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MemberForm from "@/components/member-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function MembersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [rayonFilter, setRayonFilter] = useState("");
  const [baptisFilter, setBaptisFilter] = useState("");
  const [perjamuanFilter, setPerjamuanFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; member: any }>({ open: false, member: null });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['/api/members'],
    queryFn: async () => {
      const response = await fetch('/api/members', {
        headers: { 'Authorization': authManager.getAuthHeader() }
      });
      if (!response.ok) throw new Error('Failed to fetch members');
      return response.json();
    }
  });

  const { data: districts = [] } = useQuery({
    queryKey: ['/api/districts'],
    queryFn: async () => {
      const response = await fetch('/api/districts', {
        headers: { 'Authorization': authManager.getAuthHeader() }
      });
      if (!response.ok) throw new Error('Failed to fetch districts');
      return response.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return await apiRequest('DELETE', `/api/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Berhasil",
        description: "Jemaat berhasil dihapus"
      });
      setDeleteDialog({ open: false, member: null });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal menghapus jemaat"
      });
    }
  });

  const filteredMembers = members.filter((member: any) => {
    const matchesSearch = member.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRayon = !rayonFilter || rayonFilter === "all" || member.district.id === rayonFilter;
    const matchesBaptis = !baptisFilter || baptisFilter === "all" || member.statusBaptis === baptisFilter;
    const matchesPerjamuan = !perjamuanFilter || perjamuanFilter === "all" || member.statusPerjamuan === perjamuanFilter;
    
    return matchesSearch && matchesRayon && matchesBaptis && matchesPerjamuan;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setRayonFilter("all");
    setBaptisFilter("all");
    setPerjamuanFilter("all");
  };

  const handleEdit = (member: any) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDelete = (member: any) => {
    setDeleteDialog({ open: true, member });
  };

  const confirmDelete = () => {
    if (deleteDialog.member) {
      deleteMutation.mutate(deleteDialog.member.id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMember(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">Data Jemaat</h1>
            <p className="mt-1 text-sm text-gray-600" data-testid="page-subtitle">
              Kelola data anggota jemaat gereja
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button 
              onClick={() => setShowForm(true)}
              data-testid="button-add-member"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Jemaat
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Pencarian
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Cari nama..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rayon</label>
                <Select value={rayonFilter} onValueChange={setRayonFilter}>
                  <SelectTrigger data-testid="select-rayon">
                    <SelectValue placeholder="Semua Rayon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Rayon</SelectItem>
                    {districts.map((district: any) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Baptis</label>
                <Select value={baptisFilter} onValueChange={setBaptisFilter}>
                  <SelectTrigger data-testid="select-baptis">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="SUDAH">Sudah Baptis</SelectItem>
                    <SelectItem value="BELUM">Belum Baptis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Perjamuan</label>
                <Select value={perjamuanFilter} onValueChange={setPerjamuanFilter}>
                  <SelectTrigger data-testid="select-perjamuan">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="SUDAH">Sudah Perjamuan</SelectItem>
                    <SelectItem value="BELUM">Belum Perjamuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full"
                  data-testid="button-reset-filters"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Tempat, Tgl Lahir</TableHead>
                    <TableHead>JK</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Peran</TableHead>
                    <TableHead>Rayon/KK</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Tidak ada data jemaat
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member: any) => (
                      <TableRow key={member.id} data-testid={`row-member-${member.id}`}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {member.namaLengkap.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900" data-testid={`text-member-name-${member.id}`}>
                                {member.namaLengkap}
                              </div>
                              <div className="text-sm text-gray-500" data-testid={`text-member-job-${member.id}`}>
                                {member.pekerjaan || '-'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">{member.tempatLahir || '-'}</div>
                          <div className="text-sm text-gray-500">{formatDate(member.tanggalLahir)}</div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          {member.jenisKelamin === 'LAKI-LAKI' ? 'L' : 'P'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <Badge 
                              variant={member.statusBaptis === 'SUDAH' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              Baptis: {member.statusBaptis}
                            </Badge>
                            <Badge 
                              variant={member.statusPerjamuan === 'SUDAH' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              Perjamuan: {member.statusPerjamuan}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          {member.peranKeluarga}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">{member.district.name}</div>
                          <div className="text-sm text-gray-500">{member.family.name}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(member)}
                              data-testid={`button-edit-${member.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(member)}
                              className="text-red-600 hover:text-red-900"
                              data-testid={`button-delete-${member.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Member Form Modal */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? 'Edit Jemaat' : 'Tambah Jemaat Baru'}
              </DialogTitle>
            </DialogHeader>
            <MemberForm 
              member={editingMember} 
              onClose={handleFormClose}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, member: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus jemaat <strong>{deleteDialog.member?.namaLengkap}</strong>? 
                Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Batal</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
                data-testid="button-confirm-delete"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
