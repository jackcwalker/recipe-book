export class RecipeImage {
    public name: string;
    public path: string;
    public fullImagePath: string;
    public file: File;
    public toBeDeleted = false;
    public toBeCreated = false;

    constructor(
        path: string, 
    ) {
        this.path = path;
    }
}