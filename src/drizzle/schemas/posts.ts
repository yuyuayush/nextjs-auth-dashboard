import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./users";

export const posts = pgTable("posts", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    caption: text("caption"),
    isPublic: boolean("is_public").default(false).notNull(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
});

import { relations } from "drizzle-orm";

export const postsRelations = relations(posts, ({ one }) => ({
    user: one(user, {
        fields: [posts.userId],
        references: [user.id],
    }),
}));
