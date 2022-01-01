class APIFeatures {
    constructor(query, queryString){
        this.query=query;
        this.queryString=queryString;
    }
    filter(){

        const queryObject= {...this.queryString}; //On a besoin d'une hard copie ici, d'ou le destructuring. C'est un objet
        const excludedFields = ["page", "sort", "limit", "fields"];
        excludedFields.forEach(element=> delete queryObject[element]);

        // Advanced Filtering
        
        let queryString = JSON.stringify(queryObject);
        queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}` );
        this.query= this.query.find(JSON.parse(queryString));
        return this;
    }

    sort(){

        if(this.queryString.sort) {
            const sortBy= this.queryString.sort.split(",").join(" ");
            this.query= this.query.sort(sortBy);
        } else {
            //Sort par défaut avec la date de création
            this.query= this.query.sort("-createdAt");
        }

        return this;
    }

    projection() {

        if(this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ");
            this.query=this.query.select(fields);
        } else {
            //Par défaut, on enlève les fields utilisées par mangoDB
            this.query=this.query.select("-__v");
        }

        return this;
    }

    paginate(){
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1|| 100;
        const skip = (page-1) * limit; //On a besoin de faire -1 parce que l'index n'est pas zero-based

        this.query= this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports=APIFeatures;