import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./users";
import { relations } from "drizzle-orm";

export const messages = pgTable("messages", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    senderId: text("sender_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    receiverId: text("receiver_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    attachmentUrl: text("attachment_url"),
    attachmentType: text("attachment_type"), // 'image', 'video', 'document', etc.
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
    sender: one(user, {
        fields: [messages.senderId],
        references: [user.id],
        relationName: "sentMessages",
    }),
    receiver: one(user, {
        fields: [messages.receiverId],
        references: [user.id],
        relationName: "receivedMessages",
    }),
}));
