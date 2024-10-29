type Event = {
    image: string;
    regLink: string;
    type: 'technical' | 'nonTechnical'; // Restrict type to 'technical' or 'nonTechnical'
  };
  

export const events: Event[] = [
    {
        image: "/posters/hyperlink.jpeg",
        regLink: "https://forms.gle/ymhLjFfuViMD8WXG7",
        type: "nonTechnical",
    },
    {
        image: "/posters/byte.jpeg",
        regLink: "https://forms.gle/KJ4oRB5haZCom19C6",
        type: "technical",
    },
    {
        image: "/posters/snap.jpeg",
        regLink: "https://forms.gle/AWC5kBRonYNyTFLa6",
        type: "nonTechnical",
    },
    {
        image: "/posters/bgmi.jpeg",
        regLink: "https://forms.gle/GESigNH2zaKPdXVi9",
        type: "nonTechnical",
    },
    {
        image: "/posters/techdebate.jpeg",
        regLink: "https://forms.gle/8yXZLvrufp3jCxqT7",
        type: "technical",
    },
    {
        image: "/posters/efootball.jpeg",
        regLink: "https://forms.gle/m7RWmUurZ52B1iA59",
        type: "nonTechnical",
    },
    {
        image: "/posters/aiimagino.jpeg", // Same image link for all events
        regLink: "https://forms.gle/fa9qVRjVgM8CjVjR9",
        type: "technical",
    },
    {
        image: "/posters/sherlocked.jpeg",
        regLink: "https://forms.gle/abrtDU89iySScJaT7",
        type: "nonTechnical",
    },
    {
        image: "/posters/reel.jpeg",
        regLink: "https://forms.gle/hjkb47fC7R9DEpGY9",
        type: "nonTechnical",
    },
    {
        image: "/posters/clashofclans.jpeg",
        regLink: "https://forms.gle/xTnmJura8GrDSzXw5",
        type: "nonTechnical",
    },
    {
        image: "/posters/creative.jpeg",
        regLink: "https://forms.gle/i3paJYc4EqfEQCJe7",
        type: "technical",
    },
    {
        image: "/posters/nfs.jpeg",
        regLink: "https://forms.gle/jFXzrnKpb8X6Wrfp9",
        type: "nonTechnical",
    },
    {
        image: "/posters/cursor.jpeg",
        regLink: "https://forms.gle/q2rJ2eXxpEJiz2Mp7",
        type: "technical",
    },
    {
        image: "/posters/hangman.jpeg",
        regLink: "https://forms.gle/y1yW5S8JYukEYVzT7",
        type: "nonTechnical",
    },
];
