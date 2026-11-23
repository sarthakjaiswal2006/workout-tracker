/**
 * seedUsers.js — Seeds 20 test users into the database with bcrypt-hashed passwords.
 * Run: node seedUsers.js
 * All users share password: password123
 */

import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, ".env") });

// Use the same prisma setup as the server
import prisma from "./server/lib/prisma.js";

const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = "password123";

const USERS = [
  { name: "John Doe",        email: "john.doe@fitness.com" },
  { name: "Jane Smith",      email: "jane.smith@gym.com" },
  { name: "Alex Brown",      email: "alex.brown@workout.com" },
  { name: "Priya Sharma",    email: "priya.sharma@fit.com" },
  { name: "Rahul Verma",     email: "rahul.verma@strongman.com" },
  { name: "Emily Davis",     email: "emily.davis@lifts.com" },
  { name: "Michael Jordan",  email: "michael.j@jumpman.com" },
  { name: "Ananya Kapoor",   email: "ananya.kapoor@yoga.com" },
  { name: "Liam Williams",   email: "liam.williams@gains.com" },
  { name: "Olivia Martinez", email: "olivia.m@cardio.com" },
  { name: "Rohan Mehta",     email: "rohan.mehta@beast.com" },
  { name: "Sneha Nair",      email: "sneha.nair@wellness.com" },
  { name: "Chris Evans",     email: "chris.evans@supersoldier.com" },
  { name: "Aarav Patel",     email: "aarav.patel@crossfit.com" },
  { name: "Zara Ahmed",      email: "zara.ahmed@pilates.com" },
  { name: "David Kim",       email: "david.kim@weightroom.com" },
  { name: "Nina Petrova",    email: "nina.petrova@powerlifter.com" },
  { name: "Kunal Singh",     email: "kunal.singh@shredded.com" },
  { name: "Maya Johnson",    email: "maya.johnson@hiit.com" },
  { name: "Lucas Ferreira",  email: "lucas.ferreira@strongfit.com" },
];

async function seed() {
  console.log("🌱 Starting seed — hashing passwords with bcrypt (rounds: " + SALT_ROUNDS + ")...\n");

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
  console.log("✅ Password hash ready\n");

  let created = 0;
  let skipped = 0;

  for (const userData of USERS) {
    try {
      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existing) {
        console.log(`⏭️  Skipped (already exists): ${userData.email}`);
        skipped++;
        continue;
      }

      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          passwordHash,
        },
      });

      console.log(`✅ Created: ${user.name} <${user.email}> — id: ${user.id}`);
      created++;
    } catch (error) {
      console.error(`❌ Failed to create ${userData.email}:`, error.message);
    }
  }

  console.log(`\n🎉 Seed complete! Created: ${created}, Skipped: ${skipped}`);
  console.log(`\n🔑 All users share password: "${DEFAULT_PASSWORD}"`);
  console.log("\n📋 Test login emails:");
  USERS.slice(0, 5).forEach((u) => console.log(`   ${u.email}`));
  console.log("   ... and 15 more\n");

  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
