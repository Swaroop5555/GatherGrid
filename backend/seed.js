
const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");

const connectDB = require("./config/db");

const EventCategory = require("./models/EventCategory");
const Event = require("./models/Event");

const seedData = async () => {
    try {
        await connectDB();

        await Event.deleteMany({});
        await EventCategory.deleteMany({});

        const categoryData = [
            {
                name: "Birthday",
                slug: "birthday",
                description: "Celebrate memorable birthdays with customized themes, decoration, food and entertainment.",
                icon: "cake",
                sortOrder: 1
            },
            {
                name: "Marriage",
                slug: "marriage",
                description: "Plan beautiful weddings with mandap decoration, catering, photography and complete coordination.",
                icon: "heart",
                sortOrder: 2
            },
            {
                name: "Office Party",
                slug: "office-party",
                description: "Organize corporate celebrations, annual parties and professional gatherings.",
                icon: "briefcase",
                sortOrder: 3
            },
            {
                name: "House Warming",
                slug: "house-warming",
                description: "Celebrate your new home with traditional decoration, catering and hospitality.",
                icon: "house",
                sortOrder: 4
            },
            {
                name: "Anniversary Ceremony",
                slug: "anniversary",
                description: "Create romantic and memorable anniversary celebrations.",
                icon: "heart",
                sortOrder: 5
            },
            {
                name: "Gathering Party",
                slug: "gathering-party",
                description: "Plan reunions, family gatherings and private get-togethers.",
                icon: "users",
                sortOrder: 6
            },
            {
                name: "Retirement Event",
                slug: "retirement-event",
                description: "Celebrate professional achievements and memorable career journeys.",
                icon: "award",
                sortOrder: 7
            }
        ];

        const categories = await EventCategory.insertMany(
            categoryData
        );

        const categoryMap = {};

        categories.forEach((category) => {
            categoryMap[category.slug] = category._id;
        });

        const events = [
            {
                title: "Birthday Celebration",
                slug: "birthday-celebration",
                category: categoryMap["birthday"],
                shortDescription: "Milestone celebrations with custom themes and entertainment.",
                description: "Create an unforgettable birthday celebration with customized stage decoration, delicious food, professional photography, music and complete event coordination.",
                image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3",
                estimatedDuration: "4-6 hours",
                startingPrice: 15000,
                isFeatured: true,
                tags: ["Birthday", "Party", "Decoration"],
                services: [
                    {
                        name: "Stage Decoration",
                        description: "Customize your birthday stage and backdrop.",
                        options: ["Flower Decoration", "Balloon Decoration", "Theme Decoration"],
                        startingPrice: 3000
                    },
                    {
                        name: "Catering",
                        description: "Food arrangements for your guests.",
                        options: ["Veg Only", "Veg & Non-Veg", "Custom Menu"],
                        startingPrice: 250
                    },
                    {
                        name: "Photography",
                        description: "Professional event photography and video.",
                        options: ["Photography", "Videography", "Both"],
                        startingPrice: 5000
                    },
                    {
                        name: "Music and DJ",
                        description: "Music setup and entertainment.",
                        options: ["DJ Setup", "Live Music", "Sound System"],
                        startingPrice: 4000
                    },
                    {
                        name: "Venue",
                        description: "Choose a suitable venue for your celebration.",
                        options: ["Indoor Hall", "Outdoor Venue", "Home Setup"],
                        startingPrice: 5000
                    }
                ],
                packages: [
                    {
                        name: "Basic",
                        description: "A simple and beautiful celebration.",
                        price: 15000,
                        features: [
                            "Basic balloon decoration",
                            "Food arrangements",
                            "Basic sound setup"
                        ]
                    },
                    {
                        name: "Premium",
                        description: "A complete birthday experience.",
                        price: 35000,
                        features: [
                            "Premium stage decoration",
                            "Photography",
                            "Custom catering",
                            "DJ setup"
                        ]
                    },
                    {
                        name: "Luxury",
                        description: "An elaborate customized celebration.",
                        price: 75000,
                        features: [
                            "Luxury flower decoration",
                            "Professional photography and video",
                            "Premium catering",
                            "Live entertainment",
                            "Venue arrangements"
                        ]
                    }
                ]
            },
            {
                title: "Grand Wedding Celebration",
                slug: "grand-wedding-celebration",
                category: categoryMap["marriage"],
                shortDescription: "Beautiful weddings with complete event management.",
                description: "Plan your wedding with customized mandap design, floral decoration, catering, photography and complete coordination.",
                image: "https://images.unsplash.com/photo-1519741497674-611481863552",
                estimatedDuration: "1-3 days",
                startingPrice: 150000,
                isFeatured: true,
                tags: ["Marriage", "Wedding", "Mandap"],
                services: [
                    {
                        name: "Mandap Decoration",
                        description: "Customized wedding stage and mandap.",
                        options: ["Traditional", "Floral", "Luxury"],
                        startingPrice: 30000
                    },
                    {
                        name: "Catering",
                        description: "Wedding food and hospitality.",
                        options: ["Veg", "Veg & Non-Veg", "Custom Menu"],
                        startingPrice: 500
                    },
                    {
                        name: "Photography",
                        description: "Wedding photo and cinematic video.",
                        options: ["Photography", "Cinematic Video", "Both"],
                        startingPrice: 20000
                    },
                    {
                        name: "Music",
                        description: "Wedding entertainment and sound.",
                        options: ["DJ", "Live Music", "Traditional Music"],
                        startingPrice: 10000
                    }
                ],
                packages: [
                    {
                        name: "Classic",
                        description: "Essential wedding arrangements.",
                        price: 150000,
                        features: ["Traditional mandap", "Catering", "Basic photography"]
                    },
                    {
                        name: "Premium",
                        description: "An enhanced wedding experience.",
                        price: 300000,
                        features: ["Floral mandap", "Premium catering", "Photo and video", "Music"]
                    },
                    {
                        name: "Luxury",
                        description: "Fully customized luxury wedding.",
                        price: 600000,
                        features: ["Luxury mandap", "Premium catering", "Cinematic photography", "Live entertainment"]
                    }
                ]
            },
            {
                title: "Corporate Office Party",
                slug: "corporate-office-party",
                category: categoryMap["office-party"],
                shortDescription: "Professional corporate celebrations and team events.",
                description: "Organize corporate events with professional stage production, catering, audio visual equipment and entertainment.",
                image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622",
                estimatedDuration: "4-8 hours",
                startingPrice: 50000,
                isFeatured: true,
                tags: ["Corporate", "Office", "Business"],
                services: [
                    {
                        name: "Stage and AV",
                        options: ["LED Screen", "Professional Sound", "Stage Setup"],
                        startingPrice: 15000
                    },
                    {
                        name: "Catering",
                        options: ["Veg", "Veg & Non-Veg", "Buffet"],
                        startingPrice: 500
                    },
                    {
                        name: "Photography",
                        options: ["Photography", "Videography"],
                        startingPrice: 8000
                    },
                    {
                        name: "Entertainment",
                        options: ["DJ", "Live Band", "Team Games"],
                        startingPrice: 10000
                    }
                ],
                packages: [
                    {
                        name: "Standard",
                        price: 50000,
                        features: ["Basic stage", "Catering", "Sound setup"]
                    },
                    {
                        name: "Premium",
                        price: 100000,
                        features: ["LED stage", "Premium catering", "Photography", "DJ"]
                    }
                ]
            }
        ];

        await Event.insertMany(events);

        console.log("GatherGrid sample data inserted successfully!");

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error("Seeding failed:", error);

        await mongoose.connection.close();
        process.exit(1);
    }
};

seedData();
