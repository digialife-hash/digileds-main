import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Holiday from "../models/Holiday.js";

dotenv.config();

const holidays = [
  // --- 2026 HOLIDAYS ---
  {
    name: "New Year's Day",
    date: "2026-01-01",
    type: "optional",
    description: "Celebration of the New Year. Category: National",
    isPaid: true,
  },
  {
    name: "Lohri",
    date: "2026-01-13",
    type: "optional",
    description: "Harvest festival celebrating the end of winter. Category: Sikh/Regional",
    isPaid: true,
  },
  {
    name: "Makar Sankranti / Pongal",
    date: "2026-01-14",
    type: "optional",
    description: "Harvest festival dedicated to the Sun God. Category: Hindu/Regional",
    isPaid: true,
  },
  {
    name: "Basant Panchami",
    date: "2026-01-22",
    type: "optional",
    description: "Festival dedicated to Goddess Saraswati. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Republic Day",
    date: "2026-01-26",
    type: "public",
    description: "Celebrating the adoption of the Constitution of India. Category: National",
    isPaid: true,
  },
  {
    name: "Maha Shivratri",
    date: "2026-02-15",
    type: "festival",
    description: "The Great Night of Lord Shiva. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Holi",
    date: "2026-03-04",
    type: "festival",
    description: "Festival of colors celebrating spring. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Eid-ul-Fitr",
    date: "2026-03-21",
    type: "festival",
    description: "Islamic festival marking the end of Ramadan. Tentative, subject to moon sighting. Category: Muslim",
    isPaid: true,
  },
  {
    name: "Ram Navami",
    date: "2026-03-27",
    type: "optional",
    description: "Celebrating the birth of Lord Rama. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Mahavir Jayanti",
    date: "2026-03-31",
    type: "optional",
    description: "Celebrating the birth of Lord Mahavira. Category: Jain",
    isPaid: true,
  },
  {
    name: "Hanuman Jayanti",
    date: "2026-04-02",
    type: "optional",
    description: "Celebrating the birth of Lord Hanuman. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Good Friday",
    date: "2026-04-03",
    type: "public",
    description: "Commemoration of the crucifixion of Jesus Christ. Category: Christian",
    isPaid: true,
  },
  {
    name: "Easter Sunday",
    date: "2026-04-05",
    type: "optional",
    description: "Celebrating the resurrection of Jesus Christ. Category: Christian",
    isPaid: true,
  },
  {
    name: "Labour Day",
    date: "2026-05-01",
    type: "optional",
    description: "Honoring the working class and laborers. Category: National",
    isPaid: true,
  },
  {
    name: "Buddha Purnima",
    date: "2026-05-01",
    type: "optional",
    description: "Celebrating the birth and enlightenment of Gautama Buddha. Category: Buddhist",
    isPaid: true,
  },
  {
    name: "Eid-ul-Adha (Bakrid)",
    date: "2026-05-27",
    type: "festival",
    description: "Feast of the Sacrifice. Tentative, subject to moon sighting. Category: Muslim",
    isPaid: true,
  },
  {
    name: "Muharram",
    date: "2026-06-26",
    type: "optional",
    description: "Islamic New Year. Tentative, subject to moon sighting. Category: Muslim",
    isPaid: true,
  },
  {
    name: "Independence Day",
    date: "2026-08-15",
    type: "public",
    description: "Celebrating freedom from British rule in 1947. Category: National",
    isPaid: true,
  },
  {
    name: "Raksha Bandhan",
    date: "2026-08-28",
    type: "optional",
    description: "Celebrating the bond between brothers and sisters. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Krishna Janmashtami",
    date: "2026-09-04",
    type: "optional",
    description: "Celebrating the birth of Lord Krishna. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Milad-un-Nabi",
    date: "2026-09-05",
    type: "optional",
    description: "Birthday of Prophet Muhammad. Tentative, subject to moon sighting. Category: Muslim",
    isPaid: true,
  },
  {
    name: "Ganesh Chaturthi",
    date: "2026-09-15",
    type: "optional",
    description: "Welcoming Lord Ganesha. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Gandhi Jayanti",
    date: "2026-10-02",
    type: "public",
    description: "Celebrating the birthday of Mahatma Gandhi. Category: National",
    isPaid: true,
  },
  {
    name: "Navratri Start",
    date: "2026-10-12",
    type: "optional",
    description: "Nine nights dedicated to Goddess Durga. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Dussehra",
    date: "2026-10-20",
    type: "public",
    description: "Victory of Good over Evil (Lord Rama over Ravana). Category: Hindu",
    isPaid: true,
  },
  {
    name: "Karwa Chauth",
    date: "2026-10-29",
    type: "optional",
    description: "Wives fast for their husbands' longevity. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Diwali",
    date: "2026-11-08",
    type: "public",
    description: "Festival of Lights. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Govardhan Puja",
    date: "2026-11-09",
    type: "optional",
    description: "Worship of Govardhan Hill. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Bhai Dooj",
    date: "2026-11-10",
    type: "optional",
    description: "Sisters pray for brothers' long life. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Chhath Puja",
    date: "2026-11-15",
    type: "optional",
    description: "Thanksgiving festival to the Sun God. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Guru Nanak Jayanti",
    date: "2026-11-24",
    type: "public",
    description: "Celebrating the birth of Guru Nanak. Category: Sikh",
    isPaid: true,
  },
  {
    name: "Christmas Day",
    date: "2026-12-25",
    type: "public",
    description: "Celebrating the birth of Jesus Christ. Category: Christian",
    isPaid: true,
  },

  // --- 2027 HOLIDAYS ---
  {
    name: "New Year's Day (2027)",
    date: "2027-01-01",
    type: "optional",
    description: "Celebration of the New Year. Category: National",
    isPaid: true,
  },
  {
    name: "Lohri (2027)",
    date: "2027-01-13",
    type: "optional",
    description: "Harvest festival celebrating the end of winter. Category: Sikh/Regional",
    isPaid: true,
  },
  {
    name: "Makar Sankranti / Pongal (2027)",
    date: "2027-01-15",
    type: "optional",
    description: "Harvest festival dedicated to the Sun God. Category: Hindu/Regional",
    isPaid: true,
  },
  {
    name: "Republic Day (2027)",
    date: "2027-01-26",
    type: "public",
    description: "Celebrating the adoption of the Constitution of India. Category: National",
    isPaid: true,
  },
  {
    name: "Basant Panchami (2027)",
    date: "2027-02-11",
    type: "optional",
    description: "Festival dedicated to Goddess Saraswati. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Maha Shivratri (2027)",
    date: "2027-03-06",
    type: "festival",
    description: "The Great Night of Lord Shiva. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Eid-ul-Fitr (2027)",
    date: "2027-03-10",
    type: "festival",
    description: "Islamic festival marking the end of Ramadan. Tentative, subject to moon sighting. Category: Muslim",
    isPaid: true,
  },
  {
    name: "Holi (2027)",
    date: "2027-03-22",
    type: "festival",
    description: "Festival of colors celebrating spring. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Good Friday (2027)",
    date: "2027-03-26",
    type: "public",
    description: "Commemoration of the crucifixion of Jesus Christ. Category: Christian",
    isPaid: true,
  },
  {
    name: "Easter Sunday (2027)",
    date: "2027-03-28",
    type: "optional",
    description: "Celebrating the resurrection of Jesus Christ. Category: Christian",
    isPaid: true,
  },
  {
    name: "Ram Navami (2027)",
    date: "2027-04-14",
    type: "optional",
    description: "Celebrating the birth of Lord Rama. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Mahavir Jayanti (2027)",
    date: "2027-04-19",
    type: "optional",
    description: "Celebrating the birth of Lord Mahavira. Category: Jain",
    isPaid: true,
  },
  {
    name: "Hanuman Jayanti (2027)",
    date: "2027-04-21",
    type: "optional",
    description: "Celebrating the birth of Lord Hanuman. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Labour Day (2027)",
    date: "2027-05-01",
    type: "optional",
    description: "Honoring the working class and laborers. Category: National",
    isPaid: true,
  },
  {
    name: "Eid-ul-Adha (Bakrid) (2027)",
    date: "2027-05-16",
    type: "festival",
    description: "Feast of the Sacrifice. Tentative, subject to moon sighting. Category: Muslim",
    isPaid: true,
  },
  {
    name: "Buddha Purnima (2027)",
    date: "2027-05-20",
    type: "optional",
    description: "Celebrating the birth and enlightenment of Gautama Buddha. Category: Buddhist",
    isPaid: true,
  },
  {
    name: "Muharram (2027)",
    date: "2027-06-15",
    type: "optional",
    description: "Islamic New Year. Tentative, subject to moon sighting. Category: Muslim",
    isPaid: true,
  },
  {
    name: "Milad-un-Nabi (2027)",
    date: "2027-08-15",
    type: "optional",
    description: "Birthday of Prophet Muhammad. Tentative, subject to moon sighting. Category: Muslim",
    isPaid: true,
  },
  {
    name: "Independence Day (2027)",
    date: "2027-08-15",
    type: "public",
    description: "Celebrating freedom from British rule in 1947. Category: National",
    isPaid: true,
  },
  {
    name: "Raksha Bandhan (2027)",
    date: "2027-08-17",
    type: "optional",
    description: "Celebrating the bond between brothers and sisters. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Krishna Janmashtami (2027)",
    date: "2027-08-25",
    type: "optional",
    description: "Celebrating the birth of Lord Krishna. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Ganesh Chaturthi (2027)",
    date: "2027-09-04",
    type: "optional",
    description: "Welcoming Lord Ganesha. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Navratri Start (2027)",
    date: "2027-10-01",
    type: "optional",
    description: "Nine nights dedicated to Goddess Durga. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Gandhi Jayanti (2027)",
    date: "2027-10-02",
    type: "public",
    description: "Celebrating the birthday of Mahatma Gandhi. Category: National",
    isPaid: true,
  },
  {
    name: "Dussehra (2027)",
    date: "2027-10-10",
    type: "public",
    description: "Victory of Good over Evil. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Karwa Chauth (2027)",
    date: "2027-10-18",
    type: "optional",
    description: "Wives fast for their husbands' longevity. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Diwali (2027)",
    date: "2027-10-29",
    type: "public",
    description: "Festival of Lights. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Govardhan Puja (2027)",
    date: "2027-10-30",
    type: "optional",
    description: "Worship of Govardhan Hill. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Bhai Dooj (2027)",
    date: "2027-10-31",
    type: "optional",
    description: "Sisters pray for brothers' long life. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Chhath Puja (2027)",
    date: "2027-11-04",
    type: "optional",
    description: "Thanksgiving festival to the Sun God. Category: Hindu",
    isPaid: true,
  },
  {
    name: "Guru Nanak Jayanti (2027)",
    date: "2027-11-14",
    type: "public",
    description: "Celebrating the birth of Guru Nanak. Category: Sikh",
    isPaid: true,
  },
  {
    name: "Christmas Day (2027)",
    date: "2027-12-25",
    type: "public",
    description: "Celebrating the birth of Jesus Christ. Category: Christian",
    isPaid: true,
  },
];

try {
  await connectDB();

  console.log("Seeding holidays into database...");

  for (const h of holidays) {
    const existing = await Holiday.findOne({ date: new Date(h.date) });
    if (!existing) {
      await Holiday.create({
        name: h.name,
        date: new Date(h.date),
        type: h.type,
        description: h.description,
        isPaid: h.isPaid,
        enabled: true,
      });
      console.log(`Added Holiday: ${h.name} on ${h.date}`);
    } else {
      console.log(`Skipped existing Holiday on date: ${h.date}`);
    }
  }

  console.log("Holiday seeding completed successfully!");
} catch (e) {
  console.error("Error seeding holidays:", e);
} finally {
  process.exit(0);
}
