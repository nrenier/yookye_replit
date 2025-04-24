import { users, type User, type InsertUser, preferences, type Preference, type InsertPreference, travelPackages, type TravelPackage, type InsertTravelPackage } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Preference operations
  getPreference(id: number): Promise<Preference | undefined>;
  getPreferencesByUserId(userId: number): Promise<Preference[]>;
  createPreference(preference: InsertPreference): Promise<Preference>;
  updatePreference(id: number, preference: Partial<InsertPreference>): Promise<Preference>;
  
  // TravelPackage operations
  getTravelPackage(id: number): Promise<TravelPackage | undefined>;
  getTravelPackages(): Promise<TravelPackage[]>;
  getTravelPackagesByCategory(category: string): Promise<TravelPackage[]>;
  createTravelPackage(travelPackage: InsertTravelPackage): Promise<TravelPackage>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private preferences: Map<number, Preference>;
  private travelPackages: Map<number, TravelPackage>;
  
  userCurrentId: number;
  preferenceCurrentId: number;
  travelPackageCurrentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.preferences = new Map();
    this.travelPackages = new Map();
    
    this.userCurrentId = 1;
    this.preferenceCurrentId = 1;
    this.travelPackageCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Seed travel packages data
    this.seedTravelPackages();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getPreference(id: number): Promise<Preference | undefined> {
    return this.preferences.get(id);
  }
  
  async getPreferencesByUserId(userId: number): Promise<Preference[]> {
    return Array.from(this.preferences.values()).filter(
      (pref) => pref.userId === userId,
    );
  }
  
  async createPreference(insertPreference: InsertPreference): Promise<Preference> {
    const id = this.preferenceCurrentId++;
    const preference: Preference = { ...insertPreference, id };
    this.preferences.set(id, preference);
    return preference;
  }
  
  async updatePreference(id: number, updatedPreference: Partial<InsertPreference>): Promise<Preference> {
    const preference = await this.getPreference(id);
    if (!preference) {
      throw new Error(`Preference with id ${id} not found`);
    }
    
    const updated: Preference = { ...preference, ...updatedPreference };
    this.preferences.set(id, updated);
    return updated;
  }
  
  async getTravelPackage(id: number): Promise<TravelPackage | undefined> {
    return this.travelPackages.get(id);
  }
  
  async getTravelPackages(): Promise<TravelPackage[]> {
    return Array.from(this.travelPackages.values());
  }
  
  async getTravelPackagesByCategory(category: string): Promise<TravelPackage[]> {
    return Array.from(this.travelPackages.values()).filter(
      (pkg) => pkg.categories && pkg.categories.includes(category),
    );
  }
  
  async createTravelPackage(insertTravelPackage: InsertTravelPackage): Promise<TravelPackage> {
    const id = this.travelPackageCurrentId++;
    const travelPackage: TravelPackage = { ...insertTravelPackage, id };
    this.travelPackages.set(id, travelPackage);
    return travelPackage;
  }
  
  private seedTravelPackages() {
    const packages: InsertTravelPackage[] = [
      {
        title: "Weekend Culturale a Roma",
        description: "Un weekend alla scoperta della città eterna",
        destination: "Roma",
        imageUrl: "https://images.unsplash.com/photo-1499678329028-101435549a4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80",
        rating: "4.5",
        reviewCount: 120,
        accommodationName: "Hotel Artemide 4★",
        accommodationType: "Hotel",
        transportType: "Volo A/R da Milano",
        durationDays: 3,
        durationNights: 2,
        experiences: [
          "Visita guidata ai Musei Vaticani",
          "Tour gastronomico di Trastevere",
          "Biglietti salta-fila per il Colosseo"
        ],
        price: 650,
        isRecommended: true,
        categories: ["Storia e Arte", "Enogastronomia", "Vita Locale"]
      },
      {
        title: "Relax e Cultura in Toscana",
        description: "Un soggiorno rilassante immersi nella campagna toscana",
        destination: "Toscana",
        imageUrl: "https://images.unsplash.com/photo-1534445867742-43195f401b6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80",
        rating: "4.0",
        reviewCount: 98,
        accommodationName: "Agriturismo Il Poggio",
        accommodationType: "Agriturismo",
        transportType: "Auto a noleggio",
        durationDays: 5,
        durationNights: 4,
        experiences: [
          "Degustazione vini a Montalcino",
          "Visita guidata di Siena",
          "Corso di cucina toscana"
        ],
        price: 780,
        isRecommended: false,
        categories: ["Enogastronomia", "Salute e Benessere", "Vita Locale"]
      },
      {
        title: "Mare e Cultura in Costiera",
        description: "Un viaggio alla scoperta della costiera amalfitana",
        destination: "Costiera Amalfitana",
        imageUrl: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80",
        rating: "4.8",
        reviewCount: 156,
        accommodationName: "Hotel Belvedere 4★",
        accommodationType: "Hotel",
        transportType: "Treno A/R da Roma",
        durationDays: 6,
        durationNights: 5,
        experiences: [
          "Tour in barca di Capri",
          "Visita agli scavi di Pompei",
          "Lezione di cucina napoletana"
        ],
        price: 950,
        isRecommended: false,
        categories: ["Storia e Arte", "Enogastronomia", "Vita Locale"]
      },
      {
        title: "Avventura nelle Dolomiti",
        description: "Un'esperienza indimenticabile immersi nella natura",
        destination: "Dolomiti",
        imageUrl: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80",
        rating: "4.7",
        reviewCount: 89,
        accommodationName: "Mountain Lodge",
        accommodationType: "Rifugio",
        transportType: "Auto propria",
        durationDays: 4,
        durationNights: 3,
        experiences: [
          "Escursione guidata sul Monte Cristallo",
          "Mountain bike nei sentieri alpini",
          "Corso base di arrampicata"
        ],
        price: 580,
        isRecommended: false,
        categories: ["Sport", "Salute e Benessere"]
      },
      {
        title: "Benessere in Umbria",
        description: "Relax e natura nel cuore verde d'Italia",
        destination: "Umbria",
        imageUrl: "https://images.unsplash.com/photo-1531816458010-fb7685eecbcb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80",
        rating: "4.6",
        reviewCount: 102,
        accommodationName: "Borgo Spa Resort",
        accommodationType: "Resort",
        transportType: "Auto a noleggio",
        durationDays: 5,
        durationNights: 4,
        experiences: [
          "Percorso benessere con massaggio",
          "Yoga all'alba tra gli ulivi",
          "Escursione nei borghi medievali"
        ],
        price: 870,
        isRecommended: true,
        categories: ["Salute e Benessere", "Vita Locale"]
      },
      {
        title: "Food Tour in Emilia Romagna",
        description: "Un percorso gastronomico nella patria del gusto italiano",
        destination: "Emilia Romagna",
        imageUrl: "https://images.unsplash.com/photo-1528795259021-d8c86e14354c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80",
        rating: "4.9",
        reviewCount: 135,
        accommodationName: "Palazzo del Gusto",
        accommodationType: "B&B",
        transportType: "Treno A/R da Milano",
        durationDays: 4,
        durationNights: 3,
        experiences: [
          "Visita a un caseificio di Parmigiano Reggiano",
          "Corso di pasta fresca fatta in casa",
          "Tour con degustazione in acetaia tradizionale"
        ],
        price: 720,
        isRecommended: true,
        categories: ["Enogastronomia", "Vita Locale"]
      }
    ];
    
    packages.forEach(pkg => {
      this.createTravelPackage(pkg);
    });
  }
}

export const storage = new MemStorage();
