export interface Post {
    title: string;
    permalink: string;
    category:{
        category: string;
        categoryId: string;
    };
    content: string;
    image: string;
    excerpt: string;
    isFeatured: boolean;
    views: number;
    status:string;
    createdAt: Date;
    userId: string;
}
