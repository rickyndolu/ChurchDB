import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDistrictSchema, insertFamilySchema, insertMemberSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Simple token validation - in production use proper JWT
    const token = authHeader.split(' ')[1];
    if (token !== 'valid-admin-token') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    next();
  };

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // In production, use proper JWT tokens
      res.json({ 
        user: { id: user.id, username: user.username }, 
        token: 'valid-admin-token' 
      });
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Stats route
  app.get('/api/stats', requireAuth, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  // District routes
  app.get('/api/districts', requireAuth, async (req, res) => {
    try {
      const districts = await storage.getDistrictsWithStats();
      res.json(districts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch districts' });
    }
  });

  app.post('/api/districts', requireAuth, async (req, res) => {
    try {
      const result = insertDistrictSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid district data', errors: result.error.errors });
      }
      
      const district = await storage.createDistrict(result.data);
      res.status(201).json(district);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create district' });
    }
  });

  app.put('/api/districts/:id', requireAuth, async (req, res) => {
    try {
      const result = insertDistrictSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid district data', errors: result.error.errors });
      }
      
      const district = await storage.updateDistrict(req.params.id, result.data);
      if (!district) {
        return res.status(404).json({ message: 'District not found' });
      }
      res.json(district);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update district' });
    }
  });

  app.delete('/api/districts/:id', requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteDistrict(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'District not found' });
      }
      res.json({ message: 'District deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete district' });
    }
  });

  // Family routes
  app.get('/api/families', requireAuth, async (req, res) => {
    try {
      const families = await storage.getFamiliesWithRelations();
      res.json(families);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch families' });
    }
  });

  app.get('/api/families/by-district/:districtId', requireAuth, async (req, res) => {
    try {
      const families = await storage.getFamiliesByDistrict(req.params.districtId);
      res.json(families);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch families by district' });
    }
  });

  app.post('/api/families', requireAuth, async (req, res) => {
    try {
      const result = insertFamilySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid family data', errors: result.error.errors });
      }
      
      const family = await storage.createFamily(result.data);
      res.status(201).json(family);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create family' });
    }
  });

  app.put('/api/families/:id', requireAuth, async (req, res) => {
    try {
      const result = insertFamilySchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid family data', errors: result.error.errors });
      }
      
      const family = await storage.updateFamily(req.params.id, result.data);
      if (!family) {
        return res.status(404).json({ message: 'Family not found' });
      }
      res.json(family);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update family' });
    }
  });

  app.delete('/api/families/:id', requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteFamily(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Family not found' });
      }
      res.json({ message: 'Family deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete family' });
    }
  });

  // Member routes
  app.get('/api/members', requireAuth, async (req, res) => {
    try {
      const members = await storage.getMembersWithRelations();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch members' });
    }
  });

  app.post('/api/members', requireAuth, async (req, res) => {
    try {
      const result = insertMemberSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid member data', errors: result.error.errors });
      }
      
      const member = await storage.createMember(result.data);
      res.status(201).json(member);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create member' });
    }
  });

  app.put('/api/members/:id', requireAuth, async (req, res) => {
    try {
      const result = insertMemberSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid member data', errors: result.error.errors });
      }
      
      const member = await storage.updateMember(req.params.id, result.data);
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update member' });
    }
  });

  app.delete('/api/members/:id', requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteMember(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Member not found' });
      }
      res.json({ message: 'Member deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete member' });
    }
  });

  // CSV Export
  app.get('/api/members/export/csv', requireAuth, async (req, res) => {
    try {
      const members = await storage.getMembersWithRelations();
      
      const csvHeaders = [
        'Nama Lengkap',
        'Tempat Lahir', 
        'Tanggal Lahir',
        'Jenis Kelamin',
        'Status Baptis',
        'Status Sidi', 
        'Peran Keluarga',
        'Status Perkawinan',
        'Pendidikan',
        'Pekerjaan',
        'Status Perjamuan',
        'Keterangan',
        'Keluarga',
        'Rayon'
      ].join(',');

      const csvRows = members.map(member => [
        member.namaLengkap,
        member.tempatLahir || '',
        member.tanggalLahir || '',
        member.jenisKelamin,
        member.statusBaptis,
        member.statusSidi,
        member.peranKeluarga,
        member.statusPerkawinan,
        member.pendidikan || '',
        member.pekerjaan || '',
        member.statusPerjamuan,
        member.keterangan || '',
        member.family.name,
        member.district.name
      ].map(field => `"${field.toString().replace(/"/g, '""')}"`).join(','));

      const csv = [csvHeaders, ...csvRows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="data_jemaat.csv"');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: 'Failed to export CSV' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
