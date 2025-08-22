import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertMemberSchema } from "@shared/schema";
import { authManager } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const memberFormSchema = insertMemberSchema.extend({
  tanggalLahir: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberFormSchema>;

interface MemberFormProps {
  member?: any;
  onClose: () => void;
}

export default function MemberForm({ member, onClose }: MemberFormProps) {
  const { toast } = useToast();
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      namaLengkap: "",
      tempatLahir: "",
      tanggalLahir: "",
      jenisKelamin: "LAKI-LAKI",
      statusBaptis: "BELUM",
      statusSidi: "BELUM",
      peranKeluarga: "KEPALA KELUARGA",
      statusPerkawinan: "BELUM",
      pendidikan: "",
      pekerjaan: "",
      statusPerjamuan: "BELUM",
      keterangan: "",
      familyId: "",
    },
  });

  // Load districts
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

  // Load families for selected district
  const { data: families = [] } = useQuery({
    queryKey: ['/api/families/by-district', selectedDistrictId],
    queryFn: async () => {
      if (!selectedDistrictId) return [];
      const response = await fetch(`/api/families/by-district/${selectedDistrictId}`, {
        headers: { 'Authorization': authManager.getAuthHeader() }
      });
      if (!response.ok) throw new Error('Failed to fetch families');
      return response.json();
    },
    enabled: !!selectedDistrictId
  });

  // Create member mutation
  const createMutation = useMutation({
    mutationFn: async (data: MemberFormData) => {
      return await apiRequest('POST', '/api/members', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Berhasil",
        description: "Jemaat berhasil ditambahkan"
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.message || "Gagal menambahkan jemaat"
      });
    }
  });

  // Update member mutation
  const updateMutation = useMutation({
    mutationFn: async (data: MemberFormData) => {
      return await apiRequest('PUT', `/api/members/${member.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Berhasil",
        description: "Jemaat berhasil diperbarui"
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.message || "Gagal memperbarui jemaat"
      });
    }
  });

  // Initialize form with member data if editing
  useEffect(() => {
    if (member) {
      const formData = {
        namaLengkap: member.namaLengkap || "",
        tempatLahir: member.tempatLahir || "",
        tanggalLahir: member.tanggalLahir || "",
        jenisKelamin: member.jenisKelamin || "LAKI-LAKI",
        statusBaptis: member.statusBaptis || "BELUM",
        statusSidi: member.statusSidi || "BELUM",
        peranKeluarga: member.peranKeluarga || "KEPALA KELUARGA",
        statusPerkawinan: member.statusPerkawinan || "BELUM",
        pendidikan: member.pendidikan || "",
        pekerjaan: member.pekerjaan || "",
        statusPerjamuan: member.statusPerjamuan || "BELUM",
        keterangan: member.keterangan || "",
        familyId: member.familyId || "",
      };
      
      form.reset(formData);
      setSelectedDistrictId(member.district?.id || "");
    }
  }, [member, form]);

  const onSubmit = (data: MemberFormData) => {
    if (member) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-member">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-800 border-b pb-2">
              Informasi Pribadi
            </h4>

            <FormField
              control={form.control}
              name="namaLengkap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap *</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-nama-lengkap" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="tempatLahir"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempat Lahir</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-tempat-lahir" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tanggalLahir"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Lahir</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-tanggal-lahir" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="jenisKelamin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Kelamin *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-jenis-kelamin">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LAKI-LAKI">Laki-laki</SelectItem>
                      <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="pendidikan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pendidikan Terakhir</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-pendidikan">
                          <SelectValue placeholder="Pilih Pendidikan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">-</SelectItem>
                        <SelectItem value="SD">SD</SelectItem>
                        <SelectItem value="SMP">SMP</SelectItem>
                        <SelectItem value="SMA">SMA</SelectItem>
                        <SelectItem value="D3">D3</SelectItem>
                        <SelectItem value="S1">S1</SelectItem>
                        <SelectItem value="S2">S2</SelectItem>
                        <SelectItem value="S3">S3</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pekerjaan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pekerjaan</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Contoh: Guru, Petani, dll" data-testid="input-pekerjaan" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Church and Family Information */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-800 border-b pb-2">
              Informasi Keluarga & Gereja
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="statusBaptis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Baptis</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status-baptis">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BELUM">Belum</SelectItem>
                        <SelectItem value="SUDAH">Sudah</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statusSidi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Sidi</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status-sidi">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BELUM">Belum</SelectItem>
                        <SelectItem value="SUDAH">Sudah</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="peranKeluarga"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peran dalam Keluarga</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-peran-keluarga">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="KEPALA KELUARGA">Kepala Keluarga</SelectItem>
                        <SelectItem value="ISTRI">Istri</SelectItem>
                        <SelectItem value="ANAK">Anak</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statusPerkawinan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Perkawinan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status-perkawinan">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BELUM">Belum Menikah</SelectItem>
                        <SelectItem value="MENIKAH">Menikah</SelectItem>
                        <SelectItem value="JANDA">Janda</SelectItem>
                        <SelectItem value="DUDA">Duda</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="statusPerjamuan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Perjamuan</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-status-perjamuan">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BELUM">Belum</SelectItem>
                      <SelectItem value="SUDAH">Sudah</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Rayon *</Label>
                <Select 
                  value={selectedDistrictId} 
                  onValueChange={(value) => {
                    setSelectedDistrictId(value);
                    form.setValue("familyId", ""); // Reset family selection
                  }}
                >
                  <SelectTrigger data-testid="select-rayon">
                    <SelectValue placeholder="Pilih Rayon" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district: any) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <FormField
                control={form.control}
                name="familyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keluarga (KK) *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-keluarga">
                          <SelectValue placeholder="Pilih Keluarga" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {families.map((family: any) => (
                          <SelectItem key={family.id} value={family.id}>
                            {family.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="keterangan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan Tambahan</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={3}
                      placeholder="Contoh: Disabilitas, Mahasiswa, Pensiunan, dll"
                      data-testid="textarea-keterangan"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            data-testid="button-cancel"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            data-testid="button-submit"
          >
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
