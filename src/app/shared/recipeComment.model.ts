export class RecipeComment {
    name: string;
    comment: string;
    date = new Date();
    constructor(name: string, comment: string) {
        this.name = name,
        this.comment = comment
     }
}