import { 
  type User, 
  type InsertUser, 
  type District, 
  type InsertDistrict,
  type Family,
  type InsertFamily,
  type Member,
  type InsertMember,
  type MemberWithRelations,
  type FamilyWithRelations,
  type DistrictWithStats
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // District methods
  getDistricts(): Promise<District[]>;
  getDistrict(id: string): Promise<District | undefined>;
  createDistrict(district: InsertDistrict): Promise<District>;
  updateDistrict(id: string, district: Partial<InsertDistrict>): Promise<District | undefined>;
  deleteDistrict(id: string): Promise<boolean>;
  getDistrictsWithStats(): Promise<DistrictWithStats[]>;

  // Family methods
  getFamilies(): Promise<Family[]>;
  getFamiliesByDistrict(districtId: string): Promise<Family[]>;
  getFamily(id: string): Promise<Family | undefined>;
  createFamily(family: InsertFamily): Promise<Family>;
  updateFamily(id: string, family: Partial<InsertFamily>): Promise<Family | undefined>;
  deleteFamily(id: string): Promise<boolean>;
  getFamiliesWithRelations(): Promise<FamilyWithRelations[]>;

  // Member methods
  getMembers(): Promise<Member[]>;
  getMembersWithRelations(): Promise<MemberWithRelations[]>;
  getMember(id: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, member: Partial<InsertMember>): Promise<Member | undefined>;
  deleteMember(id: string): Promise<boolean>;
  getMembersByFamily(familyId: string): Promise<Member[]>;
  
  // Statistics
  getStats(): Promise<{
    totalMembers: number;
    totalFamilies: number;
    totalDistricts: number;
    sudahBaptis: number;
    sudahSidi: number;
    sudahPerjamuan: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private districts: Map<string, District>;
  private families: Map<string, Family>;
  private members: Map<string, Member>;

  constructor() {
    this.users = new Map();
    this.districts = new Map();
    this.families = new Map();
    this.members = new Map();
    this.initSampleData();
  }

  private initSampleData() {
    // Create admin user
    const adminUser: User = {
      id: randomUUID(),
      username: "admin",
      password: "admin123" // In production, this should be hashed
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample districts
    const district1: District = {
      id: randomUUID(),
      name: "Rayon 1",
      description: "Rayon wilayah pertama"
    };
    const district2: District = {
      id: randomUUID(),
      name: "Rayon 2", 
      description: "Rayon wilayah kedua"
    };
    const district3: District = {
      id: randomUUID(),
      name: "Rayon 3",
      description: "Rayon wilayah ketiga"
    };

    this.districts.set(district1.id, district1);
    this.districts.set(district2.id, district2);
    this.districts.set(district3.id, district3);

    // Create sample families
    const family1: Family = {
      id: randomUUID(),
      name: "KK Ndolu",
      districtId: district1.id
    };
    const family2: Family = {
      id: randomUUID(),
      name: "KK Kareri",
      districtId: district1.id
    };

    this.families.set(family1.id, family1);
    this.families.set(family2.id, family2);

    // Create sample members based on provided data
    const sampleMembers = [
      {
        namaLengkap: "Yohanis B. Ndolu",
        tempatLahir: "Nusaklain",
        tanggalLahir: "1963-01-26",
        jenisKelamin: "LAKI-LAKI",
        statusBaptis: "SUDAH",
        statusSidi: "SUDAH",
        peranKeluarga: "KEPALA KELUARGA",
        statusPerkawinan: "MENIKAH",
        pendidikan: "SMA",
        pekerjaan: "Wirausaha",
        statusPerjamuan: "SUDAH",
        keterangan: "Disabilitas",
        familyId: family1.id
      },
      {
        namaLengkap: "Selfince Tulle",
        tempatLahir: "Papela",
        tanggalLahir: "1971-02-15",
        jenisKelamin: "PEREMPUAN",
        statusBaptis: "SUDAH",
        statusSidi: "SUDAH",
        peranKeluarga: "ISTRI",
        statusPerkawinan: "MENIKAH",
        pendidikan: "SMP",
        pekerjaan: "Ibu Rumah Tangga",
        statusPerjamuan: "SUDAH",
        keterangan: "",
        familyId: family1.id
      },
      {
        namaLengkap: "Rudy B. Ndolu",
        tempatLahir: "Rote",
        tanggalLahir: "1997-02-25",
        jenisKelamin: "LAKI-LAKI",
        statusBaptis: "SUDAH",
        statusSidi: "SUDAH",
        peranKeluarga: "ANAK",
        statusPerkawinan: "BELUM",
        pendidikan: "S1",
        pekerjaan: "-",
        statusPerjamuan: "BELUM",
        keterangan: "",
        familyId: family1.id
      },
      {
        namaLengkap: "Ricky Ndolu",
        tempatLahir: "Nusaklain",
        tanggalLahir: "1991-05-19",
        jenisKelamin: "LAKI-LAKI",
        statusBaptis: "SUDAH",
        statusSidi: "SUDAH",
        peranKeluarga: "KEPALA KELUARGA",
        statusPerkawinan: "MENIKAH",
        pendidikan: "S1",
        pekerjaan: "Wirausaha",
        statusPerjamuan: "SUDAH",
        keterangan: "",
        familyId: family2.id
      },
      {
        namaLengkap: "Claudia Rambu Kareri",
        tempatLahir: "Kupang",
        tanggalLahir: "1991-10-08",
        jenisKelamin: "PEREMPUAN",
        statusBaptis: "SUDAH",
        statusSidi: "SUDAH",
        peranKeluarga: "ISTRI",
        statusPerkawinan: "MENIKAH",
        pendidikan: "SMA",
        pekerjaan: "Wirausaha",
        statusPerjamuan: "SUDAH",
        keterangan: "",
        familyId: family2.id
      }
    ];

    sampleMembers.forEach(memberData => {
      const member: Member = {
        id: randomUUID(),
        ...memberData
      };
      this.members.set(member.id, member);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // District methods
  async getDistricts(): Promise<District[]> {
    return Array.from(this.districts.values());
  }

  async getDistrict(id: string): Promise<District | undefined> {
    return this.districts.get(id);
  }

  async createDistrict(district: InsertDistrict): Promise<District> {
    const id = randomUUID();
    const newDistrict: District = { ...district, id };
    this.districts.set(id, newDistrict);
    return newDistrict;
  }

  async updateDistrict(id: string, district: Partial<InsertDistrict>): Promise<District | undefined> {
    const existing = this.districts.get(id);
    if (!existing) return undefined;
    
    const updated: District = { 
      ...existing, 
      ...district,
      description: district.description ?? existing.description
    };
    this.districts.set(id, updated);
    return updated;
  }

  async deleteDistrict(id: string): Promise<boolean> {
    return this.districts.delete(id);
  }

  async getDistrictsWithStats(): Promise<DistrictWithStats[]> {
    const districts = await this.getDistricts();
    const families = await this.getFamilies();
    const members = await this.getMembers();

    return districts.map(district => {
      const districtFamilies = families.filter(f => f.districtId === district.id);
      const districtMembers = members.filter(m => 
        districtFamilies.some(f => f.id === m.familyId)
      );

      return {
        ...district,
        familyCount: districtFamilies.length,
        memberCount: districtMembers.length
      };
    });
  }

  // Family methods
  async getFamilies(): Promise<Family[]> {
    return Array.from(this.families.values());
  }

  async getFamiliesByDistrict(districtId: string): Promise<Family[]> {
    return Array.from(this.families.values()).filter(f => f.districtId === districtId);
  }

  async getFamily(id: string): Promise<Family | undefined> {
    return this.families.get(id);
  }

  async createFamily(family: InsertFamily): Promise<Family> {
    const id = randomUUID();
    const newFamily: Family = { ...family, id };
    this.families.set(id, newFamily);
    return newFamily;
  }

  async updateFamily(id: string, family: Partial<InsertFamily>): Promise<Family | undefined> {
    const existing = this.families.get(id);
    if (!existing) return undefined;
    
    const updated: Family = { ...existing, ...family };
    this.families.set(id, updated);
    return updated;
  }

  async deleteFamily(id: string): Promise<boolean> {
    return this.families.delete(id);
  }

  async getFamiliesWithRelations(): Promise<FamilyWithRelations[]> {
    const families = await this.getFamilies();
    const members = await this.getMembers();

    return Promise.all(families.map(async family => {
      const district = await this.getDistrict(family.districtId);
      const familyMembers = members.filter(m => m.familyId === family.id);

      return {
        ...family,
        district: district!,
        memberCount: familyMembers.length
      };
    }));
  }

  // Member methods
  async getMembers(): Promise<Member[]> {
    return Array.from(this.members.values());
  }

  async getMembersWithRelations(): Promise<MemberWithRelations[]> {
    const members = await this.getMembers();
    
    return Promise.all(members.map(async member => {
      const family = await this.getFamily(member.familyId);
      const district = await this.getDistrict(family!.districtId);

      return {
        ...member,
        family: family!,
        district: district!
      };
    }));
  }

  async getMember(id: string): Promise<Member | undefined> {
    return this.members.get(id);
  }

  async createMember(member: InsertMember): Promise<Member> {
    const id = randomUUID();
    const newMember: Member = { ...member, id };
    this.members.set(id, newMember);
    return newMember;
  }

  async updateMember(id: string, member: Partial<InsertMember>): Promise<Member | undefined> {
    const existing = this.members.get(id);
    if (!existing) return undefined;
    
    const updated: Member = { 
      ...existing, 
      ...member,
      tempatLahir: member.tempatLahir ?? existing.tempatLahir,
      tanggalLahir: member.tanggalLahir ?? existing.tanggalLahir,
      pendidikan: member.pendidikan ?? existing.pendidikan,
      pekerjaan: member.pekerjaan ?? existing.pekerjaan,
      keterangan: member.keterangan ?? existing.keterangan
    };
    this.members.set(id, updated);
    return updated;
  }

  async deleteMember(id: string): Promise<boolean> {
    return this.members.delete(id);
  }

  async getMembersByFamily(familyId: string): Promise<Member[]> {
    return Array.from(this.members.values()).filter(m => m.familyId === familyId);
  }

  async getStats() {
    const members = await this.getMembers();
    const families = await this.getFamilies();
    const districts = await this.getDistricts();

    return {
      totalMembers: members.length,
      totalFamilies: families.length,
      totalDistricts: districts.length,
      sudahBaptis: members.filter(m => m.statusBaptis === "SUDAH").length,
      sudahSidi: members.filter(m => m.statusSidi === "SUDAH").length,
      sudahPerjamuan: members.filter(m => m.statusPerjamuan === "SUDAH").length,
    };
  }
}

export const storage = new MemStorage();
