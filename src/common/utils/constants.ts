type Event = {
    id: string;
    title: string;
    image: string;
    regLink: string;
    type: 'technical' | 'nonTechnical'; // Restrict type to 'technical' or 'nonTechnical'
  };
  

export const events: Event[] = [
    {
        id: "hackathon-2024",
        title: "Hackathon 2024",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register1",
        type: "technical",
    },
    {
        id: "tech-talk-series",
        title: "Tech Talk Series",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register2",
        type: "nonTechnical",
    },
    {
        id: "coding-competition",
        title: "Coding Competition",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register3",
        type: "technical",
    },
    {
        id: "design-workshop",
        title: "Design Workshop",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register4",
        type: "nonTechnical",
    },
    {
        id: "ai-ml-session",
        title: "AI/ML Session",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register5",
        type: "technical",
    },
    {
        id: "networking-event",
        title: "Networking Event",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register6",
        type: "nonTechnical",
    },
    {
        id: "cybersecurity-workshop",
        title: "Cybersecurity Workshop",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register7",
        type: "technical",
    },
    {
        id: "startup-pitch",
        title: "Startup Pitch",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register8",
        type: "nonTechnical",
    },
    {
        id: "web-dev-bootcamp",
        title: "Web Dev Bootcamp",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register9",
        type: "technical",
    },
    {
        id: "gaming-tournament",
        title: "Gaming Tournament",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register10",
        type: "nonTechnical",
    },
    {
        id: "mobile-app-dev",
        title: "Mobile App Development",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register11",
        type: "technical",
    },
    {
        id: "innovation-expo",
        title: "Innovation Expo",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register12",
        type: "nonTechnical",
    },
    {
        id: "data-science-workshop",
        title: "Data Science Workshop",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register13",
        type: "technical",
    },
    {
        id: "career-fair",
        title: "Career Fair",
        image: "/posters/poster.jpeg",
        regLink: "https://example.com/register14",
        type: "nonTechnical",
    },
];
