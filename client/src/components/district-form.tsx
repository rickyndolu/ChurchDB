import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertDistrictSchema } from "@shared/schema";
import { authManager } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type DistrictFormData = z.infer<typeof insertDistrictSchema>;

interface DistrictFormProps {
  district?: any;
  onClose: () => void;
}

export default function DistrictForm({ district, onClose }: DistrictFormProps) {
  const { toast } = useToast();

  const form = useForm<DistrictFormData>({
    resolver: zodResolver(insertDistrictSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Create district mutation
  const createMutation = useMutation({
    mutationFn: async (data: DistrictFormData) => {
      return await apiRequest('POST', '/api/districts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/districts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Berhasil",
        description: "Rayon berhasil ditambahkan"
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.message || "Gagal menambahkan rayon"
      });
    }
  });

  // Update district mutation
  const updateMutation = useMutation({
    mutationFn: async (data: DistrictFormData) => {
      return await apiRequest('PUT', `/api/districts/${district.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/districts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Berhasil",
        description: "Rayon berhasil diperbarui"
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.message || "Gagal memperbarui rayon"
      });
    }
  });

  // Initialize form with district data if editing
  useEffect(() => {
    if (district) {
      form.reset({
        name: district.name || "",
        description: district.description || "",
      });
    }
  }, [district, form]);

  const onSubmit = (data: DistrictFormData) => {
    if (district) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-district">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Rayon *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Contoh: Rayon 1"
                  data-testid="input-district-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  value={field.value || ""}
                  rows={3}
                  placeholder="Deskripsi rayon (opsional)"
                  data-testid="textarea-district-description"
                />
              </FormControl>
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
