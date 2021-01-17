require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./db');

const app = express();

const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// GET ALL RESTURANTS
app.get('/api/v1/resturants', async(req,res) => {
    try{
        // const results = await db.query("SELECT * FROM resturants");
        const resturantRatingData = await db.query("select * from resturants left join (select resturant_id,COUNT(*),TRUNC(AVG(rating),1) as average_rating from reviews group by resturant_id) reviews on resturants.id = reviews.resturant_id;");
        // console.log(results)
        // console.log(resturantRatingData)

        return res.status(200).json({
            status: "Success",
            results: resturantRatingData.rows.length, 
            data: {
                resturant: resturantRatingData.rows,
            },
        });
    }
    catch(err){
        console.log(err);
    }
});

// GET RESTURANT BY ID
app.get('/api/v1/resturants/:id',async(req,res) => {
    
    try{
        const id = req.params.id;
        const resturant = await db.query("select * from resturants left join (select resturant_id,COUNT(*),TRUNC(AVG(rating),1) as average_rating from reviews group by resturant_id) reviews on resturants.id = reviews.resturant_id where id=$1",[id]);

        const reviews = await db.query("select * from reviews where resturant_id=$1",[id]);
        return res.status(200).json({
            status: "Success",
            results: resturant.rows.length, 
            data: {
                resturant: resturant.rows[0],
                reviews: reviews.rows
            },
        });
    }
    catch(err){
        console.log(err);
    }
});

// POST A RESTURANT
app.post('/api/v1/resturants',async(req,res) => {
    
    try{
        const results = await db.query('insert into resturants(name,location,price_range) VALUES ($1,$2,$3) returning *',[req.body.name,req.body.location,req.body.price_range]);
        return res.status(200).json({
            status: "Success",
            results: results.rows.length, 
            data: {
                resturant: results.rows[0],
            },
        });
    }catch(err){
        console.log(err);
    }

    
});

// UPDATE A RESTURANT
app.put('/api/v1/resturants/:id',async(req,res)=>{
    
    try{
        let id = req.params.id;
        const results = await db.query('update resturants set name=$1,location=$2,price_range=$3 where id=$4 returning *',[req.body.name,req.body.location,req.body.price_range,id]);
        res.status(200).json({
            'status': 'success',
            results: results.rows.length, 
            data: {
                resturant: results.rows,
            },
        });
    }catch(error){
        console.log(error);
    }
    
});

// DELETE A RESTURANT
app.delete('/api/v1/resturants/:id',async(req,res)=>{
    try{
        const results = db.query('Delete from resturants where id=$1',[req.params.id]);
        res.status(204).json({
            'status': 'success',
        });

    }catch(error){
        console.log(error);
    }
    
    
});


// POST FOR REVIEW
app.post("/api/v1/resturants/:id/addReview", async(req,res)=>{
    try{
        const newReview = await db.query("INSERT INTO reviews(resturant_id,name,review,rating) VALUES ($1,$2,$3,$4) returning *",[req.params.id,req.body.name,req.body.review,req.body.rating]);
        res.status(201).json({
            status: 'success',
            data:{
                review: newReview.rows[0]
            }
        });
    }catch(err){
        console.log(err);
    }
});

app.listen(process.env.PORT ||port, () => {
    console.log(`Server is up and running on ${port}`);
});