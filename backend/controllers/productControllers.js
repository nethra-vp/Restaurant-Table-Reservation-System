import { cloudinary } from "../config/cloudinary.js" //2:24:40 - different import statement used
import productModel from '../models/productModels.js'

const addProduct = async (req, res) => {
    try {
        const {name, price, description, category} = req.body
        const image = req.file;
        let imageUrl = ""

        if (image) {
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ 
                resource_type: "image" }, 
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            stream.end(image.buffer); 
        });

        imageUrl = result.secure_url;
        }
        
        else {
            imageUrl = "https://via.placeholder.com/150"
        }

        const productData = {
            name, description, category, price: Number(price),
            image: imageUrl,
            date: Date.now()
        }

        console.log(productData);

        const product = new productModel(productData)
        await product.save()

        res.json({success:true, message: "Product added successfully"})
    } catch(error) {
        console.log(error);
        res.json({success:false, message: "Cannot add product"})
    }

}   

const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({})
        res.json({success:true, products})
    } catch(error) {
        console.log(error);
        res.json({success:true, message: error.message})
    }
}

const removeProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body._id)
        res.json({success: true, message: "Product removed"})
    } catch (error) {
        console.log(error);
        res.json({success:true, message: error.message})
    }
}

const singleProduct = async (req, res) => {
    
}

export {addProduct , listProducts, removeProduct, singleProduct}