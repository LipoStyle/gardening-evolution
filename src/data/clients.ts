// src/data/clients.ts

// ---------- Types ----------
export type Payment = {
  month: string;   // e.g. "2025-10"
  paid: boolean;
};

export type Visit = {
  month: string;
  went: boolean;
  times: number;
};

export type Client = {
  id: number;
  name: string;
  surname: string;
  phone?: string;
  city: string;
  monthlyFeeEUR: number;
  payments: Payment[];
  visits: Visit[];
  jobs: string[];
  pesticides: string[];
  tools: string[];
  visitsRequired?: number;
};

// ---------- Helpers ----------
export const fmtMonth = (y: number, m: number) =>
  `${y}-${String(m).padStart(2, "0")}`;

export const GREEK_MONTHS = [
  "Ιαν", "Φεβ", "Μαρ", "Απρ", "Μαι", "Ιουν",
  "Ιουλ", "Αυγ", "Σεπ", "Οκτ", "Νοε", "Δεκ",
];

// Generate avatar initials or default male icon
export function avatarFor(c: Pick<Client, "name" | "surname">): string {
  const a = (c.name ?? "").trim().charAt(0).toUpperCase();
  const b = (c.surname ?? "").trim().charAt(0).toUpperCase();
  const initials = `${a}${b}`;
  return initials || "/images/avatar-male.png"; // default male icon
}

// ---------- Data ----------
export const clients: Client[] = [
  {
    id: 1,
    name: "Πέτρος",
    surname: "Μπίτσιος",
    phone: "+30 697 7230804",
    city: "Χρισσό",
    monthlyFeeEUR: 325,
    payments: [],
    visits: [],
    jobs: [],
    pesticides: [],
    tools: [],
  },
  {
    id: 2,
    name: "Ιάκωβος",
    surname: "Αλαφούζος",
    phone: "+30 …",
    city: "Γαλαξίδι",
    monthlyFeeEUR: 150,
    payments: [],
    visits: [],
    jobs: [],
    pesticides: [],
    tools: [],
  },
  {
    id: 3,
    name: "Thomas",
    surname: "Americanos",
    phone: "+30 …",
    city: "Γαλαξίδι",
    monthlyFeeEUR: 160,
    payments: [],
    visits: [],
    jobs: [],
    pesticides: [],
    tools: [],
  },
  {
    id: 4,
    name: "Μαρία",
    surname: "Στράους",
    phone: "+30 …",
    city: "Γαλαξίδι",
    monthlyFeeEUR: 250,
    payments: [],
    visits: [],
    jobs: [],
    pesticides: [],
    tools: [],
  },
  {
    id: 5,
    name: "Γιώργος",
    surname: "Σταυρόπουλος",
    phone: "+30 …",
    city: "Γαλαξίδι",
    monthlyFeeEUR: 100,
    payments: [],
    visits: [],
    jobs: [],
    pesticides: [],
    tools: [],
  },
  {
    id: 6,
    name: "Ηλίας",
    surname: "Ζαχαριάς",
    phone: "+30 …",
    city: "Γαλαξίδι",
    monthlyFeeEUR: 160,
    payments: [],
    visits: [],
    jobs: [],
    pesticides: [],
    tools: [],
  },
  {
    id: 7,
    name: "Γεωργία",
    surname: "Παπαμηχάλη",
    phone: "+30 …",
    city: "Γαλαξίδι",
    monthlyFeeEUR: 100,
    payments: [],
    visits: [],
    jobs: [],
    pesticides: [],
    tools: [],
  },
  {
    id: 8,
    name: "Μάγδα",
    surname: "Ντάντοβα",
    phone: "+30 …",
    city: "Γαλαξίδι",
    monthlyFeeEUR: 50,
    payments: [],
    visits: [],
    jobs: [],
    pesticides: [],
    tools: [],
  },
  {
    id: 9,
    name: "Λουτσία",
    surname: "Μπονότο",
    phone: "+30 …",
    city: "Γαλαξίδι",
    monthlyFeeEUR: 50,
    payments: [],
    visits: [],
    jobs: [],
    pesticides: [],
    tools: [],
  },
  {
    id: 10,
    name: "Θύμιος",
    surname: "Μητρόπουλος",
    phone: "+30 …",
    city: "Γαλαξίδι",
    monthlyFeeEUR: 350,
    payments: [],
    visits: [],
    jobs: [],
    pesticides: [],
    tools: [],
  },
  {
    id: 11,
    name: "Φάνης",
    surname: "Τσόνος",
    phone: "+30 …",
    city: "Βιδαβί",
    monthlyFeeEUR: 100,
    payments: [],
    visits: [],
    jobs: [],
    pesticides: [],
    tools: [],
  },
  {
    id: 12,
    name: "Μάρθα",
    surname: "—",
    phone: "+30 …",
    city: "Βιδαβί",
    monthlyFeeEUR: 350,
    payments: [],
    visits: [],
    jobs: [],
    pesticides: [],
    tools: [],
    visitsRequired: 0,
  },
  {
    id: 13,
    name: "Γιούλα",
    surname: "—",
    phone: "+30 …",
    city: "Άσπρα Σπίτια",
    monthlyFeeEUR: 150,
    payments: [],
    visits: [],
    jobs: [],
    pesticides: [],
    tools: [],
  },
  {
    id: 14,
    name: "Βασιλική",
    surname: "—",
    phone: "+30 …",
    city: "Λιβάδι",
    monthlyFeeEUR: 150,
    payments: [],
    visits: [],
    jobs: [],
    pesticides: [],
    tools: [],
  },
  {
    id: 15,
    name: "Ντίνος",
    surname: "—",
    phone: "+30 …",
    city: "Γαλαξίδι",
    monthlyFeeEUR: 50,
    payments: [],
    visits: [],
    jobs: [],
    pesticides: [],
    tools: [],
  },
  {
    id: 16,
    name: "Έφη",
    surname: "Τσίμα",
    phone: "+30 …",
    city: "Γαλαξίδι",
    monthlyFeeEUR: 100,
    payments: [],
    visits: [],
    jobs: [],
    pesticides: [],
    tools: [],
  },
];
