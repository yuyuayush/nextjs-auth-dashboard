import { pgTable, text, timestamp, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { user } from "./users";

export const mapSession = pgTable("map_session", {
    id: text("id").primaryKey(),
    createdBy: text("created_by").notNull().references(() => user.id, { onDelete: "cascade" }),
    active: boolean("active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mapMarkers = pgTable("map_markers", {
    id: text("id").primaryKey(),
    sessionId: text("session_id").notNull().references(() => mapSession.id, { onDelete: "cascade" }),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    type: text("type").notNull(), // 'pin', 'user', 'shop'
    label: text("label"),
    createdBy: text("created_by").notNull().references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mapParticipants = pgTable("map_participants", {
    id: text("id").primaryKey(),
    sessionId: text("session_id").notNull().references(() => mapSession.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    status: text("status").default('pending').notNull(), // 'pending', 'approved'
    lastUpdated: timestamp("last_updated").defaultNow(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
});
