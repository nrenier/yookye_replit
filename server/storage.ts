import { users, type User, type InsertUser, preferences, type Preference, type InsertPreference, travelPackages, type TravelPackage, type InsertTravelPackage } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

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
  sessionStore: any; // Use 'any' to avoid the type error with session.Store
}

// DatabaseStorage that replaces MemStorage
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
    
    // Seed travel packages data
    this.seedTravelPackages();
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async getPreference(id: number): Promise<Preference | undefined> {
    const [preference] = await db.select().from(preferences).where(eq(preferences.id, id));
    return preference;
  }
  
  async getPreferencesByUserId(userId: number): Promise<Preference[]> {
    return await db.select().from(preferences).where(eq(preferences.userId, userId));
  }
  
  async createPreference(insertPreference: InsertPreference): Promise<Preference> {
    const [preference] = await db.insert(preferences).values(insertPreference).returning();
    return preference;
  }
  
  async updatePreference(id: number, updatedPreference: Partial<InsertPreference>): Promise<Preference> {
    const [preference] = await db
      .update(preferences)
      .set(updatedPreference)
      .where(eq(preferences.id, id))
      .returning();
    
    if (!preference) {
      throw new Error(`Preference with id ${id} not found`);
    }
    
    return preference;
  }
  
  async getTravelPackage(id: number): Promise<TravelPackage | undefined> {
    const [travelPackage] = await db.select().from(travelPackages).where(eq(travelPackages.id, id));
    return travelPackage;
  }
  
  async getTravelPackages(): Promise<TravelPackage[]> {
    return await db.select().from(travelPackages);
  }
  
  async getTravelPackagesByCategory(category: string): Promise<TravelPackage[]> {
    try {
      // PostgreSQL arrays use a different syntax for containment checks
      const result = await db.execute(
        `SELECT * FROM travel_packages WHERE $1 = ANY(categories)`,
        [category]
      );
      return result.rows as TravelPackage[];
    } catch (error) {
      console.error("Error fetching travel packages by category:", error);
      return []; // Return empty array on error
    }
  }
  
  async createTravelPackage(insertTravelPackage: InsertTravelPackage): Promise<TravelPackage> {
    const [travelPackage] = await db.insert(travelPackages).values(insertTravelPackage).returning();
    return travelPackage;
  }
  
  private async seedTravelPackages() {
    // Check if travel packages already exist
    const existingPackages = await db.select().from(travelPackages);
    if (existingPackages.length > 0) {
      return; // Already seeded
    }
    
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
    
    for (const pkg of packages) {
      await db.insert(travelPackages).values(pkg);
    }
  }
}

// Export an instance of DatabaseStorage for use in the application
export const storage = new DatabaseStorage();
