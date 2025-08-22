import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { authManager } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import FamilyForm from "@/components/family-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function FamiliesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingFamily, setEditingFamily] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; family: any }>({ open: false, family: null });

  const { data: families = [], isLoading } = useQuery({
    queryKey: ['/api/families'],
    queryFn: async () => {
      const response = await fetch('/api/families', {
        headers: { 'Authorization': authManager.getAuthHeader() }
      });
      if (!response.ok) throw new Error('Failed to fetch families');
      return response.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (familyId: string) => {
      return await apiRequest('DELETE', `/api/families/${familyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/families'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Berhasil",
        description: "Keluarga berhasil dihapus"
      });
      setDeleteDialog({ open: false, family: null });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal menghapus keluarga"
      });
    }
  });

  const filteredFamilies = families.filter((family: any) => 
    family.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.district.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (family: any) => {
    setEditingFamily(family);
    setShowForm(true);
  };

  const handleDelete = (family: any) => {
    setDeleteDialog({ open: true, family });
  };

  const confirmDelete = () => {
    if (deleteDialog.family) {
      deleteMutation.mutate(deleteDialog.family.id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingFamily(null);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">Data Keluarga</h1>
            <p className="mt-1 text-sm text-gray-600" data-testid="page-subtitle">
              Kelola data keluarga (Kepala Keluarga) dalam gereja
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button 
              onClick={() => setShowForm(true)}
              data-testid="button-add-family"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Keluarga
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="max-w-md">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Pencarian
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Cari nama keluarga atau rayon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Families Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Keluarga</TableHead>
                    <TableHead>Rayon</TableHead>
                    <TableHead>Jumlah Anggota</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : filteredFamilies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        {searchTerm ? 'Tidak ada data yang cocok' : 'Belum ada data keluarga'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFamilies.map((family: any) => (
                      <TableRow key={family.id} data-testid={`row-family-${family.id}`}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-green-600">
                                  {family.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900" data-testid={`text-family-name-${family.id}`}>
                                {family.name}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900" data-testid={`text-district-${family.id}`}>
                          {family.district.name}
                        </TableCell>
                        <TableCell className="text-sm text-gray-900" data-testid={`text-member-count-${family.id}`}>
                          {family.memberCount} anggota
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(family)}
                              data-testid={`button-edit-${family.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(family)}
                              className="text-red-600 hover:text-red-900"
                              data-testid={`button-delete-${family.id}`}
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

        {/* Family Form Modal */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingFamily ? 'Edit Keluarga' : 'Tambah Keluarga Baru'}
              </DialogTitle>
            </DialogHeader>
            <FamilyForm 
              family={editingFamily} 
              onClose={handleFormClose}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, family: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus keluarga <strong>{deleteDialog.family?.name}</strong>? 
                Tindakan ini tidak dapat dibatalkan dan akan menghapus semua anggota keluarga.
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
