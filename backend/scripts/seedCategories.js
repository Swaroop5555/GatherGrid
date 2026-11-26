
import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import EventCategory from "../models/EventCategory.js";

const categories = [
    {
        name: "Marriage",
        slug: "marriage",
        description: "Marriage and wedding event planning services.",
        icon: "heart",
        sortOrder: 1
    },
    {
        name: "Birthday",
        slug: "birthday",
        description: "Birthday celebration and party planning services.",
        icon: "cake",
        sortOrder: 2
    },
    {
        name: "Anniversary",
        slug: "anniversary",
        description: "Anniversary celebration planning services.",
        icon: "gift",
        sortOrder: 3
    },
    {
        name: "Office Party",
        slug: "office-party",
        description: "Corporate events and office party planning.",
        icon: "briefcase",
        sortOrder: 4
    },
    {
        name: "Gathering Party",
        slug: "gathering-party",
        description: "Family and friends gathering event services.",
        icon: "users",
        sortOrder: 5
    },
    {
        name: "Retirement Party",
        slug: "retirement-party",
        description: "Retirement celebration planning services.",
        icon: "award",
        sortOrder: 6
    },
    {
        name: "House Warming",
        slug: "house-warming",
        description: "House warming ceremony and celebration services.",
        icon: "home",
        sortOrder: 7
    }
];

const seedCategories = async () => {
    try {
        await connectDB();

        for (const category of categories) {
            await EventCategory.updateOne(
                { slug: category.slug },
                { $set: category },
                { upsert: true }
            );
        }

        console.log("Event categories inserted successfully!");

        const allCategories = await EventCategory.find().sort({
            sortOrder: 1
        });

        console.log("Total categories:", allCategories.length);

    } catch (error) {
        console.error("Category seeding failed:", error);
    } finally {
        await mongoose.disconnect();
    }
};

seedCategories();
