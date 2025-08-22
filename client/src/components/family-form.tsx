import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertFamilySchema } from "@shared/schema";
import { authManager } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type FamilyFormData = z.infer<typeof insertFamilySchema>;

interface FamilyFormProps {
  family?: any;
  onClose: () => void;
}

export default function FamilyForm({ family, onClose }: FamilyFormProps) {
  const { toast } = useToast();

  const form = useForm<FamilyFormData>({
    resolver: zodResolver(insertFamilySchema),
    defaultValues: {
      name: "",
      districtId: "",
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

  // Create family mutation
  const createMutation = useMutation({
    mutationFn: async (data: FamilyFormData) => {
      return await apiRequest('POST', '/api/families', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/families'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Berhasil",
        description: "Keluarga berhasil ditambahkan"
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.message || "Gagal menambahkan keluarga"
      });
    }
  });

  // Update family mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FamilyFormData) => {
      return await apiRequest('PUT', `/api/families/${family.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/families'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Berhasil",
        description: "Keluarga berhasil diperbarui"
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.message || "Gagal memperbarui keluarga"
      });
    }
  });

  // Initialize form with family data if editing
  useEffect(() => {
    if (family) {
      form.reset({
        name: family.name || "",
        districtId: family.districtId || "",
      });
    }
  }, [family, form]);

  const onSubmit = (data: FamilyFormData) => {
    if (family) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-family">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Keluarga *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Contoh: KK Ndolu"
                  data-testid="input-family-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="districtId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rayon *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-district">
                    <SelectValue placeholder="Pilih Rayon" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {districts.map((district: any) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-4">
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
