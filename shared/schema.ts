import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email").notNull().unique(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

export const preferences = pgTable("preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  destination: text("destination"),
  specificCity: text("specific_city"),
  departureDate: text("departure_date"),
  returnDate: text("return_date"),
  adults: integer("adults").default(1),
  children: integer("children").default(0),
  infants: integer("infants").default(0),
  interests: text("interests").array(),
  accommodationType: text("accommodation_type"),
  starRating: text("star_rating"),
  transportType: text("transport_type"),
  departureCity: text("departure_city"),
  budget: text("budget"),
});

export const insertPreferenceSchema = createInsertSchema(preferences).omit({
  id: true,
});

export const travelPackages = pgTable("travel_packages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  destination: text("destination").notNull(),
  imageUrl: text("image_url"),
  rating: text("rating"),
  reviewCount: integer("review_count"),
  accommodationName: text("accommodation_name"),
  accommodationType: text("accommodation_type"),
  transportType: text("transport_type"),
  durationDays: integer("duration_days"),
  durationNights: integer("duration_nights"),
  experiences: text("experiences").array(),
  price: integer("price"),
  isRecommended: boolean("is_recommended").default(false),
  categories: text("categories").array(),
});

export const insertTravelPackageSchema = createInsertSchema(travelPackages).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Preference = typeof preferences.$inferSelect;
export type InsertPreference = z.infer<typeof insertPreferenceSchema>;
export type TravelPackage = typeof travelPackages.$inferSelect;
export type InsertTravelPackage = z.infer<typeof insertTravelPackageSchema>;
