import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Districts (Rayon) table
export const districts = pgTable("districts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
});

// Families (KK) table  
export const families = pgTable("families", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  districtId: varchar("district_id").notNull().references(() => districts.id),
});

// Members (Jemaat) table
export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  namaLengkap: text("nama_lengkap").notNull(),
  tempatLahir: text("tempat_lahir"),
  tanggalLahir: date("tanggal_lahir"),
  jenisKelamin: text("jenis_kelamin").notNull(), // LAKI-LAKI, PEREMPUAN
  statusBaptis: text("status_baptis").notNull().default("BELUM"), // SUDAH, BELUM
  statusSidi: text("status_sidi").notNull().default("BELUM"), // SUDAH, BELUM
  peranKeluarga: text("peran_keluarga").notNull(), // KEPALA KELUARGA, ISTRI, ANAK
  statusPerkawinan: text("status_perkawinan").notNull().default("BELUM"), // MENIKAH, JANDA, DUDA, BELUM
  pendidikan: text("pendidikan"),
  pekerjaan: text("pekerjaan"),
  statusPerjamuan: text("status_perjamuan").notNull().default("BELUM"), // SUDAH, BELUM
  keterangan: text("keterangan"),
  familyId: varchar("family_id").notNull().references(() => families.id),
});

// Insert schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDistrictSchema = createInsertSchema(districts).omit({
  id: true,
});

export const insertFamilySchema = createInsertSchema(families).omit({
  id: true,
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
}).extend({
  tanggalLahir: z.string().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDistrict = z.infer<typeof insertDistrictSchema>;
export type District = typeof districts.$inferSelect;

export type InsertFamily = z.infer<typeof insertFamilySchema>;
export type Family = typeof families.$inferSelect;

export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

// Extended types for API responses
export type MemberWithRelations = Member & {
  family: Family;
  district: District;
};

export type FamilyWithRelations = Family & {
  district: District;
  memberCount: number;
};

export type DistrictWithStats = District & {
  familyCount: number;
  memberCount: number;
};
