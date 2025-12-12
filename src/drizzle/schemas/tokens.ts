import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./users";

export const shareTokens = pgTable("share_tokens", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
});
