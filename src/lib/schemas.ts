import { z } from "zod";

export const phoneSchema = z.string().trim().regex(/^[+]?[0-9 ]{10,15}$/, "Enter a valid phone number");

export const CAB_ROUTES = {
  delhi_almora: "Delhi → Almora",
  chandigarh_almora: "Chandigarh → Almora",
} as const;
export type CabRoute = keyof typeof CAB_ROUTES;

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const cabSchema = z.object({
  route: z.enum(["delhi_almora", "chandigarh_almora"], { message: "Only Delhi–Almora and Chandigarh–Almora are available" }),
  travel_date: z.string().refine((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= todayISO(), "Choose today or a future date"),
  passengers: z.coerce.number().int().min(1).max(12),
  pickup_point: z.string().trim().min(3, "Enter a pickup point").max(200),
  phone: phoneSchema,
  notes: z.string().trim().max(500).default(""),
});

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  phone: phoneSchema,
  travel_date: z.string().optional().refine((d) => !d || d >= todayISO(), "Choose a future date"),
  travellers: z.coerce.number().int().min(1).max(20),
  message: z.string().trim().max(1000).default(""),
  kind: z.enum(["trip", "workation", "homestay"]).default("trip"),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(5, "Message is too short").max(2000),
});

export const signUpSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: phoneSchema,
  password: z.string().min(8, "At least 8 characters").max(72),
  role: z.enum(["customer", "partner", "driver"]),
});

export const homestaySchema = z.object({
  name: z.string().trim().min(3).max(120),
  village_id: z.string().uuid("Choose a village"),
  description: z.string().trim().min(20, "Describe your homestay (20+ characters)").max(2000),
  rooms: z.coerce.number().int().min(1).max(50),
  tariff_note: z.string().trim().max(200).default(""),
  amenities: z.string().trim().max(300).default(""),
});
