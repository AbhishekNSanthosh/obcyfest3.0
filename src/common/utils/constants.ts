import { Event } from "@lib/types";

export const eventName = "ObcyFest 4.0";

export const semesters = [1, 3, 5, 7];

export const faqs: Faq[] = [
    {
        question: "What is Obcyfest?",
        answer:
            "Obcyfest is a tech fest organized by the Computer Science department, featuring workshops, competitions, and talks from industry experts.",
    },
    {
        question: "When will Obcyfest take place?",
        answer: "Obcyfest will be held from September 22 to September 26, 2025.",
    },
    {
        question: "How can I register for events?",
        answer:
            "You can register for events through our official website by filling out the registration form.",
    },
    {
        question: "Is there a participation fee?",
        answer:
            "Some events may have a participation fee, which will be mentioned during the registration process.",
    },
    {
        question: "Can I volunteer at Obcyfest?",
        answer:
            "Yes! We welcome volunteers to help us with organizing the events. Please reach out to us for more information.",
    },
];

export interface Faq {
    question: string;
    answer: string;
}

export const events: Event[] = [
    {
        id: "craft-the-screen",
        title: "Craft The Screen",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register1",
        type: "technical",
        date: "22-09-2025",
        description: "The UI/UX Competition provides a platform for participants to demonstrate their design skills by creating intuitive, functional, and aesthetically appealing user interfaces. It emphasizes innovation, usability, and creativity in delivering effective digital experiences.",
        venue: "Computer Centre",
        eventType: "Group (2-3)",
        maxParticipation: "25 Teams",
        minParticipation: "10 Teams",
        registrationFee: "150/-",
        firstPrize: "900/-",
        secondPrize: "600/-",
        coordinators: [
            { name: "Alfred Joe Devasia - S7", phone: "919876543210" },
            { name: "Uday Krishna - S7", phone: "919876543210" }
        ]
    },
    {
        id: "just-imagine",
        title: "Just Imagine",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register2",
        type: "nonTechnical",
        date: "22-09-2025",
        description: "'Just Imagine' is an exciting and fun-filled event designed to test creativity, quick thinking, and teamwork. In this game, participants will pair up in teams of two. One member will pick a chit and act out the word or phrase without speaking or lip-syncing, while the other member guesses within a time limit of 2 minutes. The challenge lies in how creatively and accurately the actions are performed and how quickly the partner can guess.",
        venue: "S5/S6 CSE",
        eventType: "Group (2)",
        maxParticipation: "35 Teams",
        minParticipation: "20 Teams",
        registrationFee: "50/-",
        firstPrize: "600/-",
        secondPrize: "400/-",
        coordinators: [
            { name: "Safna M S- S7", phone: "919876543210" },
            { name: "Ardra S Anil- S7", phone: "919876543210" }
        ]
    },
    {
        id: "clash-of-keyboards",
        title: "Clash of Keyboards",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register3",
        type: "technical",
        date: "23-09-2025",
        description: "Put your typing skills to the test in the Speed & Accuracy competition! This event is designed to challenge participants on both their typing speed and precision. Whether you're a beginner or a typing pro, this is your chance to showcase your expertise, improve your skills, and compete with others in a fast-paced, fun, and engaging environment.",
        venue: "Computer Centre",
        eventType: "Individual",
        maxParticipation: "60 participants",
        minParticipation: "20 participants",
        registrationFee: "30/-",
        firstPrize: "500/-",
        secondPrize: "250/-",
        coordinators: [
            { name: "Nandhu Krishnan- S5", phone: "919876543210" },
            { name: "Athul Tomy- S5", phone: "919876543210" }
        ]
    },
    {
        id: "deadshot",
        title: "DeadShot",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register4",
        type: "technical",
        date: "23-09-2025",
        description: "'Deadshot.io', a high-stakes online arena where precision, strategy, and quick reflexes determine the ultimate sharpshooter. Players from around the world face off in a tense battle of aim and stealth, using an array of powerful weapons to outmaneuver and eliminate their opponents. Each match is a test of skill and nerve, set in dynamic environments that challenge even the most seasoned veterans. One by one, players are picked off-not by chance, but by calculated skill-until only the last marksman standing claims victory and the title of Deadshot.",
        venue: "Department Lab 3",
        eventType: "Group (4)",
        maxParticipation: "20 Teams",
        minParticipation: "15 teams",
        registrationFee: "100/-",
        firstPrize: "1000/-",
        secondPrize: "500/-",
        coordinators: [
            { name: "Jacs J Jacob - S7 CSE", phone: "919876543210" },
            { name: "Deepak Dayanandhan - S7 CSE", phone: "919876543210" }
        ]
    },
    {
        id: "the-riddle-crusade",
        title: "The Riddle Crusade",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register5",
        type: "nonTechnical",
        date: "23-09-2025",
        description: "Step into a world of secrets, riddles, and hidden truths. A group of friends once shared unbreakable bonds, but betrayal tore them apart, leaving a trail of lies buried in the shadows. Now, someone new, you, has stumbled upon this tangled web and must navigate the maze of deception, solving riddles, unraveling hidden codes, and facing the final guardian. Will you uncover the truth behind the betrayal, or be lost forever in the labyrinth of lies?",
        venue: "S3/S4 CSE A",
        eventType: "Group (2-3)",
        maxParticipation: "20 Teams",
        minParticipation: "15 participants",
        registrationFee: "100/-",
        firstPrize: "1000/-",
        secondPrize: "500/-",
        coordinators: [
            { name: "Hellan Raichel Benoy - S5", phone: "919876543210" },
            { name: "Khulood Salam - S5", phone: "919876543210" }
        ]
    },
    {
        id: "prompt-to-image",
        title: "Prompt To Image",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register6",
        type: "technical",
        date: "24-09-2025",
        description: "Prompt to Image is a creative game where players are shown an image and must write a text prompt describing it. Using this prompt, they generate a similar image, testing their observation, description, and creativity skills. The game encourages imagination, attention to detail, and artistic thinking, making it fun and engaging for participants.",
        venue: "Computer Centre",
        eventType: "Individual",
        maxParticipation: "60 participants",
        minParticipation: "40 participants",
        registrationFee: "30/-",
        firstPrize: "600/-",
        secondPrize: "400/-",
        coordinators: [
            { name: "Akshay U - S3 CSE B", phone: "919876543210" },
            { name: "Akshay V - S3 CSE B", phone: "919876543210" },
            { name: "Akshaya A - S3 CSE B", phone: "919876543210" }
        ]
    },
    {
        id: "last-of-us",
        title: "Last Of Us",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register7",
        type: "nonTechnical",
        date: "24-09-2025",
        description: "'Last of Us', A thrilling campus competition where classic Kerala games decide who outsmarts, outplays, and outlasts the rest. From childhood favorites to tricky challenges, each round tests skill, teamwork, and wit. One by one, contestants are eliminated-not by violence, but by the rules of the game-until only the Last of Us remains.",
        venue: "Carmel Auditorium",
        eventType: "Individual",
        maxParticipation: "100 participants",
        minParticipation: "50 participants",
        registrationFee: "30/-",
        firstPrize: "Subject to the number of participants.",
        coordinators: [
            { name: "Amal J Anand  S3 CSE A", phone: "919876543210" },
            { name: "Anwin Anto - S3 CSE A", phone: "919876543210" },
            { name: "Savio Ibrahim lype - S3 CSE A", phone: "919876543210" },
            { name: "Tessa Maria Saj - S3 CSE A", phone: "919876543210" }
        ]
    },
    {
        id: "code-in-the-blanks",
        title: "Code In The Blanks",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register8",
        type: "technical",
        date: "25-09-2025",
        description: "This event is a three-level coding challenge where participants must complete code snippets by filling in the missing operators, delimiters, or both. Each level grows more difficult, testing both speed and accuracy.",
        venue: "Computer Centre",
        eventType: "Group",
        maxParticipation: "25 Teams",
        minParticipation: "10 Teams",
        registrationFee: "70/-",
        firstPrize: "750/-",
        secondPrize: "500/-",
        coordinators: [
            { name: "Shaima Yousaf - S5 CSE", phone: "919876543210" },
            { name: "Neha Agnus P.S - S5 CSE", phone: "919876543210" }
        ]
    },
    {
        id: "the-stampede",
        title: "The Stampede",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register9",
        type: "nonTechnical",
        date: "25-09-2025",
        description: "We've all seen at events, these little stands having a stamp and you collect five of those by doing some task and then get to the end, to get a prize. The Stampede is just that. There is a play on words in the title as well. So, there will be 4 stands with tasks, increasing in difficulty of course, and should you complete the task, you will get a stamp. If you successfully collect all of the stamps, you get a prize at the end, or maybe play another game to win that prize as well.",
        venue: "S3/S4 CSE",
        eventType: "Individual",
        maxParticipation: "60 participants",
        minParticipation: "35 participants",
        registrationFee: "30/-",
        firstPrize: "600/-",
        secondPrize: "400/-",
        coordinators: [
            { name: "Niharika - S1 CSE B", phone: "919876543210" },
            { name: "Mariya - S1 CSE B", phone: "919876543210" }
        ]
    },
    {
        id: "techstorm",
        title: "Techstorm (Technical Debate)",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register10",
        type: "technical",
        date: "26-09-2025",
        description: "Techstorm is the arena where logic, teamwork, and technology shape the ultimate clash. Two teams face off on a technical topic, armed with logic, facts and quick thinking.points are scored not just for strong arguments, but for teamwork, bold first moves, and sharp, valid points. Round after Round, only the team with the sharpest wit and Strongest unity can ride the techstorm to victory.",
        venue: "S5/S6 CSE",
        eventType: "Group (3-4)",
        maxParticipation: "25 Teams",
        minParticipation: "10 Teams",
        registrationFee: "100/-",
        firstPrize: "600/-",
        secondPrize: "400/-",
        coordinators: [
            { name: "Aravind B - S3 CSE A", phone: "919876543210" },
            { name: "Unnikrishnan A - S3 CSE A", phone: "919876543210" }
        ]
    },
    {
        id: "emoji-story-decode",
        title: "Emoji Story Decode",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register11",
        type: "nonTechnical",
        date: "26-09-2025",
        description: "Emoji Story Decode is a game where players guess the story or phrase represented by a series of emojis. Players are shown a series of emojis that represent a story, phrase, or movie. Players must decode the emojis and guess the correct answer.",
        venue: "CSE Project Lab",
        eventType: "Group (2)",
        maxParticipation: "20 Teams",
        minParticipation: "15 Teams",
        registrationFee: "70/-",
        firstPrize: "600/-",
        secondPrize: "400/-",
        coordinators: [
            { name: "Akshay A - S3 CSE B", phone: "919876543210" },
            { name: "Pavithra Sankar - S3 CSE B", phone: "919876543210" }
        ]
    },
    {
        id: "pes",
        title: "PES",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register12",
        type: "nonTechnical",
        date: "22-09-2025 to 26-09-2025",
        description: "Step onto the virtual pitch and showcase your football skills in this competitive PES tournament. Test your strategy, reflexes, and precision as you go head-to-head with fellow gamers in the ultimate digital football experience.",
        eventType: "Individual",
        minParticipation: "16 participants",
        registrationFee: "30/-",
        firstPrize: "500/-",
        secondPrize: "250/-",
        coordinators: [
            { name: "Saheed Muhammed Rafi - S7", phone: "919876543210" },
            { name: "Ajilash - S7", phone: "919876543210" }
        ]
    },
    {
        id: "photography",
        title: "Photography",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register13",
        type: "nonTechnical",
        date: "22-09-2025 to 26-09-2025",
        description: "Unleash your creativity behind the lens and capture moments that speak louder than words. The Photography competition encourages participants to showcase their perspective, originality, and storytelling through powerful visuals.",
        eventType: "Individual",
        minParticipation: "25 participants",
        registrationFee: "30/-",
        firstPrize: "500/-",
        secondPrize: "250/-",
        coordinators: [
            { name: "Alan Sabu - S5 CSE", phone: "919876543210" },
            { name: "Melvin K Roy - S5 CSE", phone: "919876543210" }
        ]
    },
    {
        id: "bgmi",
        title: "BGMI",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register14",
        type: "nonTechnical",
        date: "22-09-2025 to 26-09-2025",
        description: "Gear up for an action-packed BGMI competition where teamwork, strategy, and quick decision-making are the keys to survival. Compete against the best and prove your dominance in this high-intensity battle royale challenge.",
        eventType: "Group (4)",
        minParticipation: "15 Teams",
        registrationFee: "70/-",
        firstPrize: "1000/-",
        secondPrize: "500/-",
        coordinators: [
            { name: "Adithyan S- S5 CSE", phone: "919876543210" },
            { name: "Sooraj Anil - S5 CSE", phone: "919876543210" },
            { name: "Razal Sajeem - S5 CSE", phone: "919876543210" },
            { name: "Abhidev Aji - S3 CSE B", phone: "919876543210" }
        ]
    },
    {
        id: "clash-of-clans",
        title: "Clash Of Clans",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register15",
        type: "nonTechnical",
        date: "22-09-2025 to 26-09-2025",
        description: "Build, strategize, and conquer in the world of Clash of Clans. This event challenges participants to demonstrate tactical planning, resource management, and execution skills to outsmart opponents and secure victory.",
        eventType: "Group (5)",
        minParticipation: "10 participants",
        registrationFee: "100/-",
        firstPrize: "600/-",
        secondPrize: "400/-",
        coordinators: [
            { name: "Abhinav s menon - S3 CSE A", phone: "919876543210" },
            { name: "Akhil krishnan - S3 CSE A", phone: "919876543210" },
            { name: "Anandhu krishna - S3 CSE A", phone: "919876543210" }
        ]
    },
    {
        id: "football",
        title: "Football",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register16",
        type: "sports",
        description: "N/A",
        eventType: "Group (7+3)",
        totalParticipation: "60 (fixed)",
        registrationFee: "100/-",
        firstPrize: "2000/-",
        secondPrize: "1000/-",
        coordinators: [
            { name: "Aadith C Joseph - S7 CSE", phone: "919876543210" }
        ]
    }
];