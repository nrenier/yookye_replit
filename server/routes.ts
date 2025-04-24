import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertPreferenceSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Get all travel packages
  app.get("/api/travel-packages", async (req, res) => {
    try {
      const packages = await storage.getTravelPackages();
      res.status(200).json(packages);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero dei pacchetti di viaggio" });
    }
  });

  // Get travel packages by category
  app.get("/api/travel-packages/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const packages = await storage.getTravelPackagesByCategory(category);
      res.status(200).json(packages);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero dei pacchetti di viaggio per categoria" });
    }
  });

  // Get a specific travel package
  app.get("/api/travel-packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const travelPackage = await storage.getTravelPackage(id);
      
      if (!travelPackage) {
        return res.status(404).json({ message: "Pacchetto di viaggio non trovato" });
      }
      
      res.status(200).json(travelPackage);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero del pacchetto di viaggio" });
    }
  });

  // Get user preferences
  app.get("/api/preferences", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Non autenticato" });
    }
    
    try {
      const userId = (req.user as Express.User).id;
      const preferences = await storage.getPreferencesByUserId(userId);
      res.status(200).json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero delle preferenze" });
    }
  });

  // Create preference
  app.post("/api/preferences", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Non autenticato" });
    }
    
    try {
      const userId = (req.user as Express.User).id;
      
      // Validate request body
      const parsedData = insertPreferenceSchema.parse({
        ...req.body,
        userId
      });
      
      const preference = await storage.createPreference(parsedData);
      res.status(201).json(preference);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dati non validi", errors: error.errors });
      }
      res.status(500).json({ message: "Errore nella creazione delle preferenze" });
    }
  });

  // Get recommendations based on preferences
  app.get("/api/recommendations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Non autenticato" });
    }
    
    try {
      const userId = (req.user as Express.User).id;
      const preferences = await storage.getPreferencesByUserId(userId);
      
      if (preferences.length === 0) {
        return res.status(404).json({ message: "Nessuna preferenza trovata" });
      }
      
      // Use the most recent preference for recommendations
      const latestPreference = preferences[preferences.length - 1];
      
      // Get all packages
      const allPackages = await storage.getTravelPackages();
      
      // Simple recommendation algorithm based on interests
      let recommendedPackages = allPackages;
      
      if (latestPreference.interests && latestPreference.interests.length > 0) {
        // Filter packages that match at least one interest
        recommendedPackages = allPackages.filter(pkg => 
          pkg.categories && 
          pkg.categories.some(category => 
            latestPreference.interests && latestPreference.interests.includes(category)
          )
        );
      }
      
      // Sort by relevance (number of matching interests)
      recommendedPackages.sort((a, b) => {
        const aMatches = a.categories && latestPreference.interests ? 
          a.categories.filter(cat => latestPreference.interests!.includes(cat)).length : 0;
        const bMatches = b.categories && latestPreference.interests ? 
          b.categories.filter(cat => latestPreference.interests!.includes(cat)).length : 0;
        
        return bMatches - aMatches;
      });
      
      // Return top 3 recommendations
      const topRecommendations = recommendedPackages.slice(0, 3);
      
      res.status(200).json(topRecommendations);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero delle raccomandazioni" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
