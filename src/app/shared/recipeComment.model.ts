export class RecipeComment {
    name: string;
    comment: string;
    date: string;
    constructor(name: string, comment: string) {
        this.name = name;
        this.comment = comment;
        this.date = new Date().toLocaleDateString("en-GB");
     }
}