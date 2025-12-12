import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./users";
import { relations } from "drizzle-orm";

export const friendRequestStatus = pgEnum("friend_request_status", ["pending", "accepted", "rejected"]);

export const friendRequests = pgTable("friend_requests", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    senderId: text("sender_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    receiverId: text("receiver_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    status: friendRequestStatus("status").default("pending").notNull(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
});

export const friendRequestsRelations = relations(friendRequests, ({ one }) => ({
    sender: one(user, {
        fields: [friendRequests.senderId],
        references: [user.id],
        relationName: "sentFriendRequests",
    }),
    receiver: one(user, {
        fields: [friendRequests.receiverId],
        references: [user.id],
        relationName: "receivedFriendRequests",
    }),
}));
